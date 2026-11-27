export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "almerix_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    }
  });
}
