// server.js
const express = require('express');
const app = express();

const playersRoutes = require('./routes/players');
const importRoutes = require('./routes/import');
const exportRoutes = require('./routes/export');

app.use(express.json()); // parse JSON bodies

app.use('/api/players', playersRoutes);
app.use('/api/import', importRoutes);
app.use('/api/export', exportRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
