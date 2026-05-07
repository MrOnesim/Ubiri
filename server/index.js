const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { setupDb } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  console.error('ERREUR: JWT_SECRET non défini dans les variables d\'environnement');
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

let db;

// ── Validation Middleware ──
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

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
    
    // Validation des champs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe sont requis.' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide.' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, trade, city, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, trade, city, lat, lng]
    );
    
    const user = { id: result.lastID, name, email, role };
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '24h' });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont requis.' });
    }
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }
    
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
});

// ── Messaging Routes ──
app.get('/api/messages/:otherId', authenticateToken, async (req, res) => {
  try {
    const otherId = Number(req.params.otherId);
    if (isNaN(otherId)) {
      return res.status(400).json({ error: 'ID utilisateur invalide.' });
    }
    
    const messages = await db.all(
      'SELECT * FROM messages WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?) ORDER BY date ASC',
      [req.user.id, otherId, otherId, req.user.id]
    );
    res.json(messages || []);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { toId, text, image, voice } = req.body;
    
    const recipientId = Number(toId);
    if (isNaN(recipientId)) {
      return res.status(400).json({ error: 'ID destinataire invalide.' });
    }
    
    const date = new Date().toISOString();
    await db.run(
      'INSERT INTO messages (fromId, toId, text, image, voice, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, recipientId, text || '', image || null, voice || null, date]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

// ── Products Routes ──
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products || []);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, price, description, category, imageUrl } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Nom et prix sont requis.' });
    }
    
    if (isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ error: 'Le prix doit être un nombre positif.' });
    }
    
    await db.run(
      'INSERT INTO products (workerId, name, price, description, category, imageUrl) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, name, Number(price), description || '', category || '', imageUrl || '']
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du produit.' });
  }
});

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Une erreur interne est survenue.' });
});

// Start Server
setupDb()
  .then(database => {
    db = database;
    app.listen(PORT, () => {
      console.log(`✓ Server Ubiri running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('✗ Failed to setup database:', err);
    process.exit(1);
  });
