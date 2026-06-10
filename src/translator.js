function anthropicToOpenAI(body) {
  const messages = [];

  if (body.system) {
    const sys = typeof body.system === "string"
      ? body.system
      : body.system.text || "";
    if (sys) messages.push({ role: "system", content: sys });
  }

  if (body.messages) {
    for (const msg of body.messages) {
      const content = normalizeContent(msg.content);
      messages.push({ role: msg.role, content });
    }
  }

  const oa = {
    model: body.model,
    messages,
    stream: body.stream !== false,
  };

  if (body.max_tokens) oa.max_tokens = body.max_tokens;
  if (body.temperature != null) oa.temperature = body.temperature;
  if (body.top_p != null) oa.top_p = body.top_p;
  if (body.stop_sequences) oa.stop = body.stop_sequences;

  return oa;
}

function normalizeContent(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(block => {
      if (block.type === "text") return block.text;
      if (block.type === "image") return "[Image]";
      return JSON.stringify(block);
    }).join("\n");
  }
  return String(content);
}

function openaiToAnthropic(oaBody, reqModel, originalModel) {
  const choice = oaBody.choices?.[0] || {};
  const msg = choice.message || {};

  const blocks = [];
  if (msg.content) blocks.push({ type: "text", text: msg.content });

  const resp = {
    id: oaBody.id,
    type: "message",
    role: msg.role || "assistant",
    content: blocks,
    model: originalModel || reqModel || oaBody.model || "",
    stop_reason: mapFinishReason(choice.finish_reason),
    stop_sequence: null,
    usage: oaBody.usage ? {
      input_tokens: oaBody.usage.prompt_tokens || 0,
      output_tokens: oaBody.usage.completion_tokens || 0,
    } : undefined,
  };

  return resp;
}

function mapFinishReason(fr) {
  switch (fr) {
    case "stop": return "end_turn";
    case "length": return "max_tokens";
    case "content_filter": return "content_filter";
    default: return fr || "end_turn";
  }
}

function createAnthropicSSETransformer(originalModel) {
  let buffer = "";
  const st = {
    messageStartSent: false,
    nextBlockIndex: 0,
    thinkingBlockIndex: -1,
    thinkingBlockStarted: false,
    textBlockIndex: -1,
    textBlockStarted: false,
    textBlockClosed: false,
    finished: false,
  };

  function stopThinkingBlock(controller) {
    if (!st.thinkingBlockStarted) return;
    controller.enqueue(formatSSE("content_block_stop", { index: st.thinkingBlockIndex }));
    st.thinkingBlockStarted = false;
  }

  function stopTextBlock(controller) {
    if (!st.textBlockStarted || st.textBlockClosed) return;
    st.textBlockClosed = true;
    controller.enqueue(formatSSE("content_block_stop", { index: st.textBlockIndex }));
    st.textBlockStarted = false;
  }

  function finish(controller) {
    if (st.finished) return;
    st.finished = true;
    stopThinkingBlock(controller);
    stopTextBlock(controller);
    controller.enqueue(formatSSE("message_stop", {}));
  }

  return new TransformStream({
    start() {},

    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk, { stream: true });
      buffer += text;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const jsonStr = trimmed.slice(6);
        if (jsonStr === "[DONE]") continue;
        if (st.finished) continue;

        try {
          const oa = JSON.parse(jsonStr);
          const delta = oa.choices?.[0]?.delta || {};

          if (!st.messageStartSent) {
            st.messageStartSent = true;
            controller.enqueue(formatSSE("message_start", {
              message: {
                id: oa.id || "msg_unknown",
                type: "message",
                role: delta.role || "assistant",
                content: [],
                model: originalModel || oa.model || "",
                stop_reason: null,
                stop_sequence: null,
                usage: { input_tokens: 0, output_tokens: 0 },
              },
            }));
          }

          if (st.finished) continue;

          // Reasoning/thinking content (stop text block first)
          if (delta.reasoning_content) {
            stopTextBlock(controller);
            if (!st.thinkingBlockStarted) {
              st.thinkingBlockIndex = st.nextBlockIndex++;
              st.thinkingBlockStarted = true;
              controller.enqueue(formatSSE("content_block_start", {
                index: st.thinkingBlockIndex,
                content_block: { type: "thinking", thinking: "" },
              }));
            }
            controller.enqueue(formatSSE("content_block_delta", {
              index: st.thinkingBlockIndex,
              delta: { type: "thinking_delta", thinking: delta.reasoning_content },
            }));
          }

          if (st.finished) continue;

          // Text content (stop thinking block first)
          if (delta.content) {
            stopThinkingBlock(controller);
            if (!st.textBlockStarted) {
              st.textBlockIndex = st.nextBlockIndex++;
              st.textBlockStarted = true;
              st.textBlockClosed = false;
              controller.enqueue(formatSSE("content_block_start", {
                index: st.textBlockIndex,
                content_block: { type: "text", text: "" },
              }));
            }
            controller.enqueue(formatSSE("content_block_delta", {
              index: st.textBlockIndex,
              delta: { type: "text_delta", text: delta.content },
            }));
          }

          if (st.finished) continue;

          // Finish reason received
          if (oa.choices?.[0]?.finish_reason) {
            stopThinkingBlock(controller);
            stopTextBlock(controller);
            controller.enqueue(formatSSE("message_delta", {
              delta: {
                stop_reason: mapFinishReason(oa.choices[0].finish_reason),
                stop_sequence: null,
              },
              usage: oa.usage ? {
                input_tokens: oa.usage.prompt_tokens || 0,
                output_tokens: oa.usage.completion_tokens || 0,
              } : undefined,
            }));
            finish(controller);
          }
        } catch {}
      }
    },

    flush(controller) {
      finish(controller);
    },
  });
}

function formatSSE(type, data) {
  const payload = JSON.stringify({ type, ...data });
  return `event: ${type}\ndata: ${payload}\n\n`;
}

export { anthropicToOpenAI, openaiToAnthropic, createAnthropicSSETransformer };
