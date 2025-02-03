import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER as string,
  host: process.env.DB_HOST as string,
  database: process.env.DATABASE as string,
  password: process.env.DB_PASSWORD as string,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,

  ssl: {
    rejectUnauthorized: false, // 如果使用自簽名證書
  },
  // ssl: false,  // 不使用 SSL 連接
  // idleTimeoutMillis: 30000,  // 30 秒後關閉閒置連接
  // connectionTimeoutMillis: 5000,  // 5 秒內必須連接資料庫，否則超時
});

export default pool;
