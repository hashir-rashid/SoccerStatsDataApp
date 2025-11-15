// routes/export.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// JSON export: GET /api/export/players-json
router.get('/players-json', async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT id, name, team, position, goals FROM players',
            []
        );
        res.json({ players: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to export players as JSON' });
    }
});

// XML export: GET /api/export/players-xml
router.get('/players-xml', async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT id, name, team, position, goals FROM players',
            []
        );

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<players>';

        for (const p of rows) {
            xml += `
  <player>
    <id>${p.id}</id>
    <name>${escapeXml(p.name)}</name>
    <team>${escapeXml(p.team || '')}</team>
    <position>${escapeXml(p.position || '')}</position>
    <goals>${p.goals}</goals>
  </player>`;
        }

        xml += '\n</players>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to export players as XML');
    }
});

function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

module.exports = router;
