# Docker 版本使用说明

> 本 Docker 版本为**新增文件**实现，未修改任何源文件（`server.js` / `src/*` / `config/*.json`）。

## 新增文件清单

| 文件 | 作用 |
|------|------|
| `Dockerfile` | 镜像构建定义，基于 `node:20-alpine` |
| `.dockerignore` | 构建忽略列表 |
| `docker-compose.yml` | 一键启动编排，含健康检查 |
| `docker-entrypoint.sh` | 容器入口，自动兼容 Windows 路径的 `notify.exe` 与 `127.0.0.1` 监听 |
| `DOCKER.md` | 本文件 |

## 快速启动

```bash
# 1. 构建并启动（宿主机需开 v2ray / 代理，监听 127.0.0.1:10809）
docker compose up -d --build

# 2. 查看日志
docker logs -f opencode-free-proxy

# 3. 验证
curl http://127.0.0.1:4096/api/status
curl http://127.0.0.1:4096/v1/models | head -c 500

# 4. 打开 Web 面板
# http://127.0.0.1:4096
```

## 宿主机代理关键点

`server.js:25` 要求 `HTTP_PROXY/HTTPS_PROXY`，Windows 上常见为 `127.0.0.1:10809`。容器内 `127.0.0.1` 指向容器自身，需用 `host.docker.internal:10809`。

`docker-compose.yml` 已配置：
```yaml
environment:
  - HTTP_PROXY=http://host.docker.internal:10809
  - HTTPS_PROXY=http://host.docker.internal:10809
extra_hosts:
  - "host.docker.internal:host-gateway"
```

若宿主机代理端口不同（如 `7890` / `10808`），修改 `docker-compose.yml` 中两处端口即可。
若宿主机可直连 `opencode.ai`（无需代理），直接删除 `environment` 中的两行。

## 持久化说明

```yaml
volumes:
  - ./config:/app/config                          # 映射表与端口配置
  - ./reasoning-cache.json:/app/reasoning-cache.json # 推理缓存
  - ./debug-400.json:/app/debug-400.json          # 400 调试快照
```

- `config/mappings.json` 修改后无需重启容器，`Web 面板 -> Mappings` 也实时生效
- `config/settings.json` 修改端口需 `docker compose restart`

## 不修改源文件的兼容处理

宿主机 `config/settings.json` 中：
```json
"notify": { "exe": "F:\\迅雷下载\\...\\ai-reminder.exe" }
```
为 Windows 专属路径，Linux 容器内不存在。`docker-entrypoint.sh` 会在容器启动时：
1. 检测 `notify.exe` 含 `:\` 或 `.exe` 则自动 `enabled=false, exe=""`
2. 检测 `host=127.0.0.1` 则自动改为 `0.0.0.0`

> 该 patch 会**回写**到被挂载的宿主机 `config/settings.json`（Docker bind mount 特性）。若需完全不触碰宿主机，请使用以下隔离模式：

```bash
# 隔离模式：不挂载宿主机 config，使用镜像内默认 config
docker compose run --no-deps -v opencode-config:/app/config opencode-free-proxy
# 或手动创建 config.docker 目录并挂载
mkdir config.docker && cp config/mappings.json config.docker/ && cp config/settings.json config.docker/
# 然后修改 docker-compose.yml 的 volumes 为 ./config.docker:/app/config
```

## 常用命令

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down

# 仅重建镜像
docker compose build --no-cache
docker compose up -d

# 进入容器排查
docker exec -it opencode-free-proxy sh
wget -qO- http://127.0.0.1:4096/api/status
```

## Claude Code 连接（容器化后）

容器启动后，`Base URL` 仍为宿主机地址：

```powershell
$env:ANTHROPIC_BASE_URL="http://127.0.0.1:4096"
$env:ANTHROPIC_API_KEY="sk-ant-api03-proxy-opencode-free-000000000000000000000000000000000000000000000000000000-000000000AA"
claude
```

其他 OpenAI 兼容客户端：
```
Base URL: http://127.0.0.1:4096/v1
API Key: not-needed
Model: deepseek-v4-flash-free
```

## 镜像体积与安全

- 基础镜像 `node:20-alpine` (~150MB)
- `npm ci --omit=dev` 仅安装生产依赖
- `healthcheck` 每 30s 检测 `/api/status`
- 未以 `root` 运行可按需添加 `USER node`
