const $ = (id) => document.getElementById(id);
const login = () => { window.location.href = "/api/login"; };
$("loginBtn").addEventListener("click", login);
$("heroLogin").addEventListener("click", login);
$("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  location.reload();
});
function avatarUrl(user) {
  if (user.avatar) return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  const n = Number(BigInt(user.id) >> 22n) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${n}.png`;
}
async function init() {
  try {
    const response = await fetch("/api/me");
    const data = await response.json();
    if (!data.user) return;
    $("welcome").classList.add("hidden");
    $("dashboard").classList.remove("hidden");
    $("loginBtn").classList.add("hidden");
    $("logoutBtn").classList.remove("hidden");
    $("userName").textContent = data.user.global_name || data.user.username;
    $("userTag").textContent = data.user.username;
    $("userAvatar").src = avatarUrl(data.user);
    $("userAvatar").alt = "Avatar de Discord";
  } catch (error) {
    console.error("No se pudo comprobar la sesión", error);
  }
}
init();
