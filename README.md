Chatroom  
這是一個基於 Node.js 和 WebSocket 的即時聊天室應用程式，提供用戶註冊、登入和即時聊天功能。  
  
  
技術棧  
後端  
  
Node.js  
Express  
WebSocket (ws)  
TypeScript  
資料庫  
  
PostgreSQL  
驗證  
  
JSON Web Token (JWT)  
其他工具  
  
pg (PostgreSQL Node.js 驅動)  
dotenv (環境變數管理)  
uuid (生成唯一 ID)  
  
  
功能  
用戶註冊和登入：允許用戶創建帳號並登入系統。  
即時聊天：使用 WebSocket 實現用戶之間的即時消息傳遞。  
單點登入：防止同一帳號在多處同時登入。  
環境要求  
Node.js 14.x 或更高版本  
npm 6.x 或更高版本  
postgresql 資料庫  
安裝與運行  
克隆此儲存庫：  
  
bash  
複製程式碼  
git clone https://github.com/Vincent23412/chatroom.git  
  
cd chatroom  
  
安裝相依套件：  
  
bash  
yarn install  
  
配置環境變數：  
修改.env  
  
  
設置postgresql資料庫  
  
執行 node setup.js  
  
啟動應用程式：  
  
bash  
yarn dev  
伺服器將在 http://localhost:8000 運行。  
  
目錄結構  
chatroom/  
├── src/  
│   ├── api/  
│   │   ├── controllers/  
│   │   │   └── authController.ts  
│   │   └── routes/  
│   │       └── authRoutes.ts  
│   ├── config/  
│   │   └── db.ts          # 資料庫連線設定  
│   ├── ws/  
│   │   └── setupWebSocket.ts  # WebSocket 伺服器設定   
│   └── index.ts           # 專案進入點  
├── package.json  
├── tsconfig.json  
└── README.md  
  
貢獻  
歡迎提交 Issue 與 Pull Request。如果你有任何建議、錯誤回報或功能需求，請透過 GitHub Issues 與我們聯絡。  

Fork 本專案  
建立你的分支 (git checkout -b feature/your-feature)  
提交你的更改 (git commit -am 'Add some feature')  
推送到分支 (git push origin feature/your-feature)  
開一個 Pull Request  
授權  
本專案採用 MIT License 授權，詳細內容請參考 LICENSE 檔案。  

