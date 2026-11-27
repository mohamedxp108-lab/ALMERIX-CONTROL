import { createSession, cookieHeader } from "./_auth.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = request.headers.get("Cookie") || "";
  const saved = cookies.match(/(?:^|;\s*)almerix_oauth_state=([^;]+)/)?.[1];
  if (!code || !state || !saved || state !== saved) {
    return new Response("Inicio de sesión no válido. Vuelve a intentarlo.", { status: 400 });
  }
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.DISCORD_REDIRECT_URI || !env.SESSION_SECRET) {
    return new Response("Faltan variables de entorno de Discord o SESSION_SECRET.", { status: 500 });
  }
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: env.DISCORD_REDIRECT_URI
    })
  });
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.access_token) {
    return new Response("Discord no pudo completar el inicio de sesión.", { status: 401 });
  }
  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const user = await userResponse.json();
  if (!userResponse.ok || !user.id) return new Response("No se pudo obtener tu cuenta de Discord.", { status: 401 });

  const session = await createSession({
    id: user.id,
    username: user.username,
    global_name: user.global_name || user.username,
    avatar: user.avatar
  }, env);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": `${cookieHeader(session)} , almerix_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
    }
  });
}
