require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { setupDb } = require('./database');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'ubiri_fallback_secret_not_secure';

// Socket.io Logic
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let db;

async function initializeDb() {
  db = await setupDb();
  return db;
}

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ── Auth Routes ──
app.post('/api/signup', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit faire au moins 6 caractères'),
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('role').isIn(['client', 'worker']).withMessage('Rôle invalide')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, role, trade, city, lat, lng } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, trade, city, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, trade, city, lat, lng]
    );
    const user = { id: result.lastID, name, email, role };
    const token = jwt.sign(user, SECRET_KEY);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: 'Email déjà utilisé ou erreur serveur.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, SECRET_KEY);
  res.json({ user, token });
});

// ── Messaging Routes ──
app.get('/api/conversations', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  // Requête complexe pour obtenir les derniers messages de chaque conversation
  const conversations = await db.all(`
    SELECT 
      u.id as userId, 
      u.name as userName, 
      m.text, 
      m.image, 
      m.voice, 
      m.date,
      m.fromId,
      (SELECT COUNT(*) FROM messages WHERE fromId = u.id AND toId = ? AND read = 0) as unreadCount
    FROM users u
    JOIN messages m ON (m.fromId = u.id AND m.toId = ?) OR (m.fromId = ? AND m.toId = u.id)
    WHERE u.id != ?
    AND m.id = (
      SELECT id FROM messages 
      WHERE (fromId = u.id AND toId = ?) OR (fromId = ? AND toId = u.id)
      ORDER BY date DESC LIMIT 1
    )
    GROUP BY u.id
    ORDER BY m.date DESC
  `, [userId, userId, userId, userId, userId, userId]);
  
  res.json(conversations.map(c => ({
    user: { id: c.userId, name: c.userName },
    lastMessage: { text: c.text, image: c.image, voice: c.voice, date: c.date, fromId: c.fromId },
    unreadCount: c.unreadCount
  })));
});

app.get('/api/messages/:otherId', authenticateToken, async (req, res) => {
  const messages = await db.all(
    'SELECT * FROM messages WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?) ORDER BY date ASC',
    [req.user.id, req.params.otherId, req.params.otherId, req.user.id]
  );
  res.json(messages);
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  const { toId, text, image, voice } = req.body;
  const date = new Date().toISOString();
  await db.run(
    'INSERT INTO messages (fromId, toId, text, image, voice, date) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, toId, text, image, voice, date]
  );
    
  // Emit real-time message
  io.to(`user_${toId}`).emit('new_message', { fromId: req.user.id, text, image, voice, date });
    
  res.sendStatus(201);
});

// ── Products Routes ──
app.get('/api/products', async (req, res) => {
  const products = await db.all('SELECT * FROM products');
  res.json(products);
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, price, description, category, imageUrl } = req.body;
  await db.run(
    'INSERT INTO products (workerId, name, price, description, category, imageUrl) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, name, price, description, category, imageUrl]
  );
  res.sendStatus(201);
});

// ── Orders & Wallet Routes ──
app.get('/api/orders', authenticateToken, async (req, res) => {
  const orders = await db.all(
    'SELECT * FROM orders WHERE clientId = ? OR workerId = ?',
    [req.user.id, req.user.id]
  );
  res.json(orders);
});

app.post('/api/orders', [
  authenticateToken,
  body('workerId').isNumeric(),
  body('amount').isNumeric().custom(val => val > 0),
  body('serviceName').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { workerId, serviceId, amount, serviceName } = req.body;
  const id = `ORD-${Date.now()}`;
  const date = new Date().toISOString();
  await db.run(
    'INSERT INTO orders (id, clientId, workerId, serviceId, serviceName, amount, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, workerId, serviceId, serviceName, amount, 'escrow', date]
  );
  
  // Emit real-time notification to worker
  io.to(`user_${workerId}`).emit('new_order', { id, serviceName, amount });
  
  res.status(201).json({ id });
});

app.post('/api/orders/:id/complete', authenticateToken, async (req, res) => {
  const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  if (order.clientId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });

  await db.run('UPDATE orders SET status = "completed" WHERE id = ?', [order.id]);

  // Update Worker Wallet
  const netAmount = order.amount * 0.9;
  const wallet = await db.get('SELECT * FROM wallets WHERE userId = ?', [order.workerId]);
  
  if (wallet) {
    const transactions = JSON.parse(wallet.transactions);
    transactions.push({
      id: `TR-${Date.now()}`,
      amount: netAmount,
      type: 'income',
      description: `Service terminé : ${order.serviceName}`,
      date: new Date().toISOString(),
    });
    await db.run(
      'UPDATE wallets SET balance = balance + ?, transactions = ? WHERE userId = ?',
      [netAmount, JSON.stringify(transactions), order.workerId]
    );
  } else {
    const transactions = [{
      id: `TR-${Date.now()}`,
      amount: netAmount,
      type: 'income',
      description: `Service terminé : ${order.serviceName}`,
      date: new Date().toISOString(),
    }];
    await db.run(
      'INSERT INTO wallets (userId, balance, transactions) VALUES (?, ?, ?)',
      [order.workerId, netAmount, JSON.stringify(transactions)]
    );
  }

  res.sendStatus(200);
});

app.get('/api/wallet', authenticateToken, async (req, res) => {
  let wallet = await db.get('SELECT * FROM wallets WHERE userId = ?', [req.user.id]);
  if (!wallet) {
    wallet = { userId: req.user.id, balance: 0, transactions: [] };
  } else {
    wallet.transactions = JSON.parse(wallet.transactions);
  }
  res.json(wallet);
});

// ── File Upload Route ──
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier téléchargé' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ── KYC Routes ──
app.post('/api/kyc', authenticateToken, async (req, res) => {
  const { idType, idFrontUrl, idBackUrl } = req.body;
  const submittedAt = new Date().toISOString();
  
  await db.run(
    'INSERT INTO kyc_submissions (userId, idType, idFrontUrl, idBackUrl, submittedAt) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, idType, idFrontUrl, idBackUrl, submittedAt]
  );
  
  await db.run('UPDATE users SET verificationStatus = "pending" WHERE id = ?', [req.user.id]);
  
  res.status(201).json({ status: 'pending' });
});

app.get('/api/kyc/status', authenticateToken, async (req, res) => {
  const submission = await db.get(
    'SELECT * FROM kyc_submissions WHERE userId = ? ORDER BY id DESC LIMIT 1',
    [req.user.id]
  );
  res.json(submission || { status: 'none' });
});

// Simulated Admin Route to verify a worker
app.post('/api/admin/verify/:userId', authenticateToken, async (req, res) => {
  // In a real app, check if req.user.role === 'admin'
  const { status } = req.body; // 'approved' or 'rejected'
  const userId = req.params.userId;

  await db.run('UPDATE users SET verificationStatus = ? WHERE id = ?', [status, userId]);
  await db.run('UPDATE kyc_submissions SET status = ? WHERE userId = ?', [status, userId]);

  res.json({ success: true, status });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  initializeDb().then(() => {
    http.listen(PORT, () => {
      console.log(`Server Ubiri running on http://localhost:${PORT}`);
    });
  });
}

module.exports = { app, initializeDb };
