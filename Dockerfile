# 使用 Node.js 20.9.0 映像
FROM node:20.9.0

# 設定維護者資訊 (可選)
LABEL maintainer="Vincent"

# 設定應用的工作目錄
WORKDIR /app

# 複製依賴描述文件到工作目錄
COPY package*.json ./

# 安裝相依套件
RUN yarn install

# 複製應用源代碼到工作目錄
COPY . .

# 開放應用的運行端口
EXPOSE 8000

# 設定應用的啟動命令
CMD ["yarn", "dev"]
