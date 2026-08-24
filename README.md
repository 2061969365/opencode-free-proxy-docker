# OpenCode Free Proxy 🚀

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![API Provider](https://img.shields.io/badge/API-OpenCode%20Free-orange.svg)](https://opencode.ai)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](./DOCKER.md)
[![Docker Image](https://img.shields.io/badge/image-node%3A20--alpine-2496ED.svg)](./Dockerfile)

> **Bilingual README / 双语说明** — [中文](#-中文) | [English](#-english)

---

## 🇨🇳 中文

### 简介

**OpenCode Free Proxy** 是一个基于 Node.js 的轻量独立代理服务器，用于将 **Claude Code**、OpenCode CLI 及任意兼容 OpenAI / Claude API 的客户端，无缝转发到 **OpenCode** 免费 API（`https://opencode.ai/zen/v1`），无需个人 API Key（默认使用公共 Token `Bearer public`）。

项目自带现代化的 **Web Dashboard**（支持中英双语），可直观管理模型映射、查看调用日志、实时对话测试（Playground）。

### 🌟 核心特性

- 🔄 **协议自动转换**：Anthropic Messages API ↔ OpenAI Chat Completions API ↔ OpenCode API 自动互转
- 🗺️ **模型映射（Model Mapping）**：将 `claude-sonnet-4-6` / `claude-opus-4-8` 等 Claude 模型名自动映射到可用的免费模型（如 `deepseek-v4-flash-free` / `mimo-v2.5-free`），配置持久化于 `config/mappings.json`
- ⚡ **SSE 流式 + 推理透传**：
  - 稳定转发 Server-Sent Events 流
  - 自动将 `reasoning_content`（DeepSeek）转换为 Anthropic `thinking` 块，Claude Code 可正确显示思考过程
- 📊 **Web Dashboard**：
  - **Dashboard**：运行状态、uptime、端口、目标地址、免费模型 Coding 能力对比（Artificial Analysis）
  - **Models**：在线免费模型列表（来自上游 `/v1/models`）
  - **Mappings**：可视化增删改映射（实时生效）
  - **Logs**：请求路径、原始模型、映射后模型、HTTP 状态、耗时
  - **Playground & Test**：带 System Prompt / Temperature / Max Tokens 的在线聊天与原始响应检查
- 🔑 **免 API Key**：默认 `Bearer public`，客户端任意 `sk-*` 均可通过校验
- 🐳 **Docker 就绪**：一键 `docker compose up -d` 启动，详见 [`DOCKER.md`](./DOCKER.md)

### 🛠️ 系统要求

- Node.js >= 18.0.0（Docker 方式无需本地 Node）
- npm（随 Node 安装）
- 可选：Docker / Docker Compose（推荐）

### 🚀 快速开始

#### 方式 A：Docker 一键启动（推荐）

```bash
# 1. 构建并启动（默认走宿主机代理 127.0.0.1:10809 穿透到容器）
docker compose up -d --build

# 2. 查看日志
docker logs -f opencode-free-proxy

# 3. 验证
curl http://127.0.0.1:4096/api/status
curl http://127.0.0.1:4096/v1/models

# 4. 打开面板 http://127.0.0.1:4096
```

> 代理说明：容器内 `127.0.0.1` 指向容器自身，已通过 `host.docker.internal:10809` + `extra_hosts: host-gateway` 穿透。端口不同请改 `docker-compose.yml` 中 `HTTP_PROXY/HTTPS_PROXY`；可直连 `opencode.ai` 则删除该 `environment`。完整说明见 [`DOCKER.md`](./DOCKER.md)。

#### 方式 B：本地 Node.js 运行

```bash
npm install

# 开发模式（文件变更自动重启）
npm run dev

# 生产模式
npm start
# 面板 http://127.0.0.1:4096
```

### ⚙️ 配置

| 文件 | 说明 |
|------|------|
| `config/settings.json` | `port` / `host`（默认 `4096` / `0.0.0.0`，Docker 需 `0.0.0.0`）、`notify` 通知配置（`enabled` / `exe` / `debounceMs`） |
| `config/mappings.json` | 左侧为客户端请求模型名，右侧为实际免费模型，Web 面板或直接编辑均可，实时生效 |

### 🤖 客户端接入

#### Claude Code

**Windows 一键脚本：**
```cmd
proxy-claude.cmd
```

**PowerShell 手动：**
```powershell
$env:ANTHROPIC_BASE_URL="http://127.0.0.1:4096"
$env:ANTHROPIC_API_KEY="sk-ant-api03-proxy-opencode-free-000000000000000000000000000000000000000000000000000000-000000000AA"
claude
```

**CMD 手动：**
```cmd
set ANTHROPIC_BASE_URL=http://127.0.0.1:4096
set ANTHROPIC_API_KEY=sk-ant-api03-proxy-opencode-free-000000000000000000000000000000000000000000000000000000-000000000AA
claude
```

> `ANTHROPIC_API_KEY` 为满足长度校验的占位符，代理会替换为上游所需 Header；Claude 的 `BASE_URL` 不要带 `/v1`（其 SDK 会自动追加 `/v1/messages`）。

#### OpenCode CLI / 任意 OpenAI 兼容客户端

```json
{
  "provider": "openai",
  "baseURL": "http://127.0.0.1:4096/v1",
  "apiKey": "not-needed"
}
```
或环境变量：
```bash
export OPENAI_BASE_URL=http://127.0.0.1:4096/v1
export OPENAI_API_KEY=not-needed
# 模型选用 deepseek-v4-flash-free 等 -free 后缀模型
```

可用免费模型（以 `/v1/models` 为准）：
`deepseek-v4-flash-free`（推荐，支持推理）、`mimo-v2.5-free`、`nemotron-3-ultra-free`、`north-mini-code-free`、`big-pickle` 等。

### 📈 免费模型 Coding 能力排行

基于 Artificial Analysis Coding Index（Terminal-Bench Hard, SciCode）：

| Model ID | Score | Vision | Reasoning | 默认映射 |
| :--- | :---: | :---: | :---: | :--- |
| `mimo-v2.5-free` | 42.1 | ✅ | ❌ | `claude-opus-4-8` |
| `deepseek-v4-flash-free` | 38.7 | ❌ | ✅ | `claude-sonnet-4-6` |
| `nemotron-3-ultra-free` | 37.6 | ❌ | ❌ | `claude-haiku-4-5` |
| `north-mini-code-free` | 33.4 | ❌ | ❌ | `claude-sonnet-4` |

### 📂 目录结构

```text
├── config/                  # 映射与端口配置
│   ├── mappings.json
│   └── settings.json
├── public/                  # Dashboard 静态资源
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   ├── pages.css
│   └── tokens.css
├── src/                     # 代理源码
│   ├── constants.js
│   ├── fetcher.js
│   ├── logger.js
│   ├── mapper.js
│   ├── modelMeta.js
│   ├── notify.js
│   ├── proxy.js
│   └── translator.js
├── Dockerfile               # node:20-alpine 构建
├── docker-compose.yml       # 一键编排 + 健康检查
├── docker-entrypoint.sh     # 自动兼容 Windows notify 路径
├── DOCKER.md                # Docker 详细说明
├── server.js                # Express 入口
├── package.json
└── README.md
```

### 注意事项

1. 免费模型有速率限制（约每分钟数次），适合轻量任务
2. 需代理访问 `opencode.ai` 时，请确保宿主机代理已开启；Docker 已配置 `host.docker.internal` 穿透
3. 上游地址与鉴权头硬编码于 `src/constants.js`

---

## 🇬🇧 English

### Introduction

**OpenCode Free Proxy** is a lightweight standalone proxy server built with Node.js. It forwards **Claude Code**, OpenCode CLI, and any OpenAI / Claude-compatible clients to the free **OpenCode** API (`https://opencode.ai/zen/v1`) without requiring a personal API key (uses public token `Bearer public`).

It comes with a modern **Web Dashboard** (bilingual EN/中文) for model mapping, request logs, and an interactive Playground.

### 🌟 Features

- 🔄 **Protocol Translation**: Auto-translates between Anthropic Messages API ↔ OpenAI Chat Completions API ↔ OpenCode API
- 🗺️ **Model Mapping**: Maps Claude model names like `claude-sonnet-4-6` / `claude-opus-4-8` to available free models (e.g., `deepseek-v4-flash-free` / `mimo-v2.5-free`), persisted in `config/mappings.json`
- ⚡ **SSE Streaming + Reasoning**:
  - Stable Server-Sent Events forwarding
  - Converts `reasoning_content` (DeepSeek) into Anthropic `thinking` blocks so Claude Code can display the thinking process correctly
- 📊 **Web Dashboard**:
  - **Dashboard**: status, uptime, port, target, Coding Strength comparison (Artificial Analysis)
  - **Models**: live free model list from upstream `/v1/models`
  - **Mappings**: CRUD alias → real model (hot-reloaded)
  - **Logs**: path, original model, mapped model, HTTP status, latency
  - **Playground & Test**: chat with System Prompt / Temperature / Max Tokens + raw response inspector
- 🔑 **No API Key Needed**: default `Bearer public`; any `sk-*` placeholder passes validation
- 🐳 **Docker Ready**: `docker compose up -d` one-click start, see [`DOCKER.md`](./DOCKER.md)

### 🛠️ Requirements

- Node.js >= 18.0.0 (not needed for Docker)
- npm
- Optional: Docker / Docker Compose (recommended)

### 🚀 Quick Start

#### Option A: Docker (Recommended)

```bash
# 1. Build & start (uses host proxy 127.0.0.1:10809 via host.docker.internal)
docker compose up -d --build

# 2. Logs
docker logs -f opencode-free-proxy

# 3. Verify
curl http://127.0.0.1:4096/api/status
curl http://127.0.0.1:4096/v1/models

# 4. Dashboard http://127.0.0.1:4096
```

> Proxy note: `127.0.0.1` inside container points to itself; the compose file uses `host.docker.internal:10809` + `extra_hosts: host-gateway`. Change `HTTP_PROXY/HTTPS_PROXY` in `docker-compose.yml` if your proxy port differs; remove the `environment` block if you can reach `opencode.ai` directly. See [`DOCKER.md`](./DOCKER.md) for details.

#### Option B: Local Node.js

```bash
npm install

# Dev (auto-reload)
npm run dev

# Production
npm start
# Dashboard http://127.0.0.1:4096
```

### ⚙️ Configuration

| File | Description |
|------|-------------|
| `config/settings.json` | `port` / `host` (default `4096` / `0.0.0.0`, Docker requires `0.0.0.0`), `notify` (`enabled` / `exe` / `debounceMs`) |
| `config/mappings.json` | Left = requested alias, Right = real free model. Edit via Dashboard or file; hot-reloaded |

### 🤖 Client Integration

#### Claude Code

**Windows quick script:**
```cmd
proxy-claude.cmd
```

**PowerShell manual:**
```powershell
$env:ANTHROPIC_BASE_URL="http://127.0.0.1:4096"
$env:ANTHROPIC_API_KEY="sk-ant-api03-proxy-opencode-free-000000000000000000000000000000000000000000000000000000-000000000AA"
claude
```

**CMD manual:**
```cmd
set ANTHROPIC_BASE_URL=http://127.0.0.1:4096
set ANTHROPIC_API_KEY=sk-ant-api03-proxy-opencode-free-000000000000000000000000000000000000000000000000000000-000000000AA
claude
```

> `ANTHROPIC_API_KEY` is a placeholder to pass length checks; the proxy replaces it with the upstream header. `BASE_URL` for Claude should NOT include `/v1` (SDK appends `/v1/messages`).

#### OpenCode CLI / Any OpenAI-Compatible Client

```json
{
  "provider": "openai",
  "baseURL": "http://127.0.0.1:4096/v1",
  "apiKey": "not-needed"
}
```
or env:
```bash
export OPENAI_BASE_URL=http://127.0.0.1:4096/v1
export OPENAI_API_KEY=not-needed
# Use -free models like deepseek-v4-flash-free
```

Available free models (check `/v1/models`): `deepseek-v4-flash-free` (recommended, reasoning), `mimo-v2.5-free`, `nemotron-3-ultra-free`, `north-mini-code-free`, `big-pickle`, etc.

### 📈 Free Model Ranking (Coding Strength)

Based on Artificial Analysis Coding Index:

| Model ID | Score | Vision | Reasoning | Default Alias |
| :--- | :---: | :---: | :---: | :--- |
| `mimo-v2.5-free` | 42.1 | ✅ | ❌ | `claude-opus-4-8` |
| `deepseek-v4-flash-free` | 38.7 | ❌ | ✅ | `claude-sonnet-4-6` |
| `nemotron-3-ultra-free` | 37.6 | ❌ | ❌ | `claude-haiku-4-5` |
| `north-mini-code-free` | 33.4 | ❌ | ❌ | `claude-sonnet-4` |

### 📂 Project Structure

```text
├── config/                  # mappings & settings
│   ├── mappings.json
│   └── settings.json
├── public/                  # dashboard assets
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   ├── pages.css
│   └── tokens.css
├── src/                     # proxy source
│   ├── constants.js
│   ├── fetcher.js
│   ├── logger.js
│   ├── mapper.js
│   ├── modelMeta.js
│   ├── notify.js
│   ├── proxy.js
│   └── translator.js
├── Dockerfile               # node:20-alpine
├── docker-compose.yml       # compose + healthcheck
├── docker-entrypoint.sh     # Windows notify compat
├── DOCKER.md                # Docker details
├── server.js                # Express entry
├── package.json
└── README.md
```

### Notes

1. Free tier is rate-limited (a few RPM), suitable for light tasks
2. Requires proxy to reach `opencode.ai` if your network blocks it; Docker composes `host.docker.internal` for you
3. Upstream URL & auth headers are hardcoded in `src/constants.js`

---

## 📄 License

MIT — free for personal and commercial use.
