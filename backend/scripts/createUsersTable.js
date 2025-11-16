const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database', 'sports_data.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert demo users
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  
  const demoUsers = [
    { name: 'Demo Admin', email: 'admin@sports.com', password: 'admin123', role: 'admin' },
    { name: 'Demo User', email: 'user@sports.com', password: 'user123', role: 'user' }
  ];

  demoUsers.forEach(user => {
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
      if (err) throw err;
      db.run(
        `INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        [user.name, user.email, hash, user.role]
      );
    });
  });

  console.log('Users table created with demo accounts');
});

db.close();