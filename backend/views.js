const express = require('express');

module.exports = (sportsDb) => {
  const router = express.Router();

  // View 1: Player Progression (Simplified)
  router.get('/view-player-progression', (req, res) => {
    const query = `
      WITH FirstRatings AS (
        SELECT player_api_id, MIN(date) as first_date, overall_rating as first_rating
        FROM Player_Attributes
        GROUP BY player_api_id
      ),
      LatestRatings AS (
        SELECT player_api_id, MAX(date) as latest_date, overall_rating as latest_rating
        FROM Player_Attributes
        GROUP BY player_api_id
      )
      SELECT 
        p.player_name as name,
        fr.first_date,
        fr.first_rating,
        lr.latest_date,
        lr.latest_rating,
        (lr.latest_rating - fr.first_rating) as improvement
      FROM Player p
      JOIN FirstRatings fr ON p.player_api_id = fr.player_api_id
      JOIN LatestRatings lr ON p.player_api_id = lr.player_api_id
      ORDER BY improvement DESC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching player progression:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // View 2: High Rated Players by Foot
  router.get('/high-rated-players-by-foot', (req, res) => {
    const query = `
      SELECT 
        preferred_foot as foot,
        AVG(overall_rating) as avg,
        COUNT(*) as count,
        MAX(overall_rating) as max
      FROM Player_Attributes
      WHERE overall_rating > 70
      GROUP BY preferred_foot
      ORDER BY avg DESC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching high rated players by foot:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // View 3: Player Peak Attributes (Optimized)
  router.get('/player-peak-attributes', (req, res) => {
    const query = `
      SELECT 
        p.player_name as name,
        pa.date,
        pa.overall_rating as rating,
        pa.potential,
        pa.finishing,
        pa.short_passing as passing,
        pa.dribbling
      FROM Player p
      JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
      JOIN (
        SELECT player_api_id, MAX(overall_rating) as max_rating
        FROM Player_Attributes 
        GROUP BY player_api_id
      ) max_ratings ON pa.player_api_id = max_ratings.player_api_id AND pa.overall_rating = max_ratings.max_rating
      ORDER BY rating DESC, potential DESC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching player peak attributes:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // View 4: All Players and Attributes
  router.get('/all-players-and-attributes', (req, res) => {
    const query = `
      SELECT 
        p.player_name as name,
        p.birthday,
        pa.date,
        pa.overall_rating as rating,
        pa.potential
      FROM Player p
      JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
      WHERE p.player_api_id IN (
        SELECT player_api_id FROM Player LIMIT 10
      )
      ORDER BY p.player_name ASC, pa.date DESC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching all players and attributes:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // View 5: Worst Player Union
  router.get('/worst-player-union', (req, res) => {
    const query = `
      SELECT 
        p.player_name as name,
        pa.overall_rating as rating,
        pa.potential,
        'Low Rating' as category
      FROM Player p
      JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
      WHERE pa.overall_rating < 60
      
      UNION ALL
      
      SELECT 
        p.player_name as name,
        pa.overall_rating as rating,
        pa.potential,
        'Low Potential' as category
      FROM Player p
      JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
      WHERE pa.potential < 65
      
      ORDER BY category, rating ASC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching worst player union:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // View 6: Current Player Ratings
  router.get('/current-player-ratings', (req, res) => {
    const query = `
      SELECT 
        p.player_name as name,
        pa.date,
        pa.overall_rating as rating,
        pa.potential,
        pa.preferred_foot as foot,
        pa.attacking_work_rate as work_rate
      FROM Player p
      JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
      WHERE pa.date = (
        SELECT MAX(date) 
        FROM Player_Attributes 
        WHERE player_api_id = p.player_api_id
      )
      ORDER BY rating DESC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching current player ratings:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // View 7: Player Physical Profile
  router.get('/player-physical-profile', (req, res) => {
    const query = `
      SELECT 
        p.player_name as name,
        p.height,
        p.weight,
        pa.stamina,
        pa.strength,
        pa.jumping,
        pa.acceleration,
        pa.sprint_speed as sprint
      FROM Player p
      JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
      WHERE pa.date = (
        SELECT MAX(date) 
        FROM Player_Attributes 
        WHERE player_api_id = p.player_api_id
      )
      ORDER BY p.player_name ASC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching player physical profile:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // View 8: Player Speed Metrics
  router.get('/player-speed-metrics', (req, res) => {
    const query = `
      SELECT 
        p.player_name as name,
        p.height,
        AVG(pa.sprint_speed) as sprint,
        AVG(pa.acceleration) as acceleration,
        AVG(pa.agility) as agility,
        AVG(pa.balance) as balance
      FROM Player p
      JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
      GROUP BY p.player_api_id, p.player_name, p.height
      ORDER BY sprint DESC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching player speed metrics:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // View 9: Goalkeeper Rankings
  router.get('/goalkeeper-rankings', (req, res) => {
    const query = `
      SELECT 
        p.player_name as name,
        AVG(pa.gk_diving) as diving,
        AVG(pa.gk_handling) as handling,
        AVG(pa.gk_kicking) as kicking,
        AVG(pa.gk_positioning) as positioning,
        AVG(pa.gk_reflexes) as reflexes,
        AVG(pa.overall_rating) as rating
      FROM Player p
      JOIN Player_Attributes pa ON p.player_api_id = pa.player_api_id
      GROUP BY p.player_api_id, p.player_name
      ORDER BY rating DESC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching goalkeeper rankings:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  // View 10: League Country Overview
  router.get('/league-country-overview', (req, res) => {
    const query = `
      SELECT 
        c.name as country,
        l.name as league,
        l.id as l_id,
        c.id as c_id
      FROM Country c
      JOIN League l ON c.id = l.country_id
      ORDER BY c.name ASC
      LIMIT 10
    `;
    sportsDb.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching league country overview:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(rows);
    });
  });

  return router;
};