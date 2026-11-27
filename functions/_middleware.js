import { verifySession } from "./api/_auth.js";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith("/api/") &&
      !["/api/login", "/api/callback", "/api/logout", "/api/me"].includes(url.pathname)) {
    const session = await verifySession(context.request, context.env);
    if (!session) return Response.json({ error: "No has iniciado sesión." }, { status: 401 });
    context.data.session = session;
  }
  return context.next();
}
