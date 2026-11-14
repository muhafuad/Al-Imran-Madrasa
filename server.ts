import "dotenv/config";
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

interface ServerSupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  updatedAt?: string;
}

let inMemorySupabaseConfig: ServerSupabaseConfig | null = null;

const sanitizeServerUrl = (url: string): string => {
  let cleaned = String(url || "").trim();
  cleaned = cleaned.replace(/^(VITE_)?SUPABASE_URL\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^url\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^['"`]|['"`]$/g, "").trim();
  if (
    cleaned &&
    !cleaned.startsWith("http://") &&
    !cleaned.startsWith("https://")
  ) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, "");
};

const sanitizeServerKey = (key: string): string => {
  let cleaned = String(key || "").trim();
  cleaned = cleaned.replace(/^(VITE_)?SUPABASE_ANON_KEY\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^(VITE_)?SUPABASE_KEY\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^anon(_key)?\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^['"`]|['"`]$/g, "").trim();
  return cleaned;
};

// 2. Supabase Server-side Config Endpoint (enables cross-browser sync for Chrome, Edge, Safari, Mobile)
app.get("/api/supabase-config", (req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(data);
      const cleanUrl = sanitizeServerUrl(parsed.url);
      const cleanKey = sanitizeServerKey(parsed.anonKey);
      if (cleanUrl && cleanKey && cleanUrl.startsWith("http")) {
        inMemorySupabaseConfig = {
          url: cleanUrl,
          anonKey: cleanKey,
          autoSync: parsed.autoSync !== false,
          updatedAt: parsed.updatedAt,
        };
        return res.json({
          url: cleanUrl,
          anonKey: cleanKey,
          autoSync: parsed.autoSync !== false,
          source: "server_file",
        });
      }
    }
  } catch (err) {
    console.warn("Error reading config file:", err);
  }

  if (inMemorySupabaseConfig?.url && inMemorySupabaseConfig?.anonKey) {
    return res.json({
      url: inMemorySupabaseConfig.url,
      anonKey: inMemorySupabaseConfig.anonKey,
      autoSync: inMemorySupabaseConfig.autoSync !== false,
      source: "server_memory",
    });
  }

  // Fallback to process.env if available
  const envUrl = sanitizeServerUrl(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  );
  const envKey = sanitizeServerKey(
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
  );

  res.json({
    url: envUrl,
    anonKey: envKey,
    autoSync: true,
    source: envUrl && envKey ? "server_env" : "none",
  });
});

app.post("/api/supabase-config", (req, res) => {
  // Security: Check admin secret if configured on server
  const adminSecret = process.env.ADMIN_SETUP_KEY || process.env.ADMIN_SECRET;
  if (adminSecret) {
    const providedKey =
      req.headers["x-admin-key"] ||
      req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    if (providedKey !== adminSecret) {
      return res
        .status(403)
        .json({
          error:
            "Unauthorized: Valid Admin Key required to update server configuration",
        });
    }
  }

  const { url, anonKey, autoSync } = req.body || {};
  if (!url || !anonKey) {
    return res.status(400).json({ error: "URL and Anon Key are required" });
  }

  const trimmedUrl = sanitizeServerUrl(String(url));
  const trimmedKey = sanitizeServerKey(String(anonKey));

  // Security: Prevent SSRF / local network targeting (must be https:// URL)
  try {
    const parsedUrl = new URL(trimmedUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return res
        .status(400)
        .json({ error: "Invalid URL protocol. Must use HTTPS." });
    }
    // Disallow link-local or internal cloud metadata addresses
    if (
      parsedUrl.hostname === "169.254.169.254" ||
      parsedUrl.hostname === "metadata.google.internal" ||
      parsedUrl.hostname.startsWith("10.") ||
      parsedUrl.hostname.startsWith("192.168.") ||
      parsedUrl.hostname.startsWith("127.") ||
      parsedUrl.hostname === "localhost"
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid Supabase URL: Private network hosts are not permitted.",
        });
    }
  } catch {
    return res.status(400).json({ error: "Invalid Supabase URL format." });
  }

  if (trimmedKey.length < 20) {
    return res.status(400).json({ error: "Invalid Supabase Anon Key format." });
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const configData: ServerSupabaseConfig = {
      url: trimmedUrl,
      anonKey: trimmedKey,
      autoSync: autoSync !== false,
      updatedAt: new Date().toISOString(),
    };
    inMemorySupabaseConfig = configData;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2), "utf-8");
    return res.json({
      success: true,
      message: "Supabase configuration saved securely to server",
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
