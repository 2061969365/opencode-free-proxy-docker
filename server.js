import express from "express";
import cors from "cors";
import { handleProxy } from "./src/proxy.js";

const PORT = parseInt(process.env.PORT || "4096", 10);
const HOST = process.env.HOST || "0.0.0.0";
const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb", verify: (req, res, buf) => { if (buf.length > 5 * 1024 * 1024) throw Object.assign(new Error("Body too large"), { status: 413, statusCode: 413 }); } }));
app.get("/api/status", (req, res) => res.json({ status: "ok", mode: "stateless", port: PORT, uptime: process.uptime(), memory: process.memoryUsage() }));
app.post("/v1/chat/completions", (req, res) => handleProxy(req, res, "openai"));
app.post("/v1/messages", (req, res) => handleProxy(req, res, "claude"));
app.post("/v1/messages/count_tokens", (req, res) => res.json({ input_tokens: Math.ceil(JSON.stringify(req.body || {}).length / 4) }));
app.use((req, res) => res.status(404).json({ type: "error", error: { type: "not_found_error", message: `Cannot ${req.method} ${req.path}` } }));
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status === 413) return res.status(413).json({ type: "error", error: { type: "request_too_large", message: "Request body too large" } });
  res.status(status).json({ type: "error", error: { type: "api_error", message: "Internal server error" } });
});
const server = app.listen(PORT, HOST, () => console.log(`stateless http://${HOST}:${PORT}`));
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.requestTimeout = 310000;
