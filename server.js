import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { handleProxy } from "./src/proxy.js";
import { fetchModels } from "./src/fetcher.js";
import { getAll, set, remove } from "./src/mapper.js";
import { getAll as getLogs, clear as clearLogs } from "./src/logger.js";
import { MODEL_META, getFreeModelScores } from "./src/modelMeta.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SETTINGS_PATH = path.join(__dirname, "config", "settings.json");
let settings = { port: 4096 };

try {
  settings = { ...settings, ...JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8")) };
} catch {}

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const router = express.Router();

router.get("/models", async (req, res) => {
  const upstream = await fetchModels();
  const mappings = getAll();

  // Build model list that includes mapped aliases (Claude model names)
  // so Claude Code can validate them as "available" models
  const aliasModels = Object.keys(mappings).map((alias) => ({
    id: alias,
    object: "model",
    created: Math.floor(Date.now() / 1000),
    owned_by: "opencode-proxy",
  }));

  // Merge upstream models with alias models
  const upstreamData = upstream?.data || upstream || [];
  const upstreamList = Array.isArray(upstreamData) ? upstreamData : [];

  res.json({
    object: "list",
    data: [...aliasModels, ...upstreamList],
  });
});

// Individual model lookup — Claude Code may call GET /v1/models/<model_id>
router.get("/models/:modelId", (req, res) => {
  const mappings = getAll();
  const modelId = req.params.modelId;

  if (mappings[modelId] || modelId.endsWith("-free")) {
    return res.json({
      id: modelId,
      object: "model",
      created: Math.floor(Date.now() / 1000),
      owned_by: "opencode-proxy",
    });
  }

  res.status(404).json({ error: { message: `Model ${modelId} not found` } });
});

router.post("/chat/completions", (req, res) => handleProxy(req, res, "openai"));
router.post("/messages", (req, res) => handleProxy(req, res, "claude"));

app.use("/v1", router);
app.use("/v1/v1", router);  // Claude Code: BASE_URL/v1 + /v1/messages = /v1/v1/messages

const api = express.Router();

api.get("/status", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    port: settings.port,
    target: "https://opencode.ai/zen/v1",
    memory: process.memoryUsage(),
  });
});

api.get("/logs", (req, res) => res.json(getLogs()));
api.delete("/logs", (req, res) => { clearLogs(); res.json({ ok: true }); });

api.get("/mappings", (req, res) => res.json(getAll()));
api.post("/mappings", (req, res) => {
  const { alias, model } = req.body;
  if (!alias || !model) return res.status(400).json({ error: "alias and model required" });
  set(alias, model);
  res.json({ ok: true, mappings: getAll() });
});
api.delete("/mappings/:alias", (req, res) => {
  remove(req.params.alias);
  res.json({ ok: true, mappings: getAll() });
});

api.get("/settings", (req, res) => res.json(settings));
api.get("/model-meta", (req, res) => res.json(MODEL_META));
api.get("/model-scores", (req, res) => res.json(getFreeModelScores()));

app.use("/api", api);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(settings.port, "127.0.0.1", () => {
  console.log(`OpenCode Free Proxy running on http://127.0.0.1:${settings.port}`);
  console.log(`Dashboard: http://127.0.0.1:${settings.port}`);
});