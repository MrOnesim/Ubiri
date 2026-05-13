const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setupDb() {
  const isTest = process.env.NODE_ENV === 'test';
  const db = await open({
    filename: isTest ? ':memory:' : './ubiri.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      trade TEXT,
      city TEXT,
      verificationStatus TEXT DEFAULT 'none',
      notifications TEXT DEFAULT '[]',
      favorites TEXT DEFAULT '[]',
      lat REAL,
      lng REAL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workerId INTEGER,
      name TEXT,
      price REAL,
      description TEXT,
      category TEXT,
      imageUrl TEXT,
      views INTEGER DEFAULT 0,
      reviews TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fromId INTEGER,
      toId INTEGER,
      text TEXT,
      image TEXT,
      voice TEXT,
      date TEXT,
      read INTEGER DEFAULT 0,
      reactions TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      clientId INTEGER,
      workerId INTEGER,
      serviceId INTEGER,
      serviceName TEXT,
      amount REAL,
      status TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS marketplace_orders (
      id TEXT PRIMARY KEY,
      userId INTEGER,
      items TEXT,
      total REAL,
      status TEXT,
      date TEXT,
      shippingInfo TEXT
    );

    CREATE TABLE IF NOT EXISTS wallets (
      userId INTEGER PRIMARY KEY,
      balance REAL DEFAULT 0,
      transactions TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS kyc_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      idType TEXT,
      idFrontUrl TEXT,
      idBackUrl TEXT,
      status TEXT DEFAULT 'pending', -- pending, approved, rejected
      submittedAt TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  return db;
}

module.exports = { setupDb };
