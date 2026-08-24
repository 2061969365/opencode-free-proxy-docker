# OpenCode Free Proxy — P1/P2/P3 并行修复计划

范围决策（用户已确认）：
- **只做 P1-P3**：稳定性、SSE/翻译正确性、API 兼容
- **跳过 P4**（Codex /v1/responses）
- **跳过 P5**（安全/运维）

## 文件分区（互不重叠，避免冲突）

| 子代理 | 文件 | 对应计划项 |
|--------|------|-----------|
| Agent A | `src/proxy.js` | P1-1 流式 error 处理、P1-2 客户端断开 abort、P1-3 空闲超时、P3-11 错误响应规范化 |
| Agent B | `src/translator.js` | P2-4 并行工具调用、P2-5 usage 捕获、P2-6 TextDecoder 复用、P2-7 flush 残留行、P2-8 空流补 message_start |
| Agent C | `server.js` + `src/mapper.js` | P3-9 count_tokens/org 桩 + JSON 404、P3-10 models 形状、P3-12 模型映射补齐、P3-13 错误中间件 413 |

**约束**：
- 三个文件互不依赖签名变化（translator 导出签名保持 `anthropicToOpenAI / openaiToAnthropic / createAnthropicSSETransformer`）
- 每个 Agent 完成文件编辑后跑 `node --check <file>` 确认语法
- **不要重启/停止运行中的代理进程**（集成阶段统一处理）
- 保持代码风格：无注释（除非必要）、2 空格缩进、已有 export 结构

## 各计划项详细规格

### P1-1 流式 error 处理（proxy.js）
Claude 流式路径（`Readable.fromWeb(webStream)` 处）与 openai 流式路径（`Readable.fromWeb(upstreamRes.body)` 处）：
- 给 nodeStream 挂 `on("error", handler)`
- handler：`console.log` 记录 + `add()` 写入 dashboard 日志（status 500, error）
- claude 路径：若 headersSent 且未 finish，补发 `event: message_stop` SSE 帧后 `res.end()`（尽力而为，用 try/catch）
- openai 路径：直接 `res.destroy()` 或 `res.end()`
- 用 `stream.pipeline` 或手动 pipe 均可，但必须保证 error 不逃逸成 `Unhandled 'error'`

### P1-2 客户端断开 abort（proxy.js）
- 每个流式请求建 `AbortController`
- `res.on("close")`：若请求未自然结束，`controller.abort()` 中止上游 fetch
- fetch 的 `signal` 用该 controller（替代 `AbortSignal.timeout`，见 P1-3）

### P1-3 空闲超时（proxy.js）
- 移除 `AbortSignal.timeout(300000)`
- 建 `AbortController`；维护 `lastActivity` 时间戳，每次读取 chunk 更新
- 定时器：首字节超时 60s；整体空闲超时 300s（无数据才 abort）
- 具体实现可简化：interval 每 30s 检查一次 `Date.now() - lastActivity > 300000` 则 abort；首字节用一次性 setTimeout 60s

### P2-4 并行工具调用（translator.js）
现状缺陷：`emitToolDelta` 只在 `activeType !== "tool"` 时 `startTool`，第二个工具（index 1）的 delta 会以 index 0 的 `st.activeIndex` 发出，参数拼接进第一个块。
修法：
- `st.tools` Map（key=tc.index）已存在；新增 per-tool 的活动块状态，或复用 activeType/activeIndex 但**按 index 变化切换**：
  - 记录 `st.activeToolIndex`
  - `emitToolDelta(controller, tool, partial, idx)`：若 `st.activeType !== "tool"` 或 `st.activeToolIndex !== idx`，先 `stopActive()` 再 `startTool(controller, tool)`，并设 `st.activeToolIndex = idx`
- `startTool` 里也要处理 `input: {}` 已含 id/name
- `finish()`：收尾时 `stopActive` 已存在（会停掉当前活动工具块），确认无遗漏即可

### P2-5 usage 捕获（translator.js）
现状缺陷：`st.usage` 只在 `choice.finish_reason` 分支捕获；`finish()` 置 `st.finished=true` 后，独立 usage 尾块（`choices:[]`）被 `if (st.finished) continue` 跳过 → usage 恒 0/0。
修法：
- 每个解析成功的 chunk，只要 `oa.usage` 存在就更新 `st.usage`（放到 `st.finished` 判断**之前**，或保留判断但单独捕获 usage）
- 最稳：把 `finish()` 从 transform 内移除，只保留在 `flush()` 调用；transform 里见到 finish_reason 只记录 `st.stopReason`，继续消费后续 usage 尾块
- `message_start` 的 usage 保持 0/0 可接受（Claude Code 以 message_delta 为准）

### P2-6 TextDecoder 复用（translator.js）
- `new TextDecoder()` 提到 `createAnthropicSSETransformer` 闭包外层创建一次，`transform` 内复用 `decoder.decode(chunk, {stream:true})`

### P2-7 flush 残留行（translator.js）
- `flush()` 内：若 `buffer` 还有内容，按与 transform 相同的行解析逻辑处理（抽公共 `processLines(lines, controller)` 函数复用），再 `finish()`
- 注意防止 finish 重复（st.finished 已守卫）

### P2-8 空流补 message_start（translator.js）
- `finish()` 开头：若 `st.messageStartSent === false`，先补发一个最小 `message_start`（id/type/role/content/model/usage 0/0），再走收尾

### P3-9 count_tokens / org 桩 + JSON 404（server.js）
- `POST /v1/messages/count_tokens`：解析 `{messages, model, tools}`，按 `JSON.stringify` 长度估算（约 4 字符/token），返回 `{input_tokens: <估算>}`
- `GET /v1/organizations` → `{data:[{id:"default",name:"default"}]}`
- `POST /v1/organizations` → 最小响应（可 200 空对象）
- 全局 JSON 404 兜底：`app.use((req,res) => res.status(404).json({type:"error", error:{type:"not_found_error", message:`Cannot ${req.method} ${req.path}`}}))`，放在静态目录之后、错误中间件之前

### P3-10 models 形状（server.js）
- `/models` 和 `/models/:id` 返回的每个条目补 `type:"model"`、`created_at`（时间戳）
- 去重：别名与上游同名模型（如 claude-fable-5）合并，别名优先

### P3-12 模型映射补齐（mapper.js DEFAULTS）
新增映射（值沿用同系模型）：
- `claude-opus-4-5` → `mimo-v2.5-free`
- `claude-opus-4-5-20251101` → `mimo-v2.5-free`
- `claude-sonnet-4-5` → `deepseek-v4-flash-free`
- `claude-sonnet-4-5-20250929` → `deepseek-v4-flash-free`
- `claude-haiku-4-5-20251001` → `nemotron-3-ultra-free`
- `claude-3-7-sonnet-20250219` → `north-mini-code-free`
- `claude-3-7-sonnet-latest` → `north-mini-code-free`
- `claude-opus-4-1-20250805` → `mimo-v2.5-free`

### P3-11 错误响应规范化（proxy.js）
- `handleProxy(req,res,format)` 中，上游非 2xx 分支：按 format 规范化
  - claude：`res.status(status).json({type:"error", error:{type: mapStatus(status), message: errText}})`，type 映射：400→`invalid_request_error`、401→`authentication_error`、404→`not_found_error`、429→`rate_limit_error`、5xx→`api_error`，默认 `api_error`
  - openai：`res.status(status).json({error:{message: errText, type: <映射>, code: status}})`，type 缺省 `invalid_request_error`
- errText 若已是 JSON 字符串，可尝试解析出 message 再用；否则用截断文本（≤500 字符）

### P3-13 错误中间件 413（server.js）
- `app.use((err,req,res,next))`：`res.status(err.status || err.statusCode || 500).json(...)`，body-parser 413 会带 `err.status=413`，按其返回 `{type:"error",error:{type:"request_too_large",message:...}}`；内部错误 message 只进日志，对外给通用消息

## 集成验证（主线程统一做，Agent 不做）
1. `node --check` 全部改动文件
2. 重启代理（`node --use-env-proxy server.js`）
3. 端到端：非流式 / 流式 / 并行双工具 / usage 非零 / count_tokens / 未知模型错误格式 / /v1/models 形状 / 404 JSON
4. 回归：Claude Code 主链路 + opencode 直连不受影响