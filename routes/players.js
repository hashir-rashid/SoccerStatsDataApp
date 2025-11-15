// routes/players.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/players  (list, with optional filters)
router.get('/', async (req, res) => {
    try {
        const { team, name } = req.query;

        let sql = 'SELECT * FROM players WHERE 1=1';
        const params = [];
        let idx = 1;

        if (team) {
            sql += ` AND team = $${idx++}`;
            params.push(team);
        }
        if (name) {
            sql += ` AND name ILIKE $${idx++}`;
            params.push(`%${name}%`);
        }

        const { rows } = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// GET /api/players/:id  (single)
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM players WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch player' });
    }
});

// POST /api/players  (create)
router.post('/', async (req, res) => {
    try {
        const { name, team, position, goals } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'name is required' });
        }

        const { rows } = await db.query(
            `INSERT INTO players (name, team, position, goals)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
            [name, team || null, position || null, goals || 0]
        );

        res.status(201).json({ id: rows[0].id, message: 'Player created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create player' });
    }
});

// PUT /api/players/:id  (update)
router.put('/:id', async (req, res) => {
    try {
        const { name, team, position, goals } = req.body;

        const result = await db.query(
            `UPDATE players
       SET name = $1,
           team = $2,
           position = $3,
           goals = $4
       WHERE id = $5`,
            [name, team || null, position || null, goals || 0, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json({ message: 'Player updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update player' });
    }
});

// DELETE /api/players/:id
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM players WHERE id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json({ message: 'Player deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

module.exports = router;
