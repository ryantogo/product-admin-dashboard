const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  socketPath: process.env.DB_HOST, //  use socketPath, not host!
};

const pool = mysql.createPool(config);

module.exports = pool;

