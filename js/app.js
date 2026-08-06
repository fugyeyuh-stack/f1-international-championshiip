/* =========================================================================
   APP — estado global, suscripciones en vivo a la base de datos, router
   por hash y wiring de la interfaz (menú, modales, búsqueda, tabs).
   ========================================================================= */

const AppState = {
  teams: {}, drivers: {}, races: {}, news: {}, settings: {},
  powerRanking: {}, odds: {}, history: {},
  isAdmin: false,
  ready: false,
};

let mercadoFilter = "todos";

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- ROUTER ---------- */
const ROUTES = {
  inicio: renderInicio,
  noticias: renderNoticias,
  mercado: S => renderMercado(S, mercadoFilter),
  pilotos: renderPilotos,
  constructores: renderConstructores,
  cuotas: renderCuotas,
  power: renderPower,
  calendario: renderCalendario,
  estadisticas: renderEstadisticas,
  historial: renderHistorial,
  admin: S => (typeof renderAdmin === "function" ? renderAdmin(S) : ""),
};

function currentRouteName() {
  const hash = location.hash.replace("#/", "").split("?")[0] || "inicio";
  return ROUTES[hash] ? hash : "inicio";
}

function renderRoute() {
  if (!AppState.ready) return;
  const name = currentRouteName();
  const app = document.getElementById("app");
  app.innerHTML = `<div class="route-fade">${ROUTES[name](AppState)}</div>`;
  document.querySelectorAll(".navmenu a").forEach(a => a.classList.toggle("active", a.dataset.route === name));
  document.getElementById("footerSeason").textContent = AppState.settings.seasonLabel || SEASON_LABEL;
  document.getElementById("navMenu").classList.remove("open");

  // Post-render hooks
  if (name === "inicio") setTimeout(playStartLights, 150);
  if (name === "cuotas") setTimeout(renderOddsCharts, 30);
  if (name === "admin" && typeof afterAdminRender === "function") afterAdminRender(AppState);
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

window.addEventListener("hashchange", renderRoute);

/* ---------- DRIVER MODAL ---------- */
function openDriverModal(id) {
  const driver = AppState.drivers[id];
  if (!driver) return;
  document.getElementById("driverModalBox").innerHTML = driverProfileHTML(driver, AppState);
  document.getElementById("driverModal").classList.add("open");
  setTimeout(() => renderProfileChart(id, AppState), 30);
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

/* ---------- GLOBAL CLICK DELEGATION ---------- */
document.addEventListener("click", e => {
  const closeBtn = e.target.closest("[data-close]");
  if (closeBtn) { closeModal(closeBtn.dataset.close); return; }

  const driverEl = e.target.closest("[data-driver]");
  if (driverEl && !e.target.closest("input,button.admin-action")) {
    openDriverModal(driverEl.dataset.driver);
    return;
  }

  const tabBtn = e.target.closest("#mercadoTabs button");
  if (tabBtn) {
    mercadoFilter = tabBtn.dataset.filter;
    renderRoute();
    return;
  }
});

/* ---------- NAV TOGGLE (mobile) ---------- */
document.getElementById("navToggle").addEventListener("click", () => {
  document.getElementById("navMenu").classList.toggle("open");
});

/* ---------- ADMIN LOGIN ---------- */
document.getElementById("loginSubmit").addEventListener("click", async () => {
  const val = document.getElementById("adminPasswordInput").value;
  const correct = AppState.settings.adminPassword || DEFAULT_ADMIN_PASSWORD;
  if (val === correct) {
    AppState.isAdmin = true;
    closeModal("loginModal");
    document.getElementById("adminPasswordInput").value = "";
    document.getElementById("loginError").textContent = "";
    showToast("Sesión de administrador iniciada");
    if (currentRouteName() === "admin") renderRoute();
  } else {
    document.getElementById("loginError").textContent = "Contraseña incorrecta.";
  }
});
document.getElementById("adminPasswordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("loginSubmit").click();
});

document.querySelector('a[data-route="admin"]').addEventListener("click", e => {
  if (!AppState.isAdmin) {
    // dejamos navegar igual: la vista de admin muestra el candado y el botón de login
  }
});

/* ---------- BOOT ---------- */
async function boot() {
  await DB.init();

  const paths = ["teams", "drivers", "races", "news", "settings", "powerRanking", "odds", "history"];
  paths.forEach(p => {
    DB.subscribe(p, val => {
      AppState[p] = val || {};
      AppState.ready = true;
      renderRoute();
    });
  });

  document.getElementById("dbModeLabel").textContent =
    DB.getMode() === "firebase" ? "● Modo colaborativo (Firebase) conectado" : "● Modo local — configurá Firebase para colaborar (ver README)";

  if (!location.hash) location.hash = "#/inicio";
  renderRoute();
}

boot();
