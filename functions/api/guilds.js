export async function onRequestGet({ request, env, data }) {
  if (!env.BOT_TOKEN) return Response.json({ guilds: [], configured: false, message: "Falta configurar BOT_TOKEN para consultar los servidores del bot." });
  const cookie = request.headers.get("Cookie") || "";
  // The user's OAuth access token is deliberately not stored in the browser session.
  // Guild listing will be enabled after adding encrypted OAuth-token storage.
  return Response.json({
    guilds: [],
    configured: true,
    message: "La sesión está activa. La selección de servidores se habilitará al conectar el almacenamiento seguro de permisos OAuth."
  });
}
