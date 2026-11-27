const enc = new TextEncoder();

function b64url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64url(value) {
  const s = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = s + "=".repeat((4 - s.length % 4) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}
async function keyFor(secret) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
export async function createSession(user, env) {
  const payload = b64url(enc.encode(JSON.stringify({ user, exp: Date.now() + 7 * 86400000 })));
  const key = await keyFor(env.SESSION_SECRET);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return `${payload}.${b64url(sig)}`;
}
export async function verifySession(request, env) {
  try {
    if (!env.SESSION_SECRET) return null;
    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)almerix_session=([^;]+)/);
    if (!match) return null;
    const [payload, signature] = match[1].split(".");
    if (!payload || !signature) return null;
    const key = await keyFor(env.SESSION_SECRET);
    const valid = await crypto.subtle.verify("HMAC", key, fromB64url(signature), enc.encode(payload));
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (!data.user || data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}
export function cookieHeader(value, maxAge = 604800) {
  return `almerix_session=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
