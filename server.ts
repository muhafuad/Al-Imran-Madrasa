import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "supabase_config.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn("Could not create data dir:", e);
  }
}

const app = express();
app.use(express.json());

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. Supabase Server-side Config Endpoint (enables cross-browser sync for Chrome, Edge, Safari, Mobile)
app.get("/api/supabase-config", (req, res) => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.url && parsed.anonKey) {
        return res.json({
          url: parsed.url,
          anonKey: parsed.anonKey,
          autoSync: parsed.autoSync !== false,
          source: "server_file",
        });
      }
    }
  } catch (err) {
    console.warn("Error reading config file:", err);
  }

  // Fallback to process.env if available
  const envUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const envKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  res.json({
    url: envUrl,
    anonKey: envKey,
    autoSync: true,
    source: envUrl ? "server_env" : "none",
  });
});

app.post("/api/supabase-config", (req, res) => {
  const { url, anonKey, autoSync } = req.body || {};
  if (!url || !anonKey) {
    return res.status(400).json({ error: "URL and Anon Key are required" });
  }

  try {
    const configData = {
      url: String(url).trim(),
      anonKey: String(anonKey).trim(),
      autoSync: autoSync !== false,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2), "utf-8");
    return res.json({
      success: true,
      message: "Supabase configuration saved to server",
    });
  } catch (err: any) {
    console.error("Error saving config file:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Failed to save config" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
