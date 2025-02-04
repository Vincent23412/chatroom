import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../db.js";
import dotenv from "dotenv";
import { Request, Response, NextFunction, RequestHandler } from "express";

dotenv.config();

const secretKey = process.env.SECRET_KEY as string;

// 定義 User 介面
interface User {
  id: number;
  username: string;
  password: string;
  point: number;
  sticker?: string;
}

// 註冊使用者
export const register: RequestHandler = async (req, res, next) => {
  try {
    const { username, password, sticker } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password, point, sticker) VALUES ($1, $2, $3, $4)",
      [username, hashedPassword, 500, sticker]
    );

    res.status(201).json({ message: "success", username });
  } catch (err: any) {
    console.error(err.detail);
    next(err); // 讓 Express 錯誤處理中介函數處理錯誤
  }
};

// 登入使用者
export const login: RequestHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ status: "wrong information", username: "visitor" });
    }

    const user: User = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        secretKey,
        { expiresIn: "1h" }
      );
      res.json({ token, username: user.username });
    } else {
      res.status(401).json({ status: "error", message: "Invalid password" });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// JWT 驗證中介函數
export const authenticateToken: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) res.status(401).json({ error: "access denied" });

  jwt.verify(token!, secretKey, (err, user) => {
    if (err) res.status(403).json({ error: "access denied" });

    // req.user = user as User;
    next();
  });
};

// 查找特定使用者資料
export const findUserData: RequestHandler = async (req, res, next) => {
  try {
    const { username } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ status: "wrong information", username: "visitor" });
    }

    const user: User = result.rows[0];
    res.json({ user });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// 取得所有使用者
export const getAllUser: RequestHandler = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    if (result.rows.length === 0) {
      res.status(404).json({ status: "no users found" });
    }

    const users: User[] = result.rows;
    res.json({ users });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
