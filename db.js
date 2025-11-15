const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'your_user',
    password: 'your_password',
    database: 'your_dbname',
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
