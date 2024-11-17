// src/db/db.js
const { Pool } = require('pg');

// Create a new pool instance for connecting to PostgreSQL
const pool = new Pool({
    user: 'postgres',     // Replace with your PostgreSQL username
    host: 'localhost',            // Database host (default is localhost)
    database: 'agendify',         // Your database name
    password: 'altonio20', // Replace with your PostgreSQL password
    port: 5432,                   // Default PostgreSQL port
});

// Test the connection
pool.connect()
    .then(() => {
        console.log('Successfully connected to the database!');
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });

// Export the pool to use it in other files
module.exports = pool;