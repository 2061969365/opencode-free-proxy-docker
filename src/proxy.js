import { API, DEFAULT_HEADERS } from "./constants.js";
import { resolve } from "./mapper.js";
import { add } from "./logger.js";
import { Readable } from "stream";
import { anthropicToOpenAI, openaiToAnthropic, createAnthropicSSETransformer } from "./translator.js";

async function handleProxy(req, res, format) {
  const start = Date.now();
  const originalModel = req.body?.model || "unknown";

  let body = { ...req.body };
  const resolvedModel = resolve(body.model);
  body.model = resolvedModel;

  console.log(`[PROXY] ${originalModel} → ${resolvedModel} | ${format} | stream=${body.stream !== false}`);

  const stream = body.stream !== false;

  let upstreamBody;
  if (format === "claude") {
    upstreamBody = JSON.stringify(anthropicToOpenAI(body));
  } else {
    upstreamBody = JSON.stringify(body);
  }

  const headers = {
    ...DEFAULT_HEADERS,
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };

  try {
    const upstreamRes = await fetch(API.CHAT, {
      method: "POST",
      headers,
      body: upstreamBody,
      signal: AbortSignal.timeout(300000),
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      console.log(`[PROXY] ✗ upstream ${upstreamRes.status}: ${errText.slice(0, 150)}`);
      add({
        method: req.method, path: req.path,
        model: originalModel, mappedTo: body.model,
        status: upstreamRes.status, duration: Date.now() - start,
        error: errText.slice(0, 200),
      });
      return res.status(upstreamRes.status).json({ error: errText });
    }

    add({
      method: req.method, path: req.path,
      model: originalModel, mappedTo: body.model,
      status: upstreamRes.status, duration: Date.now() - start,
    });

    if (format === "claude") {
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        const transformer = createAnthropicSSETransformer(originalModel);
        const encoderStream = new TextEncoderStream();
        const webStream = upstreamRes.body
          .pipeThrough(transformer)
          .pipeThrough(encoderStream);
        const nodeStream = Readable.fromWeb(webStream);
        nodeStream.on("end", () => console.log(`[PROXY] ✓ ${originalModel} done ${Date.now() - start}ms`));
        nodeStream.pipe(res);
      } else {
        const oaJson = await upstreamRes.json();
        const anJson = openaiToAnthropic(oaJson, body.model, originalModel);
        console.log(`[PROXY] ✓ ${originalModel} done ${Date.now() - start}ms`);
        res.json(anJson);
      }
    } else {
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        const nodeStream = Readable.fromWeb(upstreamRes.body);
        nodeStream.pipe(res);
      } else {
        const json = await upstreamRes.json();
        res.json(json);
      }
    }
  } catch (err) {
    console.log(`[PROXY] ✗ ERROR: ${err.message}`);
    add({
      method: req.method, path: req.path,
      model: originalModel, mappedTo: body.model,
      status: 500, duration: Date.now() - start,
      error: err.message,
    });
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}

export { handleProxy };