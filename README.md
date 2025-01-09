職綁直播&博弈APP    
  
軟體介紹：https://www.canva.com/design/DAGbBxGpcmA/z1vaWffcyAK-7ChhxRGCFw/edit  

聊天: https://github.com/Vincent23412/chatroom  
  
爬蟲資料&api: https://github.com/Sean12344321/CPBL-crawler  
  
前端: https://github.com/Pangolin-Ping/game  

功能  
用戶註冊和登入：允許用戶創建帳號並登入系統。  
即時聊天：使用 WebSocket 實現用戶之間的即時消息傳遞。  
單點登入：防止同一帳號在多處同時登入。  
環境要求  
Node.js 14.x 或更高版本  
npm 6.x 或更高版本  
Postgresql 資料庫  
安裝與運行  
克隆此儲存庫：  

bash  
複製程式碼  
git clone https://github.com/Vincent23412/chatroom.git  
cd chatroom  
安裝相依套件：  

bash  
複製程式碼  
npm install  
配置環境變數：  

在項目根目錄下創建一個 .env 文件，並添加以下內容：  

env  
複製程式碼  
DB_HOST=您的資料庫主機  
DB_USER=您的資料庫用戶名  
DB_PASSWORD=您的資料庫密碼  
DB_NAME=您的資料庫名稱  
初始化資料庫：  

使用 database_backup 目錄下的 SQL 文件來創建所需的資料庫和資料表。  
啟動應用程式：  
 
bash  
複製程式碼  
npm run dev  
伺服器將在 http://localhost:7999 運行。  

目錄結構  
bash  
複製程式碼  
chatroom/  
├── database_backup/   # 資料庫備份文件  
├── public/            # 前端靜態資源  
├── .env               # 環境變數配置文件  
├── app.js             # 應用程式主文件  
├── auth.js            # 認證相關邏輯  
├── db.js              # 資料庫連接和查詢  
├── ws.js              # WebSocket 相關邏輯  
├── package.json       # 項目描述文件  
└── README.md          # 說明文件  
API 端點   
POST /register：用戶註冊  

請求體：  

json  
複製程式碼  
{  
  "username": "用戶名",  
  "password": "密碼"  
}  
響應：  
  
json  
複製程式碼  
{  
  "success": true,  
  "message": "註冊成功"  
}  
POST /login：用戶登入  

請求體：  

json  
複製程式碼  
{  
  "username": "用戶名",  
  "password": "密碼"  
}  
響應：  
  
json  
複製程式碼  
{  
  "success": true,  
  "message": "登入成功",  
  "token": "JWT Token"  
}  
WebSocket /ws：即時聊天連接  
  
客戶端應使用獲取的 JWT Token 進行連接驗證。  
貢獻  
歡迎提交問題（Issues）和合併請求（Pull Requests）來改進此項目。  
  
授權  
此項目採用 MIT 授權條款。  
  
  
實際操作截圖  

![image](https://github.com/user-attachments/assets/2646d80c-6114-4c2e-aee3-d91549547f5b)  
  
![image](https://github.com/user-attachments/assets/37bdd3db-057b-4e9b-aad4-cee3eb15a33d)  
  
![image](https://github.com/user-attachments/assets/19167871-2c10-427a-8274-fd14640d53bd)  


  

