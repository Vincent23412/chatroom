#!/usr/bin/env node

import pkg from "pg";
const {Client} = pkg; 
import dotenv from "dotenv";
dotenv.config(); 

async function createTables() {
  // 根據你的資料庫設定修改下面連線資訊
  const client = new Client({
    user: process.env.DB_USER ,
    host: process.env.DB_HOST ,
    database: process.env.DATABASE ,
    password: process.env.DB_PASSWORD ,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  
  });

  try {
    await client.connect();
    console.log("已連接到資料庫");

    // 建立 chat 資料表
    const createChatTable = `
      CREATE TABLE chat (
        id SERIAL PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        chat_room_id INT,
        recipient VARCHAR(255),
        message_status VARCHAR(50) DEFAULT 'sent',
        is_deleted BOOLEAN DEFAULT FALSE,
        is_edited BOOLEAN DEFAULT FALSE
      );
    `;
    await client.query(createChatTable);
    console.log("已建立 chat 資料表");

    // 建立 users 資料表
    const createUsersTable = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createUsersTable);
    console.log("已建立 users 資料表");

  } catch (err) {
    console.error("執行 SQL 發生錯誤：", err);
  } finally {
    await client.end();
    console.log("已斷開資料庫連線");
  }
}

createTables();
