const BASE = "";

// --- i18n ---
const i18n = {
  en: {
    title: "OpenCode Free Proxy",
    running: "Running",
    offline: "Offline",
    starting: "Starting...",
    generate: "Generate",
    genDesc: "Select a model to generate the Claude Code command:",
    genBtn: "Generate Command",
    cmdLabel: "CMD:",
    psLabel: "PowerShell:",
    copy: "Copy",
    copied: "Copied!",
    mapCreated: "Mapping created. Model:",
    noModels: "No models available",
    status: "Status",
    uptime: "Uptime",
    port: "Port",
    target: "Target",
    connectCC: "Connect Claude Code",
    ccDesc1: "Set environment variables:",
    ccDesc2: "Or PowerShell:",
    ccWarn: "Claude Code requests models like claude-sonnet-4-6, claude-opus-4-8... These models are not available on OpenCode Free. Use Generate below to create the command with a mapped model.",
    codingStrength: "Coding Strength — Free Models",
    codingSub: "Artificial Analysis Coding Index (Terminal-Bench Hard, SciCode). Higher = stronger.",
    freeModels: "Free Models from OpenCode",
    freeSub: "Free-tier models (suffix -free). Click to auto-fill in Mappings tab.",
    freeCount: "free models",
    deprecated: "No longer free",
    image: "image",
    mapped: "mapped",
    loading: "Loading...",
    noFreeModels: "No free models available.",
    mappings: "Model Alias Mappings",
    mapPlaceAlias: "Alias (e.g. gpt-4)",
    mapPlaceModel: "Real model (e.g. claude-sonnet-4-6)",
    add: "Add",
    alias: "Alias",
    mapsTo: "Maps To",
    noMappings: "No mappings configured",
    delete: "Delete",
    logs: "Request Logs",
    clear: "Clear",
    noLogs: "No requests yet",
    time: "Time",
    method: "Method",
    path: "Path",
    model: "Model",
    mappedTo: "Mapped",
    duration: "Duration",
    modelLabel: "Model",
    systemPrompt: "System Prompt",
    temperature: "Temperature",
    maxTokens: "Max Tokens",
    clearChat: "Clear Chat",
    send: "Send",
    stop: "Stop",
    typeMsg: "Type your message...",
    emptyChat: "Send a message to start chatting",
    placeholder: "Response will appear here...",
    waiting: "Waiting for response...",
    testChat: "Test Chat",
    enterMsg: "Enter your message",
    reasoning: "Reasoning",
    answer: "Answer",
    settings: "Settings",
    free: "free",
    connectOC: "Connect OpenCode CLI",
    ocDesc1: "In opencode.json:",
    ocDesc2: "Or environment variables:",
    generateSection: "Generate Claude Code Command",
    allAliases: "All models & aliases",
    sendReq: "Send",
    modelUsed: "Model:",
    tokensUsed: "Tokens:",
    selectModel: "-- Select a model --",
    ccWarnHtml: `<strong>Important:</strong> Claude Code calls models like <code>claude-sonnet-4-6</code>, <code>claude-opus-4-8</code>, <code>claude-haiku-4-5</code>... These models are not available on OpenCode Free. Use <strong>Generate</strong> below or <strong>Mappings</strong> tab to map them.`,
    ccDocHtml: `<p>Set environment variables:</p><pre><code>SET ANTHROPIC_BASE_URL=http://127.0.0.1:4096/v1\nSET ANTHROPIC_API_KEY=not-needed\nclaude</code></pre><p>Or PowerShell:</p><pre><code>$env:ANTHROPIC_BASE_URL="http://127.0.0.1:4096/v1"\n$env:ANTHROPIC_API_KEY="not-needed"\nclaude</code></pre>`,
    ocDocHtml: `<p>In <code>opencode.json</code>:</p><pre><code>{\n  "provider": "openai",\n  "baseURL": "http://127.0.0.1:4096/v1",\n  "apiKey": "not-needed"\n}</code></pre><p>Or environment variables:</p><pre><code>set OPENAI_BASE_URL=http://127.0.0.1:4096/v1\nset OPENAI_API_KEY=not-needed</code></pre>`,
    suggestHelp: "Select an alias from the dropdown above and click Generate to get the Claude Code command.",
    dashboard: "Dashboard",
    modelsTab: "Models",
    mappingsTab: "Mappings",
    logsTab: "Logs",
    playgroundTab: "Playground",
    testTab: "Test",
  },
  vi: {
    title: "OpenCode Free Proxy",
    running: "Đang chạy",
    offline: "Mất kết nối",
    starting: "Đang khởi động...",
    generate: "Tạo",
    genDesc: "Chọn model để tạo lệnh chạy Claude Code:",
    genBtn: "Tạo lệnh",
    cmdLabel: "CMD:",
    psLabel: "PowerShell:",
    copy: "Sao chép",
    copied: "Đã sao chép!",
    mapCreated: "Mapping đã tạo. Model:",
    noModels: "Không có model nào",
    status: "Trạng thái",
    uptime: "Thời gian chạy",
    port: "Cổng",
    target: "Đích",
    connectCC: "Kết nối Claude Code",
    ccDesc1: "Đặt biến môi trường:",
    ccDesc2: "Hoặc PowerShell:",
    ccWarn: "Claude Code gọi các model như claude-sonnet-4-6, claude-opus-4-8... Các model này không có sẵn trên OpenCode Free. Dùng mục Generate bên dưới để tạo lệnh với model đã map.",
    codingStrength: "Sức mạnh Coding — Free Models",
    codingSub: "Artificial Analysis Coding Index (Terminal-Bench Hard, SciCode). Cao hơn = mạnh hơn.",
    freeModels: "Free Models từ OpenCode",
    freeSub: "Model miễn phí (hậu tố -free). Click để điền vào Mappings tab.",
    freeCount: "model miễn phí",
    deprecated: "Hết miễn phí",
    image: "ảnh",
    mapped: "đã map",
    loading: "Đang tải...",
    noFreeModels: "Không có model miễn phí.",
    mappings: "Model Alias Mappings",
    mapPlaceAlias: "Bí danh (vd: gpt-4)",
    mapPlaceModel: "Model thật (vd: claude-sonnet-4-6)",
    add: "Thêm",
    alias: "Bí danh",
    mapsTo: "Map sang",
    noMappings: "Chưa có mapping nào",
    delete: "Xoá",
    logs: "Lịch sử Request",
    clear: "Xoá",
    noLogs: "Chưa có request nào",
    time: "Thời gian",
    method: "Phương thức",
    path: "Đường dẫn",
    model: "Model",
    mappedTo: "Đã map",
    duration: "Thời gian",
    modelLabel: "Model",
    systemPrompt: "System Prompt",
    temperature: "Nhiệt độ",
    maxTokens: "Max Tokens",
    clearChat: "Xoá Chat",
    send: "Gửi",
    stop: "Dừng",
    typeMsg: "Nhập tin nhắn...",
    emptyChat: "Gửi tin nhắn để bắt đầu chat",
    placeholder: "Kết quả sẽ hiện ở đây...",
    waiting: "Đang chờ phản hồi...",
    testChat: "Test Chat",
    enterMsg: "Nhập tin nhắn",
    reasoning: "Suy luận",
    answer: "Trả lời",
    settings: "Cài đặt",
    free: "miễn phí",
    connectOC: "Kết nối OpenCode CLI",
    ocDesc1: "Trong opencode.json:",
    ocDesc2: "Hoặc biến môi trường:",
    generateSection: "Tạo lệnh Claude Code",
    allAliases: "Tất cả model & bí danh",
    sendReq: "Gửi",
    modelUsed: "Model:",
    tokensUsed: "Tokens:",
    selectModel: "-- Chọn model --",
    ccWarnHtml: `<strong>Quan trọng:</strong> Claude Code gọi model như <code>claude-sonnet-4-6</code>, <code>claude-opus-4-8</code>, <code>claude-haiku-4-5</code>... Các model này không có sẵn trên OpenCode Free. Dùng mục <strong>Generate</strong> bên dưới hoặc tab <strong>Mappings</strong> để map model.`,
    ccDocHtml: `<p>Đặt biến môi trường:</p><pre><code>SET ANTHROPIC_BASE_URL=http://127.0.0.1:4096/v1\nSET ANTHROPIC_API_KEY=not-needed\nclaude</code></pre><p>Hoặc PowerShell:</p><pre><code>$env:ANTHROPIC_BASE_URL="http://127.0.0.1:4096/v1"\n$env:ANTHROPIC_API_KEY="not-needed"\nclaude</code></pre>`,
    ocDocHtml: `<p>Trong <code>opencode.json</code>:</p><pre><code>{\n  "provider": "openai",\n  "baseURL": "http://127.0.0.1:4096/v1",\n  "apiKey": "not-needed"\n}</code></pre><p>Hoặc biến môi trường:</p><pre><code>set OPENAI_BASE_URL=http://127.0.0.1:4096/v1\nset OPENAI_API_KEY=not-needed</code></pre>`,
    suggestHelp: "Chọn alias từ dropdown bên trên và bấm Generate để nhận lệnh Claude Code.",
  },
};

let lang = "vi";
function t(key) { return i18n[lang][key] || key; }

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (key && i18n[lang][key]) el.textContent = i18n[lang][key];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.dataset.i18nHtml;
    if (key && i18n[lang][key]) el.innerHTML = i18n[lang][key];
  });
}

function toggleLang() {
  lang = lang === "en" ? "vi" : "en";
  const btn = $("#langToggle");
  btn.textContent = lang === "en" ? "VI" : "EN";
  applyI18n();
  refreshStatus();
  refreshModels();
  document.querySelectorAll(".tab-content.active").forEach(tc => {
    if (tc.id === "tab-playground") populatePgModels();
  });
}

// --- Globals ---
let statusInterval;
let allFreeModels = [];
let allModelsFull = [];
let modelMeta = {};

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initMappings();
  initLogs();
  initTest();
  initPlayground();
  initCodeGen();
  applyI18n();
  renderCodingChart();
  refreshStatus();
  refreshModels();
  statusInterval = setInterval(refreshStatus, 5000);
});

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function el(tag, attrs, ...children) {
  const e = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) e[k] = v;
  children.forEach(c => e.append(c));
  return e;
}

// --- Tabs ---
function initTabs() {
  $$(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach(t => t.classList.remove("active"));
      $$(".tab-content").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const tId = "tab-" + tab.dataset.tab;
      const content = document.getElementById(tId);
      if (content) content.classList.add("active");
      if (tab.dataset.tab === "models") refreshModels();
      if (tab.dataset.tab === "logs") refreshLogs();
      if (tab.dataset.tab === "playground") populatePgModels();
    });
  });
}

// --- Status ---
async function refreshStatus() {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const badge = $("#statusBadge");
    badge.textContent = t("running");
    badge.className = "badge";
    $("#statStatus").textContent = t("running");
    $("#statUptime").textContent = formatUptime(data.uptime);
    $("#statPort").textContent = data.port;
    $("#statTarget").textContent = data.target;
  } catch {
    const badge = $("#statusBadge");
    badge.textContent = t("offline");
    badge.className = "badge error";
  }
}

function formatUptime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

// --- Coding Chart ---
const CODING_SCORES = [
  { id: "mimo-v2.5-free", score: 42.1, image: true, color: "#E87040" },
  { id: "deepseek-v4-flash-free", score: 38.7, color: "#1f6feb" },
  { id: "nemotron-3-ultra-free", score: 37.6, color: "#76B900" },
  { id: "north-mini-code-free", score: 33.4, color: "#238636" },
];

function renderCodingChart() {
  const container = $("#codingChart");
  if (!container) return;
  container.innerHTML = "";
  CODING_SCORES.forEach(item => {
    const pct = (item.score / 50) * 100;
    const row = el("div", { className: "chart-row" });
    const label = el("div", { className: "chart-label" });
    label.appendChild(el("span", { className: "chart-name" }, document.createTextNode(item.id)));
    if (item.image) label.appendChild(el("span", { className: "chart-badge img" }, document.createTextNode(t("image"))));
    const barWrap = el("div", { className: "chart-bar-wrap" });
    const bar = el("div", { className: "chart-bar", style: `width:${pct}%;background:${item.color || "#1f6feb"};` });
    bar.appendChild(el("span", { className: "chart-val" }, document.createTextNode(item.score)));
    barWrap.appendChild(bar);
    row.appendChild(label);
    row.appendChild(barWrap);
    container.appendChild(row);
  });
}

// --- Models ---
async function refreshModels() {
  const list = $("#modelsList");
  try {
    const [modelsRes, mappingsRes, metaRes] = await Promise.all([
      fetch("/v1/models"),
      fetch("/api/mappings"),
      fetch("/api/model-meta"),
    ]);
    if (!modelsRes.ok) throw new Error(String(modelsRes.status));
    const modelsData = await modelsRes.json();
    allModelsFull = modelsData.data || modelsData.models?.data || modelsData.models || [];
    const mappings = await mappingsRes.json();
    modelMeta = await metaRes.json();
    allFreeModels = allModelsFull.filter(m => {
      const id = (m.id || m).toLowerCase();
      return id.includes("free");
    });
    const mappedModels = new Set(Object.values(mappings));
    list.innerHTML = "";
    const count = $("#modelCount");
    count.textContent = allFreeModels.length + " " + t("freeCount");

    if (allFreeModels.length === 0) { list.innerHTML = `<p class="placeholder">${t("noFreeModels")}</p>`; return; }

    allFreeModels.forEach(m => {
      const id = m.id || m;
      const meta = modelMeta[id] || {};
      const isMapped = mappedModels.has(id);
      const isDep = meta.deprecated;
      const item = el("div", { className: "model-item" + (isMapped ? " mapped" : "") + (isDep ? " deprecated" : "") });
      item.appendChild(el("span", { className: "model-name" }, document.createTextNode(id)));
      if (isDep) item.appendChild(el("span", { className: "model-badge dep" }, document.createTextNode(meta.note || t("deprecated"))));
      if (meta.image) item.appendChild(el("span", { className: "model-badge img" }, document.createTextNode(t("image"))));
      if (meta.score) item.appendChild(el("span", { className: "model-badge score" }, document.createTextNode(meta.score)));
      if (isMapped) item.appendChild(el("span", { className: "model-badge mapped-badge" }, document.createTextNode(t("mapped"))));
      item.addEventListener("click", () => {
        if (isDep) return;
        $("#mapModel").value = id;
        $("#mapAlias").focus();
        const mappingTab = document.querySelector('[data-tab="mappings"]');
        if (mappingTab) mappingTab.click();
      });
      list.appendChild(item);
    });
    refreshGenModels(mappings);
    populateDropdowns();
    renderCodingChart();
  } catch (err) { list.innerHTML = `<p>${t("noModels")}</p>`; }
}

function populateDropdowns() {
  const selects = [$("#testModel"), $("#pgModel")];
  selects.forEach(sel => {
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = "";
    const models = allFreeModels.length ? allFreeModels : [{id:"deepseek-v4-flash-free"},{id:"mimo-v2.5-free"},{id:"nemotron-3-ultra-free"}];
    models.forEach(m => {
      const id = m.id || m;
      const opt = el("option", { value: id });
      opt.textContent = id;
      sel.appendChild(opt);
    });
    if (prev) sel.value = prev;
  });
}

// --- Generate Claude Code Command ---
function initCodeGen() {
  const modelSel = $("#genModelSelect");
  const genBtn = $("#genGenBtn");
  const cmdDiv = $("#genCommand");
  const cmdText = $("#genCmdText");
  const psText = $("#genPsText");
  const copyBtn = $("#genCopyBtn");
  const mappingInfo = $("#genMappingInfo");
  if (!modelSel) return;

  genBtn.addEventListener("click", async () => {
    const selected = modelSel.value;
    if (!selected) return;

    let modelForCmd = selected;
    try {
      const mappingsRes = await fetch("/api/mappings");
      const mappings = await mappingsRes.json();
      if (mappings[selected]) {
        mappingInfo.textContent = `${t("mapCreated")} ${selected} → ${mappings[selected]}`;
        mappingInfo.className = "gen-mapping-info done";
      } else {
        mappingInfo.textContent = `${t("modelLabel")} ${selected}`;
        mappingInfo.className = "gen-mapping-info";
      }
      modelForCmd = selected;
    } catch {
      mappingInfo.textContent = `${t("modelLabel")} ${selected}`;
      mappingInfo.className = "gen-mapping-info";
    }

    cmdDiv.style.display = "block";
    const oneLiner = `$env:ANTHROPIC_BASE_URL="http://127.0.0.1:4096/v1"; $env:ANTHROPIC_API_KEY="not-needed"; $env:ANTHROPIC_MODEL="${modelForCmd}"; claude`;
    cmdText.textContent = oneLiner;
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(cmdText.textContent).then(() => {
      copyBtn.textContent = t("copied");
      setTimeout(() => { copyBtn.textContent = t("copy"); }, 1500);
    });
  });
}

async function refreshGenModels(mappings) {
  const sel = $("#genModelSelect");
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = `<option value="">${t("selectModel")}</option>`;

  // Add optgroup: Aliases (from mappings)
  const aliases = Object.keys(mappings || {});
  if (aliases.length > 0) {
    const og = document.createElement("optgroup");
    og.label = lang === "vi" ? "Bí danh (Alias)" : "Aliases";
    aliases.forEach(a => {
      const opt = el("option", { value: a });
      opt.textContent = `${a} → ${mappings[a]}`;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  }

  // Add optgroup: All upstream models
  const og2 = document.createElement("optgroup");
  og2.label = lang === "vi" ? "Tất cả model" : "All models";
  const seen = new Set(aliases);
  (allModelsFull.length ? allModelsFull : []).forEach(m => {
    const id = m.id || m;
    if (seen.has(id)) return;
    seen.add(id);
    const meta = modelMeta[id] || {};
    let label = id;
    if (meta.deprecated) label += " (" + t("deprecated") + ")";
    else if (id.includes("free")) label += " (" + t("free") + ")";
    const opt = el("option", { value: id });
    opt.textContent = label;
    og2.appendChild(opt);
  });
  sel.appendChild(og2);

  if (prev) {
    for (const opt of sel.options) { if (opt.value === prev) { sel.value = prev; break; } }
  }
}

// --- Mappings ---
function initMappings() {
  refreshMappings();
  $("#mappingForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const alias = $("#mapAlias").value.trim();
    const model = $("#mapModel").value.trim();
    if (!alias || !model) return;
    try {
      await fetch("/api/mappings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alias, model }) });
      $("#mapAlias").value = "";
      $("#mapModel").value = "";
      refreshMappings();
    } catch (err) { alert("Error: " + err.message); }
  });
}

async function refreshMappings() {
  const tbody = $("#mappingsTable tbody");
  try {
    const res = await fetch("/api/mappings");
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    tbody.innerHTML = "";
    const entries = typeof data === "object" && !Array.isArray(data) ? Object.entries(data) : [];
    if (entries.length === 0) { tbody.innerHTML = `<tr><td colspan="3" style="color:#484f58;text-align:center">${t("noMappings")}</td></tr>`; return; }
    entries.forEach(([alias, model]) => {
      const tr = el("tr");
      tr.appendChild(el("td", {}, document.createTextNode(alias)));
      tr.appendChild(el("td", {}, document.createTextNode(model)));
      const delBtn = el("button", { className: "btn-danger", textContent: t("delete") });
      delBtn.addEventListener("click", async () => { await fetch(`/api/mappings/${encodeURIComponent(alias)}`, { method: "DELETE" }); refreshMappings(); });
      tr.appendChild(el("td", {}, delBtn));
      tbody.appendChild(tr);
    });
    refreshGenModels(data);
  } catch {}
}

// --- Logs ---
function initLogs() { refreshLogs(); $("#clearLogsBtn").addEventListener("click", async () => { await fetch("/api/logs", { method: "DELETE" }); refreshLogs(); }); }

async function refreshLogs() {
  const tbody = $("#logsTable tbody");
  try {
    const res = await fetch("/api/logs");
    if (!res.ok) throw new Error(String(res.status));
    const logs = await res.json();
    tbody.innerHTML = "";
    if (logs.length === 0) { tbody.innerHTML = `<tr><td colspan="7" style="color:#484f58;text-align:center">${t("noLogs")}</td></tr>`; return; }
    logs.forEach(log => {
      const tr = el("tr");
      tr.appendChild(el("td", {}, document.createTextNode(new Date(log.timestamp).toLocaleTimeString())));
      tr.appendChild(el("td", {}, document.createTextNode(log.method)));
      tr.appendChild(el("td", {}, document.createTextNode(log.path)));
      tr.appendChild(el("td", {}, document.createTextNode(log.model)));
      tr.appendChild(el("td", {}, document.createTextNode(log.mappedTo)));
      tr.appendChild(el("td", {}, log.error ? el("span", { className: "badge error", textContent: String(log.status) }) : el("span", { textContent: String(log.status) })));
      tr.appendChild(el("td", {}, document.createTextNode(log.duration + "ms")));
      tbody.appendChild(tr);
    });
  } catch {}
}

// --- Playground ---
let pgMessages = [];
let pgAbortController = null;

function populatePgModels() {
  const sel = $("#pgModel");
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = "";
  (allFreeModels.length ? allFreeModels : [{id:"deepseek-v4-flash-free"},{id:"mimo-v2.5-free"},{id:"nemotron-3-ultra-free"}]).forEach(m => {
    const opt = el("option", { value: m.id || m });
    opt.textContent = m.id || m;
    sel.appendChild(opt);
  });
  if (prev) sel.value = prev;
}

function initPlayground() {
  const tempSlider = $("#pgTemp");
  const tempVal = $("#pgTempVal");
  tempSlider.addEventListener("input", () => { tempVal.textContent = tempSlider.value; });
  const input = $("#pgInput");
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 150) + "px"; });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#pgForm").requestSubmit(); } });
  $("#pgForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (pgAbortController) { pgAbortController.abort(); pgAbortController = null; return; }
    const text = input.value.trim();
    if (!text) return;
    input.value = ""; input.style.height = "auto";
    await sendPgMessage(text);
  });
  $("#pgClearBtn").addEventListener("click", () => { if (pgAbortController) { pgAbortController.abort(); pgAbortController = null; } pgMessages = []; renderPgMessages(); });
}

async function sendPgMessage(text) {
  const model = $("#pgModel").value;
  const system = $("#pgSystem").value.trim();
  const temperature = parseFloat($("#pgTemp").value);
  const maxTokens = parseInt($("#pgMaxTokens").value) || 4096;
  pgMessages.push({ role: "user", content: text });
  renderPgMessages(); scrollPgDown();
  const apiMessages = [];
  if (system) apiMessages.push({ role: "system", content: system });
  pgMessages.forEach(m => apiMessages.push({ role: m.role, content: m.content }));
  pgAbortController = new AbortController();
  const sendBtn = $("#pgSendBtn");
  sendBtn.disabled = true; sendBtn.textContent = t("stop");
  const msgIndex = pgMessages.length;
  pgMessages.push({ role: "assistant", content: "", streaming: true });
  renderPgMessages(); scrollPgDown();
  let accContent = "", accReason = "";
  pgMessages[msgIndex].reasoning = "";
  try {
    const res = await fetch("/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, messages: apiMessages, temperature, max_tokens: maxTokens, stream: true }), signal: pgAbortController.signal });
    if (!res.ok) { const err = await res.text(); pgMessages[msgIndex].content = "Error: HTTP " + res.status + " - " + err.slice(0, 300); pgMessages[msgIndex].streaming = false; renderPgMessages(); pgAbortController = null; resetPgSendBtn(); return; }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data: ")) continue;
        const js = t.slice(6);
        if (js === "[DONE]") break;
        try {
          const c = JSON.parse(js);
          const d = c.choices?.[0]?.delta || {};
          if (d.content) { accContent += d.content; pgMessages[msgIndex].content = accContent; }
          if (d.reasoning_content) { accReason += d.reasoning_content; pgMessages[msgIndex].reasoning = accReason; }
          if (d.content || d.reasoning_content) { updatePgStreamingMsg(msgIndex); scrollPgDown(); }
        } catch {}
      }
    }
    pgMessages[msgIndex].streaming = false; renderPgMessages();
  } catch (err) {
    pgMessages[msgIndex].content = err.name === "AbortError" ? (accContent || "(stopped)") : "Error: " + err.message;
    pgMessages[msgIndex].streaming = false; renderPgMessages();
  }
  pgAbortController = null; resetPgSendBtn();
}

function resetPgSendBtn() { const btn = $("#pgSendBtn"); btn.disabled = false; btn.textContent = t("send"); }

function renderPgMessages() {
  const container = $("#pgMessages");
  container.innerHTML = "";
  if (pgMessages.length === 0) { container.innerHTML = `<div class="pg-empty">${t("emptyChat")}</div>`; return; }
  pgMessages.forEach((msg, i) => {
    const div = el("div", { className: "pg-msg " + msg.role + (msg.streaming ? " pg-streaming" : "") });
    div.appendChild(el("div", { className: "msg-role" }, document.createTextNode(msg.role)));
    if (msg.reasoning) {
      const rp = el("details", { className: "msg-reasoning" });
      rp.appendChild(el("summary", {}, document.createTextNode(t("reasoning"))));
      rp.appendChild(el("div", { className: "msg-reasoning-content" }, document.createTextNode(msg.reasoning)));
      div.appendChild(rp);
    }
    div.appendChild(el("div", { className: "msg-content" }, document.createTextNode(msg.content || "")));
    container.appendChild(div);
  });
}

function updatePgStreamingMsg(idx) {
  const container = $("#pgMessages");
  const children = container.children;
  if (!children[idx]) return;
  const msg = pgMessages[idx];
  const ce = children[idx].querySelector(".msg-content");
  if (ce) ce.textContent = msg.content || "";
  const d = children[idx].querySelector(".msg-reasoning");
  if (msg.reasoning) {
    if (d) { const rc = d.querySelector(".msg-reasoning-content"); if (rc) rc.textContent = msg.reasoning; }
    else {
      const rp = el("details", { className: "msg-reasoning" });
      rp.appendChild(el("summary", {}, document.createTextNode(t("reasoning"))));
      rp.appendChild(el("div", { className: "msg-reasoning-content" }, document.createTextNode(msg.reasoning)));
      children[idx].insertBefore(rp, ce);
    }
  }
}

function scrollPgDown() { const c = $("#pgMessages"); if (c) c.scrollTop = c.scrollHeight; }

// --- Test Chat ---
function initTest() {
  populateDropdowns();
  $("#testForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const model = $("#testModel").value.trim() || "auto";
    const prompt = $("#testPrompt").value.trim();
    if (!prompt) return;
    const output = $("#testOutput");
    output.innerHTML = t("waiting");
    try {
      const res = await fetch("/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], stream: false }) });
      const data = await res.json();
      if (data.error) { output.innerHTML = `Error: ${JSON.stringify(data.error, null, 2)}`; return; }
      const msg = data.choices?.[0]?.message || {};
      output.innerHTML = "";
      const hdr = el("div", { className: "response-header" });
      hdr.appendChild(el("span", {}, document.createTextNode(t("modelUsed") + " " + (data.model || "?"))));
      hdr.appendChild(el("span", {}, document.createTextNode(t("tokensUsed") + " " + (data.usage?.total_tokens || "?"))));
      output.appendChild(hdr);
      if (msg.reasoning_content) {
        const rs = el("div", { className: "response-section" });
        rs.appendChild(el("div", { className: "response-label" }, document.createTextNode(t("reasoning") + ":")));
        rs.appendChild(el("pre", {}, document.createTextNode(msg.reasoning_content)));
        output.appendChild(rs);
      }
      const as = el("div", { className: "response-section" });
      as.appendChild(el("div", { className: "response-label" }, document.createTextNode(t("answer") + ":")));
      as.appendChild(el("pre", {}, document.createTextNode(msg.content || JSON.stringify(data, null, 2))));
      output.appendChild(as);
    } catch (err) { output.innerHTML = "Request failed: " + err.message; }
  });
}
