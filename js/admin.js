/* =========================================================================
   ADMIN — panel protegido por contraseña. Todo lo que se guarda acá se
   escribe en la base de datos (Firebase o local) y se propaga a todos.
   ========================================================================= */

let adminTab = "pilotos";
let adminOpenForm = null; // "driver:new" | "driver:<id>" | "news:new" | "news:<id>" | null

const ADMIN_TABS = [
  ["pilotos", "Pilotos"],
  ["equipos", "Equipos"],
  ["noticias", "Noticias"],
  ["resultados", "Resultados de carrera"],
  ["calendario", "Calendario"],
  ["power", "Power Ranking"],
  ["cuotas", "Cuotas"],
  ["temporada", "Temporada"],
];

function renderAdmin(S) {
  if (!S.isAdmin) {
    return `
    <section class="section wrap">
      <div class="card locked">
        <h2>Panel de administración</h2>
        <p class="muted">Acceso restringido. Ingresá la contraseña para agregar pilotos, cargar resultados, publicar noticias y más.</p>
        <button class="btn btn--primary" data-admin-action="open-login">Iniciar sesión</button>
      </div>
    </section>`;
  }
  return `
  <section class="section wrap">
    <div class="section-head">
      <div><div class="eyebrow">Panel</div><h2 class="section-title">Administración</h2></div>
      <button class="btn btn--ghost btn--sm" data-admin-action="logout">Cerrar sesión</button>
    </div>
    <div class="admin-grid">
      <nav class="admin-nav">
        ${ADMIN_TABS.map(([k,l]) => `<button data-admin-tab="${k}" class="${adminTab===k?'active':''}">${l}</button>`).join("")}
      </nav>
      <div class="admin-panel">${renderAdminTab(S)}</div>
    </div>
  </section>`;
}

function renderAdminTab(S) {
  switch (adminTab) {
    case "pilotos": return adminPilotos(S);
    case "equipos": return adminEquipos(S);
    case "noticias": return adminNoticias(S);
    case "resultados": return adminResultados(S);
    case "calendario": return adminCalendario(S);
    case "power": return adminPower(S);
    case "cuotas": return adminCuotas(S);
    case "temporada": return adminTemporada(S);
    default: return "";
  }
}

/* ---------------- PILOTOS ---------------- */
function adminPilotos(S) {
  const drivers = Object.values(S.drivers).sort((a,b)=>a.name.localeCompare(b.name));
  const formOpen = adminOpenForm && adminOpenForm.startsWith("driver:");
  const editing = formOpen ? (adminOpenForm.split(":")[1] === "new" ? null : S.drivers[adminOpenForm.split(":")[1]]) : null;
  return `
  <div class="toolbar">
    <h3 style="margin:0">Pilotos (${drivers.length})</h3>
    <button class="btn btn--primary btn--sm" data-admin-action="driver-new">+ Agregar piloto</button>
  </div>
  ${formOpen ? driverFormHTML(S, editing) : ""}
  <p class="muted" style="font-size:12px">Las fotos se generan automáticamente con las iniciales del piloto — no hace falta subir imágenes.</p>
  ${drivers.map(d => `
    <div class="admin-list-item">
      <div class="driver-cell">${avatarHTML(d, d.team ? S.teams[d.team] : null, "sm")}<span>${d.flag} ${esc(d.name)} <span class="muted mono" style="font-size:12px">#${d.number}</span></span></div>
      <div style="display:flex; gap:8px">
        <button class="btn btn--sm" data-admin-action="driver-edit" data-id="${d.id}">Editar</button>
        <button class="btn btn--sm btn--danger" data-admin-action="driver-delete" data-id="${d.id}">Eliminar</button>
      </div>
    </div>`).join("")}
  `;
}
function driverFormHTML(S, d) {
  const teams = Object.values(S.teams).sort((a,b)=>a.name.localeCompare(b.name));
  return `
  <div class="card" id="driverFormBox" style="margin-bottom:16px">
    <div class="form-row">
      <div><label class="field-label">Nombre</label><input class="input" id="f_name" value="${esc(d?.name||'')}"></div>
      <div><label class="field-label">Número</label><input class="input" type="number" id="f_number" value="${d?.number ?? ''}"></div>
    </div>
    <div class="form-row">
      <div><label class="field-label">Nacionalidad</label><input class="input" id="f_nat" value="${esc(d?.nationality||'')}"></div>
      <div><label class="field-label">Bandera (emoji)</label><input class="input" id="f_flag" value="${d?.flag||''}"></div>
    </div>
    <div class="form-row">
      <div><label class="field-label">Equipo</label>
        <select class="input" id="f_team">
          <option value="">Sin equipo</option>
          ${teams.map(t=>`<option value="${t.id}" ${d?.team===t.id?'selected':''}>${t.name}</option>`).join("")}
        </select>
      </div>
      <div><label class="field-label">Estado</label>
        <select class="input" id="f_status">
          <option value="confirmado" ${d?.status==='confirmado'?'selected':''}>Confirmado</option>
          <option value="rumor" ${d?.status==='rumor'?'selected':''}>Rumor</option>
          <option value="libre" ${(!d||d?.status==='libre')?'selected':''}>Asiento disponible / libre</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div><label class="field-label">Edad</label><input class="input" type="number" id="f_age" value="${d?.age ?? ''}"></div>
      <div><label class="field-label">Cambió de equipo recientemente</label>
        <select class="input" id="f_teamchange">
          <option value="no" ${!d?.recentTeamChange?'selected':''}>No</option>
          <option value="si" ${d?.recentTeamChange?'selected':''}>Sí (afecta la cuota)</option>
        </select>
      </div>
    </div>
    <label class="field-label">Nota / bio corta</label>
    <textarea class="input" id="f_note">${esc(d?.note||'')}</textarea>
    <div class="modal__actions" style="margin-top:0">
      <button class="btn btn--ghost" data-admin-action="form-cancel">Cancelar</button>
      <button class="btn btn--primary" data-admin-action="driver-save" data-id="${d?.id||''}">Guardar piloto</button>
    </div>
  </div>`;
}

/* ---------------- EQUIPOS ---------------- */
function adminEquipos(S) {
  const teams = Object.values(S.teams).sort((a,b)=>a.name.localeCompare(b.name));
  return `
  <h3 style="margin-top:0">Equipos (${teams.length})</h3>
  <p class="muted" style="font-size:12px">Ajustá el color o la fuerza del equipo (usada en el cálculo de cuotas).</p>
  ${teams.map(t => `
    <div class="admin-list-item">
      <div style="display:flex; align-items:center; gap:10px; flex:1">
        <span class="team-dot" style="background:${t.color}; width:14px; height:14px"></span>
        <strong>${esc(t.name)}</strong>
        <input class="input" style="width:70px; margin:0" type="color" value="${t.color}" data-team-color="${t.id}">
        <input class="input" style="width:80px; margin:0" type="number" min="1" max="10" value="${t.strength}" data-team-strength="${t.id}">
        <span class="muted mono" style="font-size:11px">fuerza (1-10)</span>
      </div>
      <button class="btn btn--sm" data-admin-action="team-save" data-id="${t.id}">Guardar</button>
    </div>`).join("")}
  `;
}

/* ---------------- NOTICIAS ---------------- */
function adminNoticias(S) {
  const news = Object.values(S.news).sort((a,b)=> new Date(b.date)-new Date(a.date));
  const formOpen = adminOpenForm && adminOpenForm.startsWith("news:");
  const editing = formOpen ? (adminOpenForm.split(":")[1] === "new" ? null : S.news[adminOpenForm.split(":")[1]]) : null;
  return `
  <div class="toolbar">
    <h3 style="margin:0">Noticias (${news.length})</h3>
    <button class="btn btn--primary btn--sm" data-admin-action="news-new">+ Crear noticia</button>
  </div>
  ${formOpen ? newsFormHTML(editing) : ""}
  ${news.map(n => `
    <div class="admin-list-item">
      <div><strong>${esc(n.title)}</strong> <span class="muted" style="font-size:12px">· ${formatDateShort(n.date)} · ${esc(n.category)}</span></div>
      <div style="display:flex; gap:8px">
        <button class="btn btn--sm" data-admin-action="news-edit" data-id="${n.id}">Editar</button>
        <button class="btn btn--sm btn--danger" data-admin-action="news-delete" data-id="${n.id}">Eliminar</button>
      </div>
    </div>`).join("")}
  `;
}
function newsFormHTML(n) {
  return `
  <div class="card" id="newsFormBox" style="margin-bottom:16px">
    <label class="field-label">Título</label><input class="input" id="n_title" value="${esc(n?.title||'')}">
    <div class="form-row">
      <div><label class="field-label">Fecha</label><input class="input" type="date" id="n_date" value="${n?.date||''}"></div>
      <div><label class="field-label">Categoría</label>
        <select class="input" id="n_cat">
          <option ${n?.category==='Fichaje'?'selected':''}>Fichaje</option>
          <option ${n?.category==='Rumor'?'selected':''}>Rumor</option>
          <option ${n?.category==='Resultado'?'selected':''}>Resultado</option>
          <option ${n?.category==='General'?'selected':''}>General</option>
        </select>
      </div>
    </div>
    <label class="field-label">Texto</label><textarea class="input" id="n_text">${esc(n?.text||'')}</textarea>
    <div class="modal__actions" style="margin-top:0">
      <button class="btn btn--ghost" data-admin-action="form-cancel">Cancelar</button>
      <button class="btn btn--primary" data-admin-action="news-save" data-id="${n?.id||''}">Guardar noticia</button>
    </div>
  </div>`;
}

/* ---------------- RESULTADOS DE CARRERA ---------------- */
function adminResultados(S) {
  const races = Object.values(S.races).sort((a,b)=>a.order-b.order);
  const drivers = Object.values(S.drivers).sort((a,b)=>a.name.localeCompare(b.name));
  const options = drivers.map(d => `<option value="${d.id}">${d.flag} ${esc(d.name)} #${d.number}</option>`).join("");
  return `
  <h3 style="margin-top:0">Cargar resultado de una sesión</h3>
  <p class="muted" style="font-size:12px">Al guardar, se actualiza automáticamente la tabla de pilotos, constructores, la clasificación de poder y las cuotas.</p>
  <div class="form-row">
    <div><label class="field-label">Carrera</label>
      <select class="input" id="r_race">${races.map(r=>`<option value="${r.id}">${String(r.order).padStart(2,'0')} · ${r.flag} ${esc(r.gp)}</option>`).join("")}</select>
    </div>
    <div><label class="field-label">Sesión</label>
      <select class="input" id="r_session"><option value="r1">Carrera sábado (R1)</option><option value="r2">Carrera domingo (R2)</option></select>
    </div>
  </div>
  <div class="form-row">
    <div><label class="field-label">Pole position</label><select class="input" id="r_pole"><option value="">-</option>${options}</select></div>
    <div><label class="field-label">Vuelta rápida</label><select class="input" id="r_fl"><option value="">-</option>${options}</select></div>
  </div>
  <label class="field-label">Posiciones P1 a P10 (dan puntos)</label>
  <div class="grid grid--2" style="margin-bottom:10px">
    ${Array.from({length:10}).map((_,i)=>`
      <div style="display:flex; align-items:center; gap:8px">
        <span class="mono muted" style="width:26px">P${i+1}</span>
        <select class="input" style="margin:0" id="r_p${i+1}"><option value="">-</option>${options}</select>
      </div>`).join("")}
  </div>
  <label class="field-label">Abandonos (DNF)</label>
  <select class="input" id="r_dnf" multiple size="6">${options}</select>
  <div class="modal__actions" style="margin-top:14px">
    <button class="btn btn--primary" data-admin-action="race-save">Guardar resultado y recalcular</button>
  </div>`;
}

/* ---------------- CALENDARIO ---------------- */
function adminCalendario(S) {
  const races = Object.values(S.races).sort((a,b)=>a.order-b.order);
  return `
  <div class="toolbar"><h3 style="margin:0">Calendario</h3></div>
  <div class="card" style="margin-bottom:16px">
    <div class="form-row">
      <div><label class="field-label">Circuito</label><input class="input" id="c_gp" placeholder="Nombre del circuito"></div>
      <div><label class="field-label">Bandera (emoji)</label><input class="input" id="c_flag" placeholder="🏁"></div>
    </div>
    <div class="form-row">
      <div><label class="field-label">Fecha carrera sábado</label><input class="input" type="date" id="c_r1"></div>
      <div><label class="field-label">Fecha carrera domingo</label><input class="input" type="date" id="c_r2"></div>
    </div>
    <button class="btn btn--primary btn--sm" data-admin-action="race-add">+ Agregar circuito al calendario</button>
  </div>
  ${races.map(r => `
    <div class="admin-list-item">
      <div>${String(r.order).padStart(2,'0')} · ${r.flag} <strong>${esc(r.gp)}</strong> <span class="muted" style="font-size:12px">${formatDateShort(r.r1)} / ${formatDateShort(r.r2)}</span></div>
      <div style="display:flex; align-items:center; gap:8px">
        <select class="input" style="margin:0; width:130px" data-race-status="${r.id}">
          <option value="pendiente" ${r.status==='pendiente'?'selected':''}>Pendiente</option>
          <option value="proximo" ${r.status==='proximo'?'selected':''}>Próximo</option>
          <option value="finalizado" ${r.status==='finalizado'?'selected':''}>Finalizado</option>
        </select>
        <button class="btn btn--sm" data-admin-action="race-status-save" data-id="${r.id}">Guardar</button>
      </div>
    </div>`).join("")}
  `;
}

/* ---------------- POWER RANKING ---------------- */
function adminPower(S) {
  const arr = Object.entries(S.powerRanking).map(([id,p])=>Object.assign({id},p)).sort((a,b)=>a.position-b.position);
  return `
  <div class="toolbar">
    <h3 style="margin:0">Power Ranking</h3>
    <button class="btn btn--primary btn--sm" data-admin-action="power-recalc">Recalcular automáticamente</button>
  </div>
  <p class="muted" style="font-size:12px">También podés forzar manualmente la posición y el puntaje de un piloto.</p>
  ${arr.map(p => {
    const d = S.drivers[p.id]; if (!d) return "";
    return `<div class="admin-list-item">
      <div class="driver-cell">${avatarHTML(d, d.team?S.teams[d.team]:null, "sm")}<span>${d.flag} ${esc(d.name)}</span></div>
      <div style="display:flex; align-items:center; gap:8px">
        <input class="input" style="width:70px; margin:0" type="number" value="${p.position}" data-power-pos="${p.id}">
        <input class="input" style="width:80px; margin:0" type="number" value="${p.score}" data-power-score="${p.id}">
        <button class="btn btn--sm" data-admin-action="power-save" data-id="${p.id}">Guardar</button>
      </div>
    </div>`;
  }).join("")}
  `;
}

/* ---------------- CUOTAS ---------------- */
function adminCuotas(S) {
  const list = Object.entries(S.odds).map(([id,o])=>Object.assign({id},o)).sort((a,b)=>a.cuota-b.cuota);
  return `
  <div class="toolbar">
    <h3 style="margin:0">Cuotas simuladas</h3>
    <button class="btn btn--primary btn--sm" data-admin-action="odds-recalc">Recalcular cuotas</button>
  </div>
  <p class="muted" style="font-size:12px">El favorito se marca automáticamente: es el piloto con menor cuota / mayor probabilidad.</p>
  ${list.map(o => {
    const d = S.drivers[o.id]; if (!d) return "";
    const fav = S.settings.favoriteId === o.id;
    return `<div class="admin-list-item">
      <div class="driver-cell">${avatarHTML(d, d.team?S.teams[d.team]:null, "sm")}<span>${fav?'🏆 ':''}${d.flag} ${esc(d.name)}</span></div>
      <div class="mono">${o.cuota.toFixed(2)} · ${o.probability}%</div>
    </div>`;
  }).join("")}
  `;
}

/* ---------------- TEMPORADA ---------------- */
function adminTemporada(S) {
  const standings = computeDriverStandings(S.drivers, S.odds);
  const constructors = computeConstructorStandings(S.drivers, S.teams, S.odds);
  return `
  <h3 style="margin-top:0">Temporada actual</h3>
  <div class="form-row">
    <div><label class="field-label">Nombre de la temporada</label><input class="input" id="t_label" value="${esc(S.settings.seasonLabel||SEASON_LABEL)}"></div>
    <div><label class="field-label">Contraseña de administrador</label><input class="input" id="t_pass" value="${esc(S.settings.adminPassword||DEFAULT_ADMIN_PASSWORD)}"></div>
  </div>
  <button class="btn btn--sm" data-admin-action="settings-save">Guardar ajustes</button>

  <hr style="border-color:var(--border); margin:24px 0">

  <h3>Cerrar temporada y crear la siguiente</h3>
  <p class="muted" style="font-size:12px">
    Guarda automáticamente en el Historial al campeón (${standings[0]?esc(standings[0].driver.name):'-'}),
    subcampeón (${standings[1]?esc(standings[1].driver.name):'-'}), tercero (${standings[2]?esc(standings[2].driver.name):'-'})
    y constructor campeón (${constructors[0]?esc(constructors[0].team.name):'-'}). Después reinicia puntos, victorias y el
    calendario para la nueva temporada.
  </p>
  <label class="field-label">Etiqueta de la nueva temporada</label>
  <input class="input" id="t_newlabel" placeholder="Ej: 27/28">
  <button class="btn btn--danger" data-admin-action="season-close">Cerrar temporada y archivar</button>
  `;
}

/* =========================================================================
   ACCIONES (delegación de eventos)
   ========================================================================= */
document.addEventListener("click", async e => {
  const tabBtn = e.target.closest("[data-admin-tab]");
  if (tabBtn) { adminTab = tabBtn.dataset.adminTab; adminOpenForm = null; renderRoute(); return; }

  const btn = e.target.closest("[data-admin-action]");
  if (!btn) return;
  const action = btn.dataset.adminAction;
  const id = btn.dataset.id;

  try {
    if (action === "open-login") document.getElementById("loginModal").classList.add("open");
    else if (action === "logout") { AppState.isAdmin = false; renderRoute(); }
    else if (action === "form-cancel") { adminOpenForm = null; renderRoute(); }

    else if (action === "driver-new") { adminOpenForm = "driver:new"; renderRoute(); }
    else if (action === "driver-edit") { adminOpenForm = "driver:" + id; renderRoute(); }
    else if (action === "driver-delete") { if (confirm("¿Eliminar este piloto?")) { await DB.remove("drivers/" + id); showToast("Piloto eliminado"); } }
    else if (action === "driver-save") { await saveDriverForm(id); }

    else if (action === "team-save") { await saveTeam(id); }

    else if (action === "news-new") { adminOpenForm = "news:new"; renderRoute(); }
    else if (action === "news-edit") { adminOpenForm = "news:" + id; renderRoute(); }
    else if (action === "news-delete") { if (confirm("¿Eliminar esta noticia?")) { await DB.remove("news/" + id); showToast("Noticia eliminada"); } }
    else if (action === "news-save") { await saveNewsForm(id); }

    else if (action === "race-save") { await saveRaceResult(); }
    else if (action === "race-add") { await addCalendarRace(); }
    else if (action === "race-status-save") { await saveRaceStatus(id); }

    else if (action === "power-recalc") { await recalcPower(); }
    else if (action === "power-save") { await savePowerRow(id); }

    else if (action === "odds-recalc") { await recalcOdds(); }

    else if (action === "settings-save") { await saveSeasonSettings(); }
    else if (action === "season-close") { await closeSeason(); }
  } catch (err) {
    console.error(err);
    showToast("Ocurrió un error: " + err.message);
  }
});

function afterAdminRender() {} // reservado por si se necesitan bindings puntuales

/* ---------- helpers de guardado ---------- */
async function saveDriverForm(existingId) {
  const id = existingId || slugify(document.getElementById("f_name").value) + "_" + Date.now().toString(36).slice(-4);
  const base = existingId ? AppState.drivers[existingId] : { points:0, wins:0, podiums:0, poles:0, dnfs:0, fastestLaps:0, seasons:1, bestResult:"-", history:[] };
  const driver = Object.assign({}, base, {
    id,
    name: document.getElementById("f_name").value.trim(),
    number: Number(document.getElementById("f_number").value) || 0,
    nationality: document.getElementById("f_nat").value.trim(),
    flag: document.getElementById("f_flag").value.trim() || "🏁",
    team: document.getElementById("f_team").value || null,
    status: document.getElementById("f_status").value,
    age: Number(document.getElementById("f_age").value) || null,
    recentTeamChange: document.getElementById("f_teamchange").value === "si",
    note: document.getElementById("f_note").value.trim(),
  });
  if (!driver.name) { showToast("Poné un nombre para el piloto"); return; }
  await DB.set("drivers/" + id, driver);
  adminOpenForm = null;
  showToast("Piloto guardado");
  renderRoute();
}
function slugify(s) { return (s||"piloto").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,""); }

async function saveTeam(id) {
  const color = document.querySelector(`[data-team-color="${id}"]`).value;
  const strength = Number(document.querySelector(`[data-team-strength="${id}"]`).value) || 1;
  await DB.update("teams/" + id, { color, strength });
  showToast("Equipo actualizado");
}

async function saveNewsForm(existingId) {
  const id = existingId || "n_" + Date.now().toString(36);
  const news = {
    id,
    title: document.getElementById("n_title").value.trim(),
    date: document.getElementById("n_date").value || new Date().toISOString().slice(0,10),
    category: document.getElementById("n_cat").value,
    text: document.getElementById("n_text").value.trim(),
  };
  if (!news.title) { showToast("Poné un título"); return; }
  await DB.set("news/" + id, news);
  adminOpenForm = null;
  showToast("Noticia guardada");
  renderRoute();
}

async function saveRaceResult() {
  const raceId = document.getElementById("r_race").value;
  const session = document.getElementById("r_session").value;
  const pole = document.getElementById("r_pole").value || null;
  const fl = document.getElementById("r_fl").value || null;
  const positions = [];
  for (let i = 1; i <= 10; i++) {
    const v = document.getElementById("r_p" + i).value;
    if (v) positions.push(v);
  }
  const dnfSelect = document.getElementById("r_dnf");
  const dnfs = Array.from(dnfSelect.selectedOptions).map(o => o.value);

  if (!positions.length) { showToast("Cargá al menos la posición 1"); return; }

  const updatedDrivers = applyRaceResultToDrivers(AppState.drivers, positions, pole, fl, dnfs);
  await DB.set("drivers", updatedDrivers);

  const race = AppState.races[raceId];
  const resultsField = session === "r1" ? "r1Results" : "r2Results";
  const updatedRace = Object.assign({}, race, { [resultsField]: { positions, pole, fl, dnfs } });
  const bothDone = updatedRace.r1Results && updatedRace.r2Results;
  updatedRace.status = bothDone ? "finalizado" : race.status;
  await DB.set("races/" + raceId, updatedRace);

  // marcar próxima carrera pendiente como "proximo"
  const races = Object.assign({}, AppState.races, { [raceId]: updatedRace });
  const next = Object.values(races).filter(r => r.status === "pendiente").sort((a,b)=>a.order-b.order)[0];
  if (next) await DB.update("races/" + next.id, { status: "proximo" });

  await recalcOddsAndPower(updatedDrivers);

  // noticia automática
  const winner = updatedDrivers[positions[0]];
  if (winner) {
    const newsId = "n_" + Date.now().toString(36);
    await DB.set("news/" + newsId, {
      id: newsId,
      title: `${winner.name} gana en ${race.gp} (${session === "r1" ? "sábado" : "domingo"})`,
      date: new Date().toISOString().slice(0,10),
      category: "Resultado",
      text: `${winner.name} se quedó con la victoria en el Gran Premio de ${race.gp}, sesión de ${session === "r1" ? "sábado" : "domingo"}.`,
    });
  }

  showToast("Resultado cargado y campeonato actualizado");
  renderRoute();
}

async function addCalendarRace() {
  const gp = document.getElementById("c_gp").value.trim();
  const flag = document.getElementById("c_flag").value.trim() || "🏁";
  const r1 = document.getElementById("c_r1").value;
  const r2 = document.getElementById("c_r2").value;
  if (!gp || !r1 || !r2) { showToast("Completá circuito y las dos fechas"); return; }
  const order = Object.keys(AppState.races).length + 1;
  const id = "r" + order;
  await DB.set("races/" + id, { id, order, gp, flag, r1, r2, status:"pendiente", r1Results:null, r2Results:null });
  showToast("Circuito agregado al calendario");
  renderRoute();
}
async function saveRaceStatus(id) {
  const status = document.querySelector(`[data-race-status="${id}"]`).value;
  await DB.update("races/" + id, { status });
  showToast("Estado actualizado");
}

async function recalcPower() {
  const arr = computePowerRanking(AppState.drivers, AppState.teams, AppState.powerRanking);
  const obj = {}; arr.forEach(p => obj[p.id] = p);
  await DB.set("powerRanking", obj);
  showToast("Power Ranking recalculado");
}
async function savePowerRow(id) {
  const position = Number(document.querySelector(`[data-power-pos="${id}"]`).value);
  const score = Number(document.querySelector(`[data-power-score="${id}"]`).value);
  await DB.update("powerRanking/" + id, { position, score, change: 0 });
  showToast("Power Ranking actualizado manualmente");
}

async function recalcOdds() {
  await recalcOddsAndPower(AppState.drivers);
  showToast("Cuotas y Power Ranking recalculados");
}
async function recalcOddsAndPower(drivers) {
  const odds = computeOdds(drivers, AppState.teams, AppState.odds);
  await DB.set("odds", odds);
  const fav = getFavorite(odds, drivers);
  if (fav) await DB.update("settings", { favoriteId: fav.id });
  const power = computePowerRanking(drivers, AppState.teams, AppState.powerRanking);
  const powerObj = {}; power.forEach(p => powerObj[p.id] = p);
  await DB.set("powerRanking", powerObj);
}

async function saveSeasonSettings() {
  const seasonLabel = document.getElementById("t_label").value.trim() || SEASON_LABEL;
  const adminPassword = document.getElementById("t_pass").value.trim() || DEFAULT_ADMIN_PASSWORD;
  await DB.update("settings", { seasonLabel, adminPassword });
  showToast("Ajustes guardados");
}

async function closeSeason() {
  const newLabel = document.getElementById("t_newlabel").value.trim();
  if (!newLabel) { showToast("Poné una etiqueta para la nueva temporada"); return; }
  if (!confirm("Esto archiva la temporada actual y reinicia puntos y calendario. ¿Continuar?")) return;

  const standings = computeDriverStandings(AppState.drivers, AppState.odds);
  const constructors = computeConstructorStandings(AppState.drivers, AppState.teams, AppState.odds);
  const oldLabel = AppState.settings.seasonLabel || SEASON_LABEL;

  await DB.set("history/" + oldLabel, {
    champion: standings[0] ? standings[0].driver.name : "-",
    runnerUp: standings[1] ? standings[1].driver.name : "-",
    third: standings[2] ? standings[2].driver.name : "-",
    constructorChampion: constructors[0] ? constructors[0].team.name : "-",
  });

  const resetDrivers = {};
  Object.values(AppState.drivers).forEach(d => {
    resetDrivers[d.id] = Object.assign({}, d, {
      points:0, wins:0, podiums:0, poles:0, dnfs:0, fastestLaps:0,
      history:[], bestResult:"-", bestResultNum:undefined, recentTeamChange:false,
      seasons:(d.seasons||1)+1,
    });
  });
  await DB.set("drivers", resetDrivers);

  const resetRaces = {};
  Object.values(AppState.races).forEach(r => {
    resetRaces[r.id] = Object.assign({}, r, { status:"pendiente", r1Results:null, r2Results:null });
  });
  await DB.set("races", resetRaces);

  await DB.update("settings", { seasonLabel: newLabel });
  await recalcOddsAndPower(resetDrivers);

  showToast("Temporada archivada. ¡Arrancó la " + newLabel + "!");
  renderRoute();
}
