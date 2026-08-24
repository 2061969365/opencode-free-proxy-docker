# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# 只复制依赖清单，利用 Docker 缓存
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 复制源码
COPY server.js ./
COPY src ./src
COPY public ./public
COPY config ./config

# reasoning-cache.json / debug-400.json 为运行时生成，不强制复制
# 若不存在则创建空文件避免挂载问题
RUN touch reasoning-cache.json debug-400.json || true

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 4096

# 使用 --use-env-proxy 以支持容器内 HTTP_PROXY/HTTPS_PROXY
ENTRYPOINT ["docker-entrypoint.sh"]
