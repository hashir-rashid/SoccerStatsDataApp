// routes/import.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');

// POST /api/import/players
router.post('/players', async (req, res) => {
    try {
        // Replace with real external API URL & params
        const externalUrl = 'https://example-sports-api.com/players?league=premier';

        const response = await axios.get(externalUrl);
        const players = response.data.players; // adjust to actual API shape

        let imported = 0;

        for (const p of players) {
            const externalId = String(p.id);
            const name = p.name;
            const team = p.team || null;
            const position = p.position || null;
            const goals = p.goals || 0;

            await db.query(
                `
        INSERT INTO players (external_id, name, team, position, goals)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (external_id) DO UPDATE
          SET name = EXCLUDED.name,
              team = EXCLUDED.team,
              position = EXCLUDED.position,
              goals = EXCLUDED.goals
        `,
                [externalId, name, team, position, goals]
            );

            imported++;
        }

        res.json({ message: 'Import completed', imported });
    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({ error: 'Failed to import players from external API' });
    }
});

module.exports = router;
