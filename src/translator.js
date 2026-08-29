function anthropicToOpenAI(body) {
  const messages = [];
  const sysText = extractSystemText(body.system);
  if (sysText) messages.push({ role: "system", content: sysText });
  if (body.messages) {
    for (const msg of body.messages) {
      const blocks = Array.isArray(msg.content) ? msg.content : null;
      if (msg.role === "assistant") {
        const oa = { role: "assistant", content: textFromBlocks(msg.content) || "" };
        const thinking = blocks ? blocks.filter((b) => b.type === "thinking").map((b) => b.thinking || "").filter(Boolean).join("\n") : "";
        if (thinking) oa.reasoning_content = thinking;
        const toolCalls = blocks ? blocks.filter((b) => b.type === "tool_use" && b.name).map((b) => ({ id: b.id || `toolu_${Math.random().toString(36).slice(2, 10)}`, type: "function", function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) } })) : [];
        if (toolCalls.length) oa.tool_calls = toolCalls;
        messages.push(oa);
      } else if (msg.role === "user" && blocks?.some((b) => b.type === "tool_result")) {
        const seen = new Set();
        for (const b of blocks) {
          if (b.type !== "tool_result") continue;
          const id = b.tool_use_id || `toolu_unknown`;
          if (seen.has(id)) continue;
          seen.add(id);
          messages.push({ role: "tool", tool_call_id: id, content: toolResultText(b) });
        }
        const other = textFromBlocks(blocks.filter((b) => b.type !== "tool_result"));
        if (other) messages.push({ role: "user", content: other });
      } else {
        messages.push({ role: msg.role, content: normalizeContent(msg.content) });
      }
    }
  }
  const oa = { model: stripModelSuffix(body.model), messages, stream: body.stream !== false };
  if (body.max_tokens) oa.max_tokens = Math.min(Number(body.max_tokens) || 128000, 128000);
  if (body.temperature != null) oa.temperature = body.temperature;
  if (body.top_p != null) oa.top_p = body.top_p;
  if (body.stop_sequences) oa.stop = body.stop_sequences;
  if (oa.stream) oa.stream_options = { include_usage: true };
  if (body.thinking?.type === "disabled") { delete oa.reasoning_effort; delete oa.output_config; } else if (body.reasoning_effort) oa.reasoning_effort = body.reasoning_effort;
  if (Array.isArray(body.tools) && body.tools.length) {
    oa.tools = body.tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description || "", parameters: t.input_schema || { type: "object", properties: {} } } }));
  }
  if (body.tool_choice) {
    const tc = body.tool_choice;
    if (tc.type === "any") oa.tool_choice = "required";
    else if (tc.type === "auto" || tc.type === "none") oa.tool_choice = tc.type;
    else if (tc.type === "tool" && tc.name) oa.tool_choice = { type: "function", function: { name: tc.name } };
  }
  return oa;
}
function extractSystemText(s) { if (!s) return ""; if (typeof s === "string") return s; if (s.text) return s.text; if (Array.isArray(s)) return s.map((b) => (b?.type === "text" ? b.text : "")).filter(Boolean).join("\n"); return ""; }
function getThinkingFamily(m) { return null; }
function stripModelSuffix(m) { if (!m || typeof m !== "string") return m; return m.replace(/\[\d+[mks]?\]/i, "").trim(); }
function normalizeContent(c) { if (typeof c === "string") return c; if (Array.isArray(c)) return c.map((b) => { if (b.type === "text") return b.text; if (b.type === "image") return "[Image]"; return ""; }).filter(Boolean).join("\n"); return String(c); }
function textFromBlocks(c) { if (typeof c === "string") return c; if (Array.isArray(c)) return c.map((b) => { if (b.type === "text") return b.text; return ""; }).filter(Boolean).join("\n"); return ""; }
function toolResultText(b) { const c = b.content; if (typeof c === "string") return c; if (Array.isArray(c)) return c.map((x) => x.text || JSON.stringify(x)).join("\n"); return JSON.stringify(c); }
function openaiToAnthropic(oaBody, reqModel, originalModel) {
  const choice = oaBody.choices?.[0] || {};
  const msg = choice.message || {};
  const blocks = [];
  if (msg.content) blocks.push({ type: "text", text: msg.content });
  if (Array.isArray(msg.tool_calls)) {
    for (const tc of msg.tool_calls) {
      let input = {};
      try { input = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {}; } catch { input = { _raw: tc.function?.arguments }; }
      blocks.push({ type: "tool_use", id: tc.id || `toolu_${Math.random().toString(36).slice(2, 10)}`, name: tc.function?.name || "", input });
    }
  }
  return { id: oaBody.id, type: "message", role: msg.role || "assistant", content: blocks, model: originalModel || reqModel || oaBody.model || "", stop_reason: msg.tool_calls?.length ? "tool_use" : (choice.finish_reason === "stop" ? "end_turn" : choice.finish_reason || "end_turn"), stop_sequence: null, usage: { input_tokens: oaBody.usage?.prompt_tokens || 0, output_tokens: oaBody.usage?.completion_tokens || 0 } };
}
function createAnthropicSSETransformer(originalModel) {
  let buffer = "";
  const decoder = new TextDecoder();
  const st = { messageStartSent: false, nextBlockIndex: 0, activeType: null, activeIndex: -1, tools: new Map(), stopReason: "end_turn", usage: undefined, finished: false };
  function stopActive(c) { if (st.activeType === null) return; c.enqueue(formatSSE("content_block_stop", { index: st.activeIndex })); st.activeType = null; st.activeIndex = -1; }
  function startText(c) { stopActive(c); st.activeIndex = st.nextBlockIndex++; st.activeType = "text"; c.enqueue(formatSSE("content_block_start", { index: st.activeIndex, content_block: { type: "text", text: "" } })); }
  function finish(c) {
    if (st.finished) return; st.finished = true;
    if (!st.messageStartSent) { st.messageStartSent = true; c.enqueue(formatSSE("message_start", { message: { id: "msg_unknown", type: "message", role: "assistant", content: [], model: originalModel || "", stop_reason: null, stop_sequence: null, usage: { input_tokens: 0, output_tokens: 0 } } })); }
    stopActive(c);
    if (st.tools.size > 0 && st.stopReason !== "max_tokens") {
      for (const tool of [...st.tools.values()]) {
        const idx = st.nextBlockIndex++;
        c.enqueue(formatSSE("content_block_start", { index: idx, content_block: { type: "tool_use", id: tool.id, name: tool.name, input: {} } }));
        c.enqueue(formatSSE("content_block_delta", { index: idx, delta: { type: "input_json_delta", partial_json: tool.args || "{}" } }));
        c.enqueue(formatSSE("content_block_stop", { index: idx }));
      }
      st.stopReason = "tool_use";
    }
    c.enqueue(formatSSE("message_delta", { delta: { stop_reason: st.stopReason, stop_sequence: null }, usage: st.usage || { input_tokens: 0, output_tokens: 0 } }));
    c.enqueue(formatSSE("message_stop", {}));
  }
  function handleLine(line, c) {
    const t = line.trim(); if (!t.startsWith("data: ")) return; const j = t.slice(6); if (j === "[DONE]") return; if (st.finished) return;
    let oa; try { oa = JSON.parse(j); } catch { return; }
    if (oa.error) { if (!st.messageStartSent) { st.messageStartSent = true; c.enqueue(formatSSE("message_start", { message: { id: "msg_unknown", type: "message", role: "assistant", content: [], model: originalModel || "", stop_reason: null, stop_sequence: null, usage: { input_tokens: 0, output_tokens: 0 } } })); } c.enqueue(`event: error\ndata: ${JSON.stringify({ type: "error", error: { type: oa.error.type || "api_error", message: oa.error.message || JSON.stringify(oa.error) } })}\n\n`); c.enqueue(formatSSE("message_stop", {})); st.finished = true; return; }
    if (oa.usage) st.usage = { input_tokens: oa.usage.prompt_tokens || 0, output_tokens: oa.usage.completion_tokens || 0 };
    const choice = oa.choices?.[0] || {}; const delta = choice.delta || {};
    if (!st.messageStartSent) { st.messageStartSent = true; c.enqueue(formatSSE("message_start", { message: { id: oa.id || "msg_unknown", type: "message", role: delta.role || "assistant", content: [], model: originalModel || oa.model || "", stop_reason: null, stop_sequence: null, usage: { input_tokens: 0, output_tokens: 0 } } })); }
    if (Array.isArray(delta.tool_calls)) { for (const tc of delta.tool_calls) { const idx = tc.index ?? 0; let tool = st.tools.get(idx); if (!tool) { tool = { id: tc.id || `toolu_${idx}`, name: tc.function?.name || "", args: "" }; st.tools.set(idx, tool); } if (tc.id) tool.id = tc.id; if (tc.function?.name) tool.name = tc.function?.name; if (tc.function?.arguments) tool.args += tc.function.arguments; } }
    if (delta.content) { if (st.activeType !== "text") startText(c); c.enqueue(formatSSE("content_block_delta", { index: st.activeIndex, delta: { type: "text_delta", text: delta.content } })); }
    if (choice.finish_reason) st.stopReason = choice.finish_reason === "tool_calls" ? "tool_use" : choice.finish_reason === "stop" ? "end_turn" : choice.finish_reason;
  }
  return new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      buffer += text;
      if (buffer.length > 256 * 1024) buffer = buffer.slice(-256 * 1024);
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) handleLine(line, controller);
    },
    flush(controller) {
      if (buffer) { const lines = buffer.split("\n"); buffer = ""; for (const line of lines) handleLine(line, controller); }
      finish(controller);
    },
  });
}
function formatSSE(type, data) { return `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`; }
export { anthropicToOpenAI, openaiToAnthropic, createAnthropicSSETransformer };
