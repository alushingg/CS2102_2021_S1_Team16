const postgre = require('pg');
require('dotenv').config();

/*const db = new postgre.Pool({
    user:process.env.LOCAL_PG_USER,
    host:process.env.LOCAL_PG_HOST,
    database:process.env.PG_DB,
    password:process.env.LOCAL_PG_PW,
    port:process.env.PG_PORT,
});*/

const db = new postgre.Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = db;