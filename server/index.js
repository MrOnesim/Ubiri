const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { setupDb } = require('./database');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'ubiri_secret_key_ultra_secure';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

let db;

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
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role, trade, city, lat, lng } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, trade, city, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, trade, city, lat, lng]
    );
    const user = { id: result.lastID, name, email, role };
    const token = jwt.sign(user, SECRET_KEY);
    res.json({ user, token });
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

// Start Server
setupDb().then(database => {
  db = database;
  app.listen(PORT, () => {
    console.log(`Server Ubiri running on http://localhost:${PORT}`);
  });
});
