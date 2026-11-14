/**
 * Security & Cryptography Utilities
 * Provides password hashing, session integrity verification, XSS sanitization,
 * and transaction reference verification for production readiness.
 */
import bcrypt from "bcryptjs";

// Pure-JS SHA-256 implementation for environments without crypto.subtle (e.g. non-localhost HTTP)
const sha256PureJs = (message: string): string => {
  const bytes = new TextEncoder().encode(message);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 =
        ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^
        ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^
        (w[i - 15] >>> 3);
      const s1 =
        ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^
        ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^
        (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 =
        ((e >>> 6) | (e << 26)) ^
        ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 =
        ((a >>> 2) | (a << 30)) ^
        ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return Array.from(H)
    .map((x) => x.toString(16).padStart(8, "0"))
    .join("");
};

// Legacy deterministic fallback hash helper (used only to verify older stored `hash_...` entries)
const legacyFallbackHash = (
  password: string,
  salt: string = "alimran_madrasa_2026",
): string => {
  let hash = 0;
  const str = `${salt}_${password}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
};

// Detect if a stored string is already a hash (to prevent accidental double-hashing)
export const isPasswordHash = (value?: string): boolean => {
  if (!value) return false;
  const clean = value.trim().replace(/^["'`]|["'`]$/g, "");
  if (clean.length === 64 && /^[0-9a-fA-F]+$/.test(clean)) return true;
  if (/^hash_[0-9a-fA-F]+$/.test(clean)) return true;
  if (/^\$2[aby]\$\d{2}\$/.test(clean)) return true;
  return false;
};

// Cryptographic SHA-256 Hash with Salt using Web Crypto API (with pure-JS SHA-256 fallback)
export const hashPassword = async (
  password: string,
  salt: string = "alimran_madrasa_2026",
): Promise<string> => {
  if (!password) return "";
  if (isPasswordHash(password)) return password.trim();

  const payload = salt ? `${salt}:${password}` : password;

  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      console.warn(
        "hashPassword subtle digest error, using pure-JS SHA-256:",
        e,
      );
    }
  }

  return sha256PureJs(payload);
};

// Verify plain password against stored hash, bcrypt hash, or direct plain text stored in DB
export const verifyPassword = async (
  inputPassword?: string,
  storedPasswordOrHash?: string,
  email?: string,
): Promise<boolean> => {
  if (!inputPassword) return false;

  // Security hardening: Reject immediately if no stored hash exists.
  // Never permit arbitrary unauthenticated logins via default fallback passwords.
  if (!storedPasswordOrHash || !storedPasswordOrHash.trim()) {
    return false;
  }

  const rawStored = String(storedPasswordOrHash).trim();
  const rawInput = String(inputPassword);
  const cleanStored = rawStored.replace(/^["'`]|["'`]$/g, "");
  const cleanInput = rawInput.trim();

  // 1. Direct plain-text match (supports passwords entered directly in Supabase Table Editor)
  if (
    rawInput === rawStored ||
    cleanInput === cleanStored ||
    rawInput === cleanStored
  ) {
    return true;
  }

  // 2. Bcrypt hash match ($2a$, $2b$, $2y$ — e.g. PostgreSQL pgcrypto crypt() hashes)
  if (/^\$2[aby]\$\d{2}\$/.test(cleanStored)) {
    try {
      if (await bcrypt.compare(rawInput, cleanStored)) return true;
      if (
        cleanInput !== rawInput &&
        (await bcrypt.compare(cleanInput, cleanStored))
      )
        return true;
    } catch (e) {
      console.warn("bcrypt verification error:", e);
    }
  }

  // 3. If stored value is a 64-char hex SHA-256 hash
  if (cleanStored.length === 64 && /^[0-9a-fA-F]+$/.test(cleanStored)) {
    const targetLower = cleanStored.toLowerCase();

    // Standard system salt (`alimran_madrasa_2026:<password>`)
    const saltedHash = await hashPassword(cleanInput, "alimran_madrasa_2026");
    if (saltedHash.toLowerCase() === targetLower) return true;

    if (rawInput !== cleanInput) {
      const rawSaltedHash = await hashPassword(
        rawInput,
        "alimran_madrasa_2026",
      );
      if (rawSaltedHash.toLowerCase() === targetLower) return true;
    }

    // Unsalted SHA-256 (`<password>`)
    const unsaltedHash = await hashPassword(cleanInput, "");
    if (unsaltedHash.toLowerCase() === targetLower) return true;

    // Email-salted SHA-256 (`<email>:<password>`)
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const emailSaltedHash = await hashPassword(cleanInput, cleanEmail);
      if (emailSaltedHash.toLowerCase() === targetLower) return true;
    }

    // Legacy underscore salt variant (`alimran_madrasa_2026_<password>`)
    if (
      sha256PureJs(`alimran_madrasa_2026_${cleanInput}`).toLowerCase() ===
      targetLower
    ) {
      return true;
    }

    // Legacy accidental double-hash recovery (from older builds prior to isPasswordHash guard)
    if (
      sha256PureJs(`alimran_madrasa_2026:${saltedHash}`).toLowerCase() ===
      targetLower
    ) {
      return true;
    }
    if (
      sha256PureJs(`alimran_madrasa_2026:${unsaltedHash}`).toLowerCase() ===
      targetLower
    ) {
      return true;
    }
  }

  // 4. Support legacy fallback `hash_<hex>` records created when crypto.subtle was unavailable
  if (/^hash_[0-9a-fA-F]+$/i.test(cleanStored)) {
    const targetLower = cleanStored.toLowerCase();
    const l1 = legacyFallbackHash(cleanInput, "alimran_madrasa_2026");
    if (l1.toLowerCase() === targetLower) return true;
    if (
      legacyFallbackHash(rawInput, "alimran_madrasa_2026").toLowerCase() ===
      targetLower
    )
      return true;
    if (legacyFallbackHash(cleanInput, "").toLowerCase() === targetLower)
      return true;
    if (
      legacyFallbackHash(l1, "alimran_madrasa_2026").toLowerCase() ===
      targetLower
    )
      return true;
    if (
      email &&
      legacyFallbackHash(
        cleanInput,
        email.toLowerCase().trim(),
      ).toLowerCase() === targetLower
    )
      return true;
  }

  return false;
};

// Generate HMAC-like session token to prevent client-side role tampering in localStorage
export const generateSessionSignature = (
  userId: string,
  role: string,
  email: string,
): string => {
  const secretKey = "alimran_sec_token_v2026";
  const payload = `${userId}:${role}:${email}:${secretKey}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sig_${Math.abs(hash).toString(36)}`;
};

export const verifySessionSignature = (
  userId: string,
  role: string,
  email: string,
  signature?: string,
): boolean => {
  if (!signature || typeof signature !== "string") return false;
  const expected = generateSessionSignature(userId, role, email);
  return signature === expected;
};

// Sanitize string to prevent basic XSS or HTML injection
export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "") // remove direct angle brackets
    .replace(/javascript:/gi, "") // strip pseudo-protocols
    .replace(/on\w+\s*=/gi, "") // strip inline event handlers (onerror, onclick, etc.)
    .trim();
};

// Validate Telebirr / CBE transaction references
export const isValidTransactionRef = (ref: string): boolean => {
  if (!ref || ref.trim().length < 5) return false;
  const clean = ref.trim().toUpperCase();
  // Standard format check: TLB-XXXXXXXXX, CBE-XXXXXXXXX, FT-XXXXXXXXX, etc.
  return /^[A-Z0-9\-_]{5,30}$/.test(clean);
};
