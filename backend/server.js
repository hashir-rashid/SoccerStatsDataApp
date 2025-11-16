const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// TWO SEPARATE DATABASE CONNECTIONS:

// 1. READ-ONLY: For sports data (players, teams, matches)
const sportsDbPath = path.join(__dirname, 'database', 'database.sqlite');
const sportsDb = new sqlite3.Database(sportsDbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening sports database:', err.message);
  } else {
    console.log('Connected to READ-ONLY sports database');
  }
});

// 2. READ-WRITE: For user authentication data
const authDbPath = path.join(__dirname, 'database', 'users_database.sqlite');
const authDb = new sqlite3.Database(authDbPath, (err) => {
  if (err) {
    console.error('Error opening auth database:', err.message);
  } else {
    console.log('Connected to READ-WRITE auth database');
    
    // Create users table if it doesn't exist
    authDb.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Import and use auth routes (pass the authDb)
const authRoutes = require('./auth')(authDb);
app.use('/api/auth', authRoutes);

// Sports data routes use sportsDb
app.get('/api/players', (req, res) => {
  const { page = 1, limit = 50, search } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `SELECT * FROM Player`;
  let params = [];
  
  if (search) {
    query += ` WHERE player_name LIKE ?`;
    params.push(`%${search}%`);
  }
  
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  // Use sportsDb (read-only)
  sportsDb.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get specific player by ID
app.get('/api/players/:id', (req, res) => {
  const query = `
    SELECT p.*, pa.* 
    FROM Player p 
    LEFT JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id 
    WHERE p.id = ? 
    ORDER BY pa.date DESC 
    LIMIT 1
  `;
  
  sportsDb.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || {});
  });
});

// Get player stats history
app.get('/api/players/:id/stats', (req, res) => {
  const query = `
    SELECT * FROM Player_Attributes 
    WHERE player_api_id = (SELECT player_api_id FROM Player WHERE id = ?)
    ORDER BY date DESC
  `;
  
  sportsDb.all(query, [req.params.id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all teams
app.get('/api/teams', (req, res) => {
  const query = `SELECT * FROM Team ORDER BY team_long_name`;
  
  sportsDb.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get team with attributes
app.get('/api/teams/:id', (req, res) => {
  const query = `
    SELECT t.*, ta.* 
    FROM Team t 
    LEFT JOIN Team_Attributes ta ON t.team_api_id = ta.team_api_id 
    WHERE t.id = ? 
    ORDER BY ta.date DESC 
    LIMIT 1
  `;
  
  sportsDb.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || {});
  });
});

// Get leagues with country info
app.get('/api/leagues', (req, res) => {
  const query = `
    SELECT l.*, c.name as country_name 
    FROM League l 
    JOIN Country c ON l.country_id = c.id
  `;
  
  sportsDb.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Search across multiple tables
app.get('/api/search/:term', (req, res) => {
  const term = `%${req.params.term}%`;
  
  const queries = [
    { table: 'Player', query: 'SELECT * FROM Player WHERE player_name LIKE ? LIMIT 10' },
    { table: 'Team', query: 'SELECT * FROM Team WHERE team_long_name LIKE ? OR team_short_name LIKE ? LIMIT 10' }
  ];
  
  const results = {};
  let completed = 0;
  
  queries.forEach(({ table, query }) => {
    const params = table === 'Team' ? [term, term] : [term];
    
    sportsDb.all(query, params, (err, rows) => {
      results[table.toLowerCase()] = rows || [];
      completed++;
      
      if (completed === queries.length) {
        res.json(results);
      }
    });
  });
});

// SPA catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.listen(port, () => {
  console.log(`SQLite API Server running on http://localhost:${port}`);
});