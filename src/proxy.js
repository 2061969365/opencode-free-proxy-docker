try { const { Agent, setGlobalDispatcher } = await import("undici"); setGlobalDispatcher(new Agent({ keepAliveTimeout: 30000, keepAliveMaxTimeout: 60000, connections: 50 })); } catch {}
import { API, DEFAULT_HEADERS } from "./constants.js";
import { anthropicToOpenAI, openaiToAnthropic, createAnthropicSSETransformer } from "./translator.js";
const MAP = { "claude-sonnet-4-6": "deepseek-v4-flash-free", "claude-opus-4-8": "mimo-v2.5-free", "claude-haiku-4-5": "nemotron-3-ultra-free", "claude-sonnet-4": "north-mini-code-free", "claude-opus-1m": "mimo-v2.5-free", "claude-sonnet-4-6[1m]": "mimo-v2.5-free" };
function resolve(m) { return MAP[m] || MAP[m?.replace?.(/\[\d+[mks]?\]/i, "").trim()] || m; }
import { Readable } from "stream";
import { pipeline } from "stream/promises";

function normalizeError(format, status, rawText) {
  let msg = rawText;
  try { const j = JSON.parse(rawText); msg = j.error?.message || j.error?.error?.message || j.message || rawText; } catch {}
  msg = String(msg).trim().slice(0, 500) || `Upstream ${status}`;
  if (format === "claude") {
    const map = { 400: "invalid_request_error", 401: "authentication_error", 404: "not_found_error", 429: "rate_limit_error" };
    return { type: "error", error: { type: map[status] || "api_error", message: msg } };
  }
  return { error: { message: msg, type: status >= 500 ? "api_error" : "invalid_request_error", code: status } };
}

function stripModelSuffix(model) {
  if (!model || typeof model !== "string") return model;
  return model.replace(/\[\d+[mks]?\]/i, "").trim();
}
function isResponsesModel(model) { return typeof model === "string" && model.startsWith("muse-spark"); }
function chatBodyToResponses(chatBody) {
  try {
    const parsed = JSON.parse(chatBody);
    const input = [];
    const instructions = parsed.messages?.filter(m => m.role === "system").map(m => typeof m.content === "string" ? m.content : Array.isArray(m.content) ? m.content.map(c=>c.text||"").join("\n") : "").filter(Boolean).join("\n") || undefined;
    for (const m of (parsed.messages || [])) {
      if (m.role === "system") continue;
      if (m.role === "user") input.push({ role: "user", content: [{ type: "input_text", text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }] });
      else if (m.role === "assistant") {
        if (typeof m.content === "string" && m.content) input.push({ role: "assistant", content: [{ type: "output_text", text: m.content }] });
        if (Array.isArray(m.tool_calls)) for (const tc of m.tool_calls) if (tc.function?.name) input.push({ type: "function_call", call_id: tc.id, name: tc.function.name, arguments: tc.function.arguments || "{}" });
      } else if (m.role === "tool") input.push({ type: "function_call_output", call_id: m.tool_call_id || `call_${input.length}`, output: typeof m.content === "string" ? m.content : JSON.stringify(m.content) });
    }
    const out = { model: parsed.model, input, stream: parsed.stream !== false };
    if (instructions) out.instructions = instructions;
    if (parsed.tools) {
      const mapped = parsed.tools.map(t => ({ type: "function", name: t.function?.name || t.name || "", description: t.function?.description || "", parameters: t.function?.parameters || { type: "object", properties: {} } }));
      const hasW = mapped.some(x => x.name.toLowerCase() === "websearch" || x.name.toLowerCase() === "web_search");
      if (hasW && !mapped.some(x => x.type === "web_search")) mapped.push({ type: "web_search" });
      out.tools = mapped;
    }
    if (parsed.max_tokens) out.max_output_tokens = parsed.max_tokens;
    return JSON.stringify(out);
  } catch { return chatBody; }
}
function responsesToChat(j, originalModel) {
  try {
    const obj = typeof j === "string" ? JSON.parse(j) : j;
    const outText = (obj.output || []).filter(o => o.type === "message").flatMap(o => o.content || []).filter(c => c.type === "output_text").map(c => c.text).join("\n");
    const toolCalls = (obj.output || []).filter(o => o.type === "function_call").map(o => ({ id: o.call_id || o.id, type: "function", function: { name: o.name, arguments: o.arguments || "{}" } }));
    return { id: obj.id || `gen-${Date.now()}`, object: "chat.completion", created: Math.floor(Date.now()/1000), model: obj.model || originalModel, choices: [{ index: 0, finish_reason: toolCalls.length ? "tool_calls" : "stop", message: { role: "assistant", content: outText || "", tool_calls: toolCalls.length ? toolCalls : undefined } }], usage: { prompt_tokens: obj.usage?.input_tokens || 0, completion_tokens: obj.usage?.output_tokens || 0, total_tokens: obj.usage?.total_tokens || 0 } };
  } catch { return j; }
}
function createResponsesToChatSSETransformer(originalModel) {
  let buffer = ""; const decoder = new TextDecoder(); const encoder = new TextEncoder(); const toolCalls = new Map();
  return new TransformStream({
    transform(chunk, controller) {
      const text = typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
      buffer += text; const lines = buffer.split("\n"); buffer = lines.pop() || "";
      for (const line of lines) {
        const t = line.trim(); if (!t.startsWith("data: ")) continue; const d = t.slice(6); if (d === "[DONE]") continue;
        let ev; try { ev = JSON.parse(d); } catch { continue; }
        if (ev.type === "response.output_text.delta" && ev.delta) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: ev.item_id || "gen", object: "chat.completion.chunk", created: Math.floor(Date.now()/1000), model: originalModel, choices: [{ index: 0, delta: { content: ev.delta }, finish_reason: null }] })}\n\n`));
        else if (ev.type === "response.output_item.added" && ev.item?.type === "function_call") { const idx = ev.output_index ?? toolCalls.size; const key = ev.item.id || `call_${idx}`; toolCalls.set(key, { id: ev.item.call_id || ev.item.id, name: ev.item.name || "", args: "", idx }); if (ev.item.call_id && ev.item.call_id !== key) toolCalls.set(ev.item.call_id, toolCalls.get(key)); controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: ev.item.id || "gen", object: "chat.completion.chunk", created: Math.floor(Date.now()/1000), model: originalModel, choices: [{ index: 0, delta: { tool_calls: [{ index: idx, id: ev.item.call_id || ev.item.id, type: "function", function: { name: ev.item.name || "", arguments: "" } }] }, finish_reason: null }] })}\n\n`)); }
        else if (ev.type === "response.function_call_arguments.delta" && ev.delta) { let tc = toolCalls.get(ev.item_id); if (!tc && typeof ev.output_index === "number") for (const v of toolCalls.values()) if (v.idx === ev.output_index) { tc = v; break; } if (tc) { tc.args += ev.delta; controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: ev.item_id, object: "chat.completion.chunk", created: Math.floor(Date.now()/1000), model: originalModel, choices: [{ index: 0, delta: { tool_calls: [{ index: tc.idx ?? 0, function: { arguments: ev.delta } }] }, finish_reason: null }] })}\n\n`)); } }
        else if (ev.type === "response.completed" || ev.type === "response.incomplete") { const u = ev.response?.usage || {}; const hasTool = toolCalls.size > 0; controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: ev.response?.id || "gen", object: "chat.completion.chunk", created: Math.floor(Date.now()/1000), model: originalModel, choices: [{ index: 0, delta: {}, finish_reason: hasTool ? "tool_calls" : "stop" }], usage: { prompt_tokens: u.input_tokens || 0, completion_tokens: u.output_tokens || 0, total_tokens: u.total_tokens || 0 } })}\n\n`)); controller.enqueue(encoder.encode("data: [DONE]\n\n")); }
      }
    },
    flush(controller) { controller.enqueue(encoder.encode("data: [DONE]\n\n")); }
  });
}

export async function handleProxy(req, res, format) {
  const start = Date.now();
  const originalModel = req.body?.model || "unknown";
  let body = { ...req.body };
  if (typeof body.model === "string") body.model = stripModelSuffix(body.model);
  if (!body.model) return res.status(400).json(normalizeError(format, 400, "Missing model"));
  body.model = resolve(body.model);
  if (!body.messages || (Array.isArray(body.messages) && body.messages.length === 0)) {
    return res.status(400).json(normalizeError(format, 400, 'Input required: specify "prompt" or "messages"'));
  }
  const rawLen = req.headers["content-length"] ? parseInt(req.headers["content-length"], 10) : 0;
  if (rawLen > 5 * 1024 * 1024) return res.status(413).json(normalizeError(format, 413, "Body too large"));
  const bodyBytes = Buffer.byteLength(JSON.stringify(req.body || {}), "utf8");
  if (bodyBytes > 5 * 1024 * 1024) return res.status(413).json(normalizeError(format, 413, "Body too large"));
  const mem = process.memoryUsage();
  if (mem.heapUsed > 800 * 1024 * 1024) return res.status(503).json(normalizeError(format, 503, "Proxy heap high"));
  // Antigravity: tool_result 截断 (防长会话线性膨胀 540k→4MB)
  if (body.messages) {
    for (const m of body.messages) {
      if (Array.isArray(m.content)) {
        for (const b of m.content) {
          if (b.type === "tool_result" && typeof b.content === "string" && b.content.length > 8000) b.content = b.content.slice(0, 8000) + `...[truncated ${b.content.length}->8000]`;
          if (Array.isArray(b.content)) b.content = b.content.map(x => (x.text && x.text.length > 8000 ? { ...x, text: x.text.slice(0, 8000) + `...[truncated]` } : x));
        }
      }
    }
  }
  const stream = body.stream !== false;
  let upstreamBody;
  if (format === "claude") upstreamBody = anthropicToOpenAI(body);
  else upstreamBody = { ...body, model: resolve(stripModelSuffix(body.model)) };
  upstreamBody = JSON.stringify(upstreamBody);
  const headers = { ...DEFAULT_HEADERS, "Content-Type": "application/json", Accept: "text/event-stream" };
  const controller = new AbortController();
  const firstByteMs = Math.min(120000, 30000 + Math.floor(upstreamBody.length / 1000) * 400);
  const timeout = setTimeout(() => controller.abort(), firstByteMs);
  let lastActivity = Date.now();
  const idleTimer = setInterval(() => { if (Date.now() - lastActivity > 120000) controller.abort(); }, 15000);
  const touch = () => { lastActivity = Date.now(); };
  res.on("close", () => { clearTimeout(timeout); clearInterval(idleTimer); controller.abort(); });
  const stopTimers = () => { clearTimeout(timeout); clearInterval(idleTimer); };
  let isResp = isResponsesModel(body.model);
  let targetUrl = isResp ? API.RESPONSES : API.CHAT;
  let fetchBody = isResp ? chatBodyToResponses(upstreamBody) : upstreamBody;
  try {
    let upstreamRes = await fetch(targetUrl, { method: "POST", headers, body: fetchBody, signal: controller.signal });
    stopTimers();
    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text().catch(() => "");
      return res.status(upstreamRes.status).json(normalizeError(format, upstreamRes.status, errText));
    }
    const needRespTransform = isResp;
    if (format === "claude") {
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        let webStream;
        if (needRespTransform) {
          const chatSSE = upstreamRes.body.pipeThrough(createResponsesToChatSSETransformer(originalModel));
          const chatText = chatSSE.pipeThrough(new TextDecoderStream());
          webStream = chatText.pipeThrough(createAnthropicSSETransformer(originalModel)).pipeThrough(new TextEncoderStream());
        } else {
          webStream = upstreamRes.body.pipeThrough(createAnthropicSSETransformer(originalModel)).pipeThrough(new TextEncoderStream());
        }
        const nodeStream = Readable.fromWeb(webStream);
        nodeStream.on("data", touch);
        await pipeline(nodeStream, res).catch(() => { clearInterval(idleTimer); });
      } else {
        if (needRespTransform) {
          const txt = await upstreamRes.text();
          res.json(openaiToAnthropic(responsesToChat(txt, originalModel), body.model, originalModel));
        } else {
          const oaJson = await upstreamRes.json();
          res.json(openaiToAnthropic(oaJson, body.model, originalModel));
        }
      }
    } else {
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        let src = upstreamRes.body;
        if (needRespTransform) src = src.pipeThrough(createResponsesToChatSSETransformer(originalModel));
        const nodeStream = Readable.fromWeb(src);
        nodeStream.on("data", touch);
        await pipeline(nodeStream, res).catch(() => { clearInterval(idleTimer); });
      } else {
        if (needRespTransform) {
          const txt = await upstreamRes.text();
          res.json(responsesToChat(txt, originalModel));
        } else {
          const json = await upstreamRes.json();
          res.json(json);
        }
      }
    }
  } catch (err) {
    stopTimers();
    if (err.name === "AbortError") return;
    if (!res.headersSent) res.status(500).json(normalizeError(format, 500, err.message));
  }
}
