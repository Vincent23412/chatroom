import express from 'express';
import { register, login, authenticateToken, findUserData, getAllUser, test } from '../controllers/authController.js';

const router = express.Router();

// 註冊與登入
router.post('/register', register);
router.post('/login', login);

// 取得使用者資料（需驗證 JWT）
router.get('/user', authenticateToken, findUserData);
router.get('/users', authenticateToken, getAllUser);


export default router;
