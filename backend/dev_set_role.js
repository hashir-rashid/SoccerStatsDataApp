const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the SAME path as in server.js
const authDbPath = path.join(__dirname, 'database', 'users_database.sqlite');
const db = new sqlite3.Database(authDbPath, (err) => {
    if (err) {
        console.error('Error opening auth database:', err.message);
        process.exit(1);
    }
});

// Usage: node dev_set_role.js email@domain.com admin
const email = process.argv[2];
const role = process.argv[3] || 'admin';

if (!email) {
    console.error('\nUsage: node devSetRole.js <email> [role]\n');
    console.error('Examples:');
    console.error('  node devSetRole.js test@example.com          # make admin');
    console.error('  node devSetRole.js test@example.com user     # make normal user\n');
    process.exit(1);
}

db.run(
    'UPDATE users SET role = ? WHERE email = ?',
    [role, email],
    function (err) {
        if (err) {
            console.error('Error updating role:', err.message);
            process.exit(1);
        }

        if (this.changes === 0) {
            console.log(`No user found with email: ${email}`);
        } else {
            console.log(`Updated ${email} to role: ${role}`);
        }

        db.close();
    }
);
