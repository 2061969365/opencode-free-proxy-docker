import { API, DEFAULT_HEADERS } from "./constants.js";

async function fetchModels() {
  try {
    const res = await fetch(API.MODELS, {
      headers: {
        "User-Agent": "opencode-free-proxy/1.0",
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch models:", err.message);
    return null;
  }
}

export { fetchModels };