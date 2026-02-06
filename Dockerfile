# Stage 1: 构建 Angular 应用（可选，也可本地构建）
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production
# COPY . .
# RUN npm run build

# Stage 2: 使用 Nginx 托管
FROM nginx:alpine

# 删除默认欢迎页
RUN rm -rf /usr/share/nginx/html/*

# 替换nginx配置文件
COPY default.conf  /etc/nginx/conf.d/default.conf

# 假设你已在本地运行 npm run build，dist 目录在宿主机
# 构建时复制 dist 内容到 nginx html 目录
COPY dist/mainapp /usr/share/nginx/html/mainapp
COPY dist/subapp /usr/share/nginx/html/subapp

# 暴露端口
EXPOSE 80

# 启动 nginx（前台运行）
CMD ["nginx", "-g", "daemon off;"]