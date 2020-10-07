const postgre = require('pg');
const db = new postgre.Pool({
    user:process.env.LOCAL_PG_USER,
    host:process.env.LOCAL_PG_HOST,
    database:process.env.PG_DB,
    password:process.env.PG_LOCAL_PW,
    port:process.env.PG_PORT,
});

module.exports = db;