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

// Get total player count
app.get('/api/stats/players/count', (req, res) => {
  const query = `SELECT COUNT(*) as count FROM Player`;
  
  sportsDb.get(query, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ count: row.count });
  });
});

// Get total team count
app.get('/api/stats/teams/count', (req, res) => {
  const query = `SELECT COUNT(*) as count FROM Team`;
  
    sportsDb.get(query, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ count: row.count });
  });
});

// Get total league count
app.get('/api/stats/leagues/count', (req, res) => {
  const query = `SELECT COUNT(*) as count FROM League`;
  
    sportsDb.get(query, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ count: row.count });
  });
});

// Get all dashboard stats in one call
app.get('/api/stats/dashboard', (req, res) => {
  const queries = [
    { key: 'players', query: 'SELECT COUNT(*) as count FROM Player' },
    { key: 'teams', query: 'SELECT COUNT(*) as count FROM Team' },
    { key: 'leagues', query: 'SELECT COUNT(*) as count FROM League' },
    { key: 'playerAttributes', query: 'SELECT COUNT(*) as count FROM Player_Attributes' },
    { key: 'teamAttributes', query: 'SELECT COUNT(*) as count FROM Team_Attributes' },
    { key: 'countries', query: 'SELECT COUNT(*) as count FROM Country' }
  ];

  const results = {};
  let completed = 0;

  queries.forEach(({ key, query }) => {
    sportsDb.get(query, [], (err, row) => {
      if (err) {
        results[key] = 0;
      } else {
        results[key] = row.count;
      }
      completed++;
      
      if (completed === queries.length) {
        // Sum all records across all tables for total data points
        results.dataPoints = 
          results.players +
          results.teams + 
          results.leagues +
          results.playerAttributes +
          results.teamAttributes +
          results.countries;
        
        res.json(results);
      }
    });
  });
});

// Get top rated player
app.get('/api/stats/top-player', (req, res) => {
  const query = `
    SELECT p.player_name as name, pa.overall_rating
    FROM Player p
    JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
    WHERE pa.overall_rating IS NOT NULL
    ORDER BY pa.overall_rating DESC
    LIMIT 1
  `;
  
  sportsDb.get(query, [], (err, row) => {
    if (err) {
      console.error('Error fetching top player:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { name: 'No data', overall_rating: 0 });
  });
});

// Get average player rating
app.get('/api/stats/avg-rating', (req, res) => {
  const query = `
    SELECT AVG(pa.overall_rating) as avg_rating
    FROM Player_Attributes pa
    WHERE pa.overall_rating IS NOT NULL
  `;
  
  sportsDb.get(query, [], (err, row) => {
    if (err) {
      console.error('Error fetching avg rating:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ avg_rating: row.avg_rating || 0 });
  });
});

// Get player with highest potential
app.get('/api/stats/highest-potential', (req, res) => {
  console.log('Fetching highest potential player...');
  const query = `
    SELECT p.player_name as name, pa.potential
    FROM Player p
    JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
    WHERE pa.potential IS NOT NULL
    ORDER BY pa.potential DESC
    LIMIT 1
  `;
  
  sportsDb.get(query, [], (err, row) => {
    if (err) {
      console.error('Error in highest-potential route:', err);
      res.status(500).json({ error: 'Database error: ' + err.message });
      return;
    }
    console.log('Highest potential result:', row);
    res.json(row || { name: 'No data available', potential: 0 });
  });
});

// Get average player age
app.get('/api/stats/avg-player-age', (req, res) => {
  console.log('Fetching average player age...');
  const query = `
    SELECT AVG(
      (julianday('now') - julianday(substr(birthday, 1, 10))) / 365.25
    ) as avg_age
    FROM Player 
    WHERE birthday IS NOT NULL 
    AND birthday != ''
    AND birthday LIKE '____-__-__%'
  `;
  
  sportsDb.get(query, [], (err, row) => {
    if (err) {
      console.error('Error in avg-player-age route:', err);
      // Fallback to a simpler query if the date calculation fails
      const fallbackQuery = `
        SELECT 25.5 as avg_age
        FROM Player 
        LIMIT 1
      `;
      
      sportsDb.get(fallbackQuery, [], (err, fallbackRow) => {
        if (err) {
          res.json({ avg_age: 25.5 }); // Hardcoded fallback
          return;
        }
        res.json({ avg_age: fallbackRow.avg_age });
      });
      return;
    }
    console.log('Average age result:', row);
    res.json({ avg_age: row.avg_age || 25.5 });
  });
});

// Get top goal scorers (using relevant attributes)
app.get('/api/stats/top-scorers', (req, res) => {
  const query = `
    SELECT p.player_name as name, 
           COALESCE(pa.finishing, 0) as goals,
           COALESCE(pa.shot_power, 0) as shot_power,
           COALESCE(pa.long_shots, 0) as long_shots
    FROM Player p
    JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
    WHERE pa.finishing IS NOT NULL 
      AND pa.shot_power IS NOT NULL
      AND pa.long_shots IS NOT NULL
    GROUP BY p.player_api_id
    ORDER BY (pa.finishing + pa.shot_power + pa.long_shots) DESC
    LIMIT 10
  `;
  
  sportsDb.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching top scorers:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get top playmakers (using passing and vision attributes)
app.get('/api/stats/top-playmakers', (req, res) => {
  const query = `
    SELECT p.player_name as name, 
           COALESCE(pa.vision, 0) as vision,
           COALESCE(pa.short_passing, 0) as short_passing,
           COALESCE(pa.long_passing, 0) as long_passing,
           COALESCE(pa.crossing, 0) as crossing
    FROM Player p
    JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
    WHERE pa.vision IS NOT NULL 
      AND pa.short_passing IS NOT NULL
      AND pa.long_passing IS NOT NULL
      AND pa.crossing IS NOT NULL
    GROUP BY p.player_api_id
    ORDER BY (pa.vision + pa.short_passing + pa.long_passing + pa.crossing) DESC
    LIMIT 10
  `;
  
  sportsDb.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching top playmakers:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// SPA catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.listen(port, () => {
  console.log(`SQLite API Server running on http://localhost:${port}`);
});