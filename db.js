const { Pool } = require('pg'); 
const dotenv = require('dotenv');
dotenv.config(); 


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT, 
    ///////////////////////////////////////////////////
    ssl: {
        rejectUnauthorized: false,  // 如果使用自簽名證書
    }
    // ssl: false,  // 不使用 SSL 連接
    // idleTimeoutMillis: 30000,  // 30 秒後關閉閒置連接
    // connectionTimeoutMillis: 5000,  // 5 秒內必須連接資料庫，否則超時
});


module.exports = pool;