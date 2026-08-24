# OpenCode Free Proxy 🚀

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![API Provider](https://img.shields.io/badge/API-OpenCode%20Free-orange.svg)](https://opencode.ai)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](./DOCKER.md)
[![Docker Image](https://img.shields.io/badge/image-node%3A20--alpine-2496ED.svg)](./Dockerfile)

**OpenCode Free Proxy** là một máy chủ trung gian (Proxy Server) độc lập, gọn nhẹ viết bằng Node.js. Dự án giúp kết nối các công cụ như **Claude Code**, OpenCode CLI, hoặc các API Client tương thích OpenAI/Claude tới dịch vụ API miễn phí của **OpenCode** (`https://opencode.ai/zen/v1`) mà không cần thiết lập phức tạp hay cần khóa API cá nhân (sử dụng Token công cộng `Bearer public`).

Dự án đi kèm một giao diện điều khiển tích hợp (**Web Dashboard**) hiện đại, trực quan, hỗ trợ song ngữ Anh-Việt giúp bạn dễ dàng quản lý, cấu hình ánh xạ model (Model Mapping), xem lịch sử cuộc gọi và trò chuyện trực tiếp (Playground).

> **🐳 Docker 版本已就绪！** 本仓库已支持一键 Docker 部署（零侵入，不修改源码），详见 [`DOCKER.md`](./DOCKER.md) | `docker compose up -d` 即可启动。

---

## 🌟 Tính Năng Nổi Bật

- 🔄 **Chuyển đổi Giao thức Tự động (Protocol Translation):** Dịch chuyển linh hoạt các request từ định dạng Anthropic Messages API và OpenAI Chat Completions API sang API của OpenCode.
- 🗺️ **Ánh Xạ Model (Model Mapping):** Các client như Claude Code thường gọi các model đặc thù như `claude-sonnet-4-6`, `claude-opus-4-8`... Proxy tự động ánh xạ các tên gọi này sang các model miễn phí hiện có trên OpenCode (ví dụ: `deepseek-v4-flash-free`, `mimo-v2.5-free`).
- ⚡ **Hỗ trợ SSE Stream & Reasoning (Suy nghĩ):** 
  - Hỗ trợ chuyển tiếp luồng dữ liệu stream thời gian thực (Server-Sent Events) ổn định.
  - Tự động tách biệt nội dung suy nghĩ `reasoning_content` (của DeepSeek) thành các khối suy nghĩ dạng Anthropic (`type: "thinking"`), giúp Claude Code hiển thị tiến trình suy nghĩ của AI một cách chính xác.
- 📊 **Web Dashboard Trực Quan & Hiện Đại:**
  - **Dashboard:** Theo dõi trạng thái máy chủ, uptime, cổng mạng, địa chỉ đích, và biểu đồ so sánh điểm số lập trình (Coding Strength) của các model miễn phí dựa trên Artificial Analysis Coding Index.
  - **Models:** Liệt kê các model miễn phí đang hoạt động trên hệ thống OpenCode.
  - **Mappings:** Quản lý danh sách ánh xạ bí danh (alias) sang model thật dễ dàng (lưu vào [config/mappings.json](file:///d:/hoccodeweb/opencode-free-proxy/config/mappings.json)).
  - **Logs:** Xem lịch sử yêu cầu API theo thời gian thực (đường dẫn, model đầu vào, model ánh xạ, trạng thái HTTP, thời gian phản hồi).
  - **Playground & Test:** Giao diện chat trực tiếp với AI đầy đủ tùy chọn (System prompt, Temperature, Max tokens) và màn hình kiểm tra phản hồi API thô.
- 🔑 **Không Cần API Key:** Mặc định sử dụng token công cộng `Bearer public` của OpenCode.

---

## 🛠️ Yêu Cầu Hệ Thống

- **Node.js** phiên bản 18.0.0 trở lên.
- Trình quản lý gói **npm** (đi kèm khi cài đặt Node.js).

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 方式 A: Docker 一键启动（推荐）

```bash
# 宿主机需开启代理（默认 127.0.0.1:10809），容器内通过 host.docker.internal 穿透
docker compose up -d --build
docker logs -f opencode-free-proxy
curl http://127.0.0.1:4096/api/status
# Web 面板 http://127.0.0.1:4096
```

代理端口不同请改 `docker-compose.yml` 中 `HTTP_PROXY/HTTPS_PROXY`，无需代理则删除 `environment` 两行。详见 [`DOCKER.md`](./DOCKER.md)。

### 方式 B: 本地 Node.js 运行

#### 1. Cài đặt các gói phụ thuộc
Mở terminal tại thư mục dự án và chạy lệnh:
```bash
npm install
```

#### 2. Khởi chạy máy chủ proxy
- **Chế độ phát triển (Development mode - tự động tải lại khi code thay đổi):**
  ```bash
  npm run dev
  ```
- **Chế độ chạy chính thức (Production mode):**
  ```bash
  npm start
  ```

Sau khi khởi chạy thành công, proxy sẽ chạy tại địa chỉ `http://127.0.0.1:4096` và giao diện Web Dashboard cũng sẵn sàng tại đây.

---

## ⚙️ Cấu Hình Dự Án

Thư mục `config/` chứa các cấu hình quan trọng của hệ thống:

1. **[config/settings.json](file:///d:/hoccodeweb/opencode-free-proxy/config/settings.json):** Cấu hình cổng mạng chạy máy chủ proxy.
   ```json
   {
     "port": 4096
   }
   ```
2. **[config/mappings.json](file:///d:/hoccodeweb/opencode-free-proxy/config/mappings.json):** Danh sách các ánh xạ model. Bạn có thể chỉnh sửa trực tiếp file này hoặc quản lý thông qua thẻ **Mappings** trên Web Dashboard.

---

## 🤖 Kết Nối Với Các Công Cụ

### 1. Kết nối với Claude Code 💻

Claude Code yêu cầu đặt các biến môi trường để trỏ tới proxy. Bạn có thể sử dụng các cách sau:

#### Cách A: Chạy nhanh qua script đi kèm (Windows)
Chỉ cần chạy file script:
```cmd
proxy-claude.cmd
```
Script này sẽ tự động thiết lập các biến môi trường cần thiết và khởi động `claude` kết nối trực tiếp đến proxy.

#### Cách B: Thiết lập thủ công qua PowerShell
Chạy các lệnh sau trước khi mở Claude Code:
```powershell
$env:ANTHROPIC_BASE_URL="http://127.0.0.1:4096"
$env:ANTHROPIC_API_KEY="sk-ant-api03-proxy-opencode-free-000000000000000000000000000000000000000000000000000000-000000000AA"
claude
```

#### Cách C: Thiết lập thủ công qua Command Prompt (cmd.exe)
```cmd
set ANTHROPIC_BASE_URL=http://127.0.0.1:4096
set ANTHROPIC_API_KEY=sk-ant-api03-proxy-opencode-free-000000000000000000000000000000000000000000000000000000-000000000AA
claude
```

> [!NOTE]
> `ANTHROPIC_API_KEY` được thiết lập bằng một chuỗi khóa giả định có độ dài và định dạng hợp lệ để Claude Code vượt qua bước kiểm tra khóa ban đầu. Proxy sẽ tự động chuyển đổi và sử dụng Header thích hợp khi gửi lên OpenCode.

---

### 2. Kết nối với OpenCode CLI 🛠️

Trong file `opencode.json` cấu hình của OpenCode CLI, thiết lập như sau:
```json
{
  "provider": "openai",
  "baseURL": "http://127.0.0.1:4096/v1",
  "apiKey": "not-needed"
}
```

Hoặc thông qua biến môi trường:
```bash
set OPENAI_BASE_URL=http://127.0.0.1:4096/v1
set OPENAI_API_KEY=not-needed
```

---

## 📈 Xếp Hạng Các Model Miễn Phí (Coding Strength)

Dưới đây là các model miễn phí nổi bật trên hệ thống OpenCode (được xếp hạng theo chỉ số năng lực lập trình **Artificial Analysis Coding Index - Terminal-Bench Hard, SciCode**):

| Model ID | Điểm Số (Score) | Hỗ Trợ Hình Ảnh | Hỗ Trợ Reasoning (Suy nghĩ) | Model Ánh Xạ Mặc Định |
| :--- | :---: | :---: | :---: | :--- |
| **`mimo-v2.5-free`** | **42.1** | ✅ Có | ❌ Không | `claude-opus-4-8` |
| **`deepseek-v4-flash-free`** | **38.7** | ❌ Không | ✅ Có | `claude-sonnet-4-6` |
| **`nemotron-3-ultra-free`** | **37.6** | ❌ Không | ❌ Không | `claude-haiku-4-5` |
| **`north-mini-code-free`** | **33.4** | ❌ Không | ❌ Không | `claude-sonnet-4` |

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
├── config/                  # Thư mục chứa cấu hình
│   ├── mappings.json        # File lưu trữ ánh xạ model
│   └── settings.json        # File lưu cấu hình cổng (port) máy chủ
├── public/                  # Tài nguyên tĩnh cho Dashboard
│   ├── app.js               # Logic điều khiển Dashboard & Playground
│   ├── index.html           # Bố cục giao diện Dashboard
│   └── styles.css           # Định dạng CSS (Dark/Light mode, UI hiện đại)
├── src/                     # Mã nguồn máy chủ proxy
│   ├── constants.js         # Các hằng số API & Headers mặc định
│   ├── fetcher.js           # Xử lý gọi danh sách model từ OpenCode
│   ├── logger.js            # Ghi nhật ký yêu cầu thời gian thực
│   ├── mapper.js            # Xử lý logic ánh xạ tên model
│   ├── modelMeta.js         # Lưu điểm số & metadata các model
│   ├── proxy.js             # Xử lý định tuyến & kết nối API ngược
│   ├── notify.js            # 通知模块
│   └── translator.js        # Dịch chuyển cấu trúc request/response OpenAI <-> Anthropic
├── Dockerfile               # Docker 构建文件 (node:20-alpine)
├── docker-compose.yml       # Docker Compose 编排（含健康检查）
├── docker-entrypoint.sh     # 容器入口（自动兼容 Windows notify 路径）
├── DOCKER.md                # Docker 使用说明
├── package.json             # Danh sách gói phụ thuộc và scripts chạy dự án
├── proxy-claude.cmd         # File chạy Claude Code nhanh trên Windows
├── server.js                # Điểm khởi chạy ứng dụng Express server
└── README.md                # Tài liệu hướng dẫn sử dụng (File này)
```

---

## 📄 Bản Quyền & Giấy Phép

Dự án này được phân phối dưới giấy phép **MIT License**. Bạn hoàn toàn có quyền sử dụng, sửa đổi và phân phối lại mã nguồn này cho mục đích cá nhân hoặc thương mại.
