/* =========================================================================
   RENDER — funciones que arman el HTML de cada sección a partir de
   AppState (definido en app.js). Todas devuelven un string HTML.
   ========================================================================= */

/* ---------- HELPERS ---------- */
function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function avatarHTML(driver, team, size) {
  const color = team ? team.color : "#5c5e66";
  const cls = size === "sm" ? "mini-avatar" : size === "lg" ? "profile-avatar" : "driver-avatar";
  return `<div class="${cls}" style="background:${color}">${initials(driver.name)}</div>`;
}
function teamChipHTML(team) {
  if (!team) return `<span class="team-chip"><span class="team-dot" style="background:#5c5e66"></span>Sin equipo</span>`;
  return `<span class="team-chip" style="border-color:${team.color}55"><span class="team-dot" style="background:${team.color}"></span>${team.name}</span>`;
}
function statusPillHTML(status) {
  const label = status === "confirmado" ? "Confirmado" : status === "rumor" ? "Rumor" : "Libre";
  return `<span class="status-pill status-pill--${status}">${label}</span>`;
}
function oddsBadgeHTML(odds) {
  if (!odds) return `<span class="muted mono">s/d</span>`;
  const arrow = odds.trend === "baja" ? `<span class="odds-arrow down">▼</span>` : odds.trend === "sube" ? `<span class="odds-arrow up">▲</span>` : `<span class="odds-arrow muted">—</span>`;
  return `<span class="odds-badge">${arrow}<span class="mono">${odds.cuota.toFixed(2)}</span></span>`;
}
const MONTHS_ES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function formatDateShort(iso) {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_ES[m - 1]}`;
}
function formatDateLong(iso) {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS_ES[m - 1]} de ${y}`;
}
function esc(str) { return (str ?? "").toString().replace(/[<>&"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;" }[c])); }

function driverCardHTML(driver, teams, odds) {
  const team = driver.team ? teams[driver.team] : null;
  return `
  <div class="card driver-card" data-driver="${driver.id}">
    <div class="driver-card__top">
      ${avatarHTML(driver, team)}
      <span class="driver-card__number mono">#${driver.number}</span>
    </div>
    <h3 class="driver-card__name">${driver.flag} ${esc(driver.name)}</h3>
    <div class="driver-card__meta">${esc(driver.nationality)}</div>
    <div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap">
      ${teamChipHTML(team)}
      ${statusPillHTML(driver.status)}
    </div>
    <div class="driver-card__foot">
      <span class="muted mono" style="font-size:11px">CUOTA CAMPEÓN</span>
      ${oddsBadgeHTML(odds)}
    </div>
  </div>`;
}

/* ---------- INICIO ---------- */
function renderInicio(S) {
  const favId = S.settings.favoriteId;
  const fav = S.drivers[favId];
  const favTeam = fav && fav.team ? S.teams[fav.team] : null;
  const nextRace = Object.values(S.races).filter(r => r.status !== "finalizado").sort((a,b)=>a.order-b.order)[0];
  const lastNews = Object.values(S.news).sort((a,b)=> new Date(b.date)-new Date(a.date))[0];
  const lastConfirmed = Object.values(S.drivers).filter(d=>d.status==="confirmado").length;

  return `
  <section class="hero">
    <div class="hero__inner">
      <div class="lights" id="startLights">
        ${[0,1,2,3,4].map(i=>`<span class="lights__bulb" data-i="${i}"></span>`).join("")}
      </div>
      <div class="hero__eyebrow">${esc(S.settings.seasonLabel || SEASON_LABEL)} · Sitio oficial del campeonato</div>
      <h1>CAMPEONATO<br>INTERNACIONAL DE <span>F1</span></h1>
      <p class="hero__sub">Pilotos, equipos, cuotas simuladas y toda la actualidad del campeonato en un solo lugar.</p>
      <div class="hero__stats">
        <div class="hero__stat">
          <span class="label">Favorito al título</span>
          <span class="value">${fav ? fav.flag + " " + esc(fav.name) : "-"}</span>
        </div>
        <div class="hero__stat">
          <span class="label">Próximo Gran Premio</span>
          <span class="value">${nextRace ? nextRace.flag + " " + esc(nextRace.gp) : "-"}</span>
        </div>
        <div class="hero__stat">
          <span class="label">Pilotos confirmados</span>
          <span class="value">${lastConfirmed} / 24</span>
        </div>
        <div class="hero__stat">
          <span class="label">Última actualización</span>
          <span class="value">${lastNews ? formatDateShort(lastNews.date) : "-"}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section wrap">
    <div class="section-head">
      <div><div class="eyebrow">Portada</div><h2 class="section-title">Últimas noticias</h2></div>
      <a href="#/noticias" class="btn btn--ghost btn--sm">Ver todas</a>
    </div>
    <div class="grid grid--cards">
      ${Object.values(S.news).sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,3).map(newsCardHTML).join("")}
    </div>
  </section>

  <section class="section wrap section--tight">
    <div class="section-head">
      <div><div class="eyebrow">Mercado</div><h2 class="section-title">Últimas fichas</h2></div>
      <a href="#/mercado" class="btn btn--ghost btn--sm">Ver mercado</a>
    </div>
    <div class="grid grid--cards">
      ${Object.values(S.drivers).filter(d=>d.status==="confirmado").slice(0,4).map(d=>driverCardHTML(d, S.teams, S.odds[d.id])).join("")}
    </div>
  </section>`;
}

/* ---------- NOTICIAS ---------- */
function newsCardHTML(n) {
  return `
  <article class="card news-card">
    <div class="news-card__image">
      <span class="news-card__cat">${esc(n.category)}</span>
    </div>
    <span class="news-card__date mono">${formatDateLong(n.date)}</span>
    <h3 class="news-card__title">${esc(n.title)}</h3>
    <p class="news-card__text">${esc(n.text)}</p>
  </article>`;
}
function renderNoticias(S) {
  const items = Object.values(S.news).sort((a,b)=> new Date(b.date)-new Date(a.date));
  return `
  <section class="section wrap">
    <div class="section-head"><div><div class="eyebrow">Actualidad</div><h2 class="section-title">Noticias</h2></div></div>
    <div class="grid grid--cards">${items.map(newsCardHTML).join("") || `<div class="empty">Todavía no hay noticias cargadas.</div>`}</div>
  </section>`;
}

/* ---------- MERCADO DE PILOTOS ---------- */
function renderMercado(S, filter) {
  filter = filter || "todos";
  const groups = { confirmado: [], rumor: [], libre: [] };
  Object.values(S.drivers).forEach(d => groups[d.status] && groups[d.status].push(d));
  const tabs = [["todos","Todos"],["confirmado","✅ Confirmados"],["rumor","⏳ Rumores"],["libre","❓ Asientos disponibles"]];
  let list = Object.values(S.drivers);
  if (filter !== "todos") list = groups[filter];

  return `
  <section class="section wrap">
    <div class="section-head"><div><div class="eyebrow">Fichajes</div><h2 class="section-title">Mercado de pilotos</h2></div></div>
    <div class="tabbar" id="mercadoTabs">
      ${tabs.map(([k,l]) => `<button data-filter="${k}" class="${filter===k?'active':''}">${l}</button>`).join("")}
    </div>
    <div class="grid grid--cards" id="mercadoGrid">
      ${list.map(d => driverCardHTML(d, S.teams, S.odds[d.id])).join("") || `<div class="empty">Sin resultados.</div>`}
    </div>
  </section>`;
}

/* ---------- CAMPEONATO DE PILOTOS ---------- */
function renderPilotos(S) {
  const standings = computeDriverStandings(S.drivers, S.odds);
  return `
  <section class="section wrap">
    <div class="section-head"><div><div class="eyebrow">${esc(S.settings.seasonLabel)}</div><h2 class="section-title">Campeonato de pilotos</h2></div></div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Pos</th><th>Piloto</th><th>Equipo</th><th>Pts</th><th>Vic</th><th>Poles</th><th>Podios</th>
          <th>Abd</th><th>V. Rápidas</th><th>Dif. líder</th><th>Cuota</th>
        </tr></thead>
        <tbody>
          ${standings.map(row => {
            const team = row.driver.team ? S.teams[row.driver.team] : null;
            return `<tr class="${row.position===1?'leader':''}" data-driver="${row.driver.id}" style="cursor:pointer">
              <td class="pos-cell ${row.position===1?'p1':''}">${row.position}</td>
              <td><div class="driver-cell">${avatarHTML(row.driver, team, "sm")} <span>${row.driver.flag} ${esc(row.driver.name)}</span></div></td>
              <td>${teamChipHTML(team)}</td>
              <td class="mono">${row.driver.points}</td>
              <td class="mono">${row.driver.wins}</td>
              <td class="mono">${row.driver.poles}</td>
              <td class="mono">${row.driver.podiums}</td>
              <td class="mono">${row.driver.dnfs}</td>
              <td class="mono">${row.driver.fastestLaps}</td>
              <td class="mono">${row.gap}</td>
              <td>${oddsBadgeHTML(row.odds)}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  </section>`;
}

/* ---------- CAMPEONATO DE CONSTRUCTORES ---------- */
function renderConstructores(S) {
  const standings = computeConstructorStandings(S.drivers, S.teams, S.odds);
  return `
  <section class="section wrap">
    <div class="section-head"><div><div class="eyebrow">${esc(S.settings.seasonLabel)}</div><h2 class="section-title">Campeonato de constructores</h2></div></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Pos</th><th>Equipo</th><th>Pts</th><th>Vic</th><th>Poles</th><th>Podios</th><th>Cuota</th></tr></thead>
        <tbody>
          ${standings.map(row => `
            <tr class="${row.position===1?'leader':''}">
              <td class="pos-cell ${row.position===1?'p1':''}">${row.position}</td>
              <td>${teamChipHTML(row.team)}</td>
              <td class="mono">${row.points}</td>
              <td class="mono">${row.wins}</td>
              <td class="mono">${row.poles}</td>
              <td class="mono">${row.podiums}</td>
              <td class="mono">${row.cuota ? row.cuota.toFixed(2) : "-"}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </section>`;
}

/* ---------- CUOTAS SIMULADAS ---------- */
function renderCuotas(S) {
  const list = Object.values(S.drivers)
    .map(d => ({ d, o: S.odds[d.id] }))
    .filter(x => x.o)
    .sort((a,b) => a.o.cuota - b.o.cuota);

  return `
  <section class="section wrap">
    <div class="section-head">
      <div><div class="eyebrow">Simulación</div><h2 class="section-title">Cuotas simuladas</h2></div>
    </div>
    <p class="muted" style="max-width:640px; margin-top:-10px">
      Esta sección <strong>no son apuestas reales</strong>. Es una simulación calculada según rendimiento
      deportivo: resultados recientes (con más peso que los antiguos), victorias, podios, poles,
      abandonos, consistencia, cambios de equipo y fortaleza del auto.
    </p>
    <div class="grid grid--cards" style="margin-top:20px">
      ${list.map(({d,o}, i) => {
        const team = d.team ? S.teams[d.team] : null;
        return `
        <div class="card" data-driver="${d.id}" style="cursor:pointer">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
            <div style="display:flex; align-items:center; gap:10px">
              ${avatarHTML(d, team, "sm")}
              <div>
                <div style="font-family:var(--font-display); font-weight:700">${i===0?'🏆 ':''}${d.flag} ${esc(d.name)}</div>
                <div class="muted" style="font-size:12px">${team ? team.name : "Sin equipo"}</div>
              </div>
            </div>
            ${oddsBadgeHTML(o)}
          </div>
          <div class="muted mono" style="font-size:12px">Probabilidad: ${o.probability}%</div>
          <canvas class="odds-chart" data-history="${o.history.join(',')}" height="48" style="margin-top:10px"></canvas>
        </div>`;
      }).join("")}
    </div>
  </section>`;
}

/* ---------- CLASIFICACIÓN DE PODER ---------- */
function renderPower(S) {
  const arr = Object.entries(S.powerRanking).map(([id, p]) => Object.assign({}, p, { id })).sort((a,b)=>a.position-b.position).slice(0, 10);
  return `
  <section class="section wrap">
    <div class="section-head"><div><div class="eyebrow">Ranking independiente</div><h2 class="section-title">Clasificación de poder — Top 10</h2></div></div>
    <div class="table-wrap">
      <table style="min-width:0">
        <thead><tr><th>#</th><th>Piloto</th><th>Equipo</th><th>Puntaje</th><th>Cambio</th></tr></thead>
        <tbody>
        ${arr.map(p => {
          const d = S.drivers[p.id]; if (!d) return "";
          const team = d.team ? S.teams[d.team] : null;
          const changeCls = p.change > 0 ? "up" : p.change < 0 ? "down" : "same";
          const changeTxt = p.change > 0 ? `▲ ${p.change}` : p.change < 0 ? `▼ ${Math.abs(p.change)}` : "—";
          return `<tr data-driver="${d.id}" style="cursor:pointer">
            <td class="pos-cell ${p.position<=3?'p1':''}">${p.position}</td>
            <td><div class="driver-cell">${avatarHTML(d, team, "sm")}<span>${d.flag} ${esc(d.name)}</span></div></td>
            <td>${teamChipHTML(team)}</td>
            <td class="mono">${p.score}</td>
            <td class="power-change ${changeCls}">${changeTxt}</td>
          </tr>`;
        }).join("")}
        </tbody>
      </table>
    </div>
  </section>`;
}

/* ---------- CALENDARIO ---------- */
function renderCalendario(S) {
  const races = Object.values(S.races).sort((a,b)=>a.order-b.order);
  return `
  <section class="section wrap">
    <div class="section-head"><div><div class="eyebrow">${esc(S.settings.seasonLabel)}</div><h2 class="section-title">Calendario — 24 carreras</h2></div></div>
    <div class="grid grid--cards">
      ${races.map(r => `
        <div class="card race-card">
          <span class="race-card__num mono">${String(r.order).padStart(2,'0')}</span>
          <span class="race-card__flag">${r.flag}</span>
          <div class="race-card__body">
            <div class="race-card__gp">${esc(r.gp)}</div>
            <div class="race-card__dates">R1: ${formatDateShort(r.r1)} · R2: ${formatDateShort(r.r2)}</div>
          </div>
          <span class="race-status race-status--${r.status}">${r.status}</span>
        </div>`).join("")}
    </div>
  </section>`;
}

/* ---------- ESTADÍSTICAS ---------- */
function renderEstadisticas(S) {
  const t = computeTopStats(S.drivers);
  const cards = [
    ["Más victorias", t.masVictorias, "wins"],
    ["Más poles", t.masPoles, "poles"],
    ["Más podios", t.masPodios, "podiums"],
    ["Más vueltas rápidas", t.masVueltasRapidas, "fastestLaps"],
    ["Más puntos", t.masPuntos, "points"],
    ["Más abandonos", t.masAbandonos, "dnfs"],
  ];
  return `
  <section class="section wrap">
    <div class="section-head"><div><div class="eyebrow">${esc(S.settings.seasonLabel)}</div><h2 class="section-title">Estadísticas</h2></div></div>
    <div class="grid grid--3">
      ${cards.map(([label, d, key]) => `
        <div class="card stat-card">
          <div class="stat-label">${label}</div>
          <div class="stat-value">${d ? d[key] : 0}</div>
          <div class="stat-who">${d ? d.flag + " " + esc(d.name) : "-"}</div>
        </div>`).join("")}
    </div>
  </section>`;
}

/* ---------- HISTORIAL ---------- */
function renderHistorial(S) {
  const seasons = Object.entries(S.history || {}).sort((a,b)=> b[0].localeCompare(a[0]));
  return `
  <section class="section wrap">
    <div class="section-head"><div><div class="eyebrow">Archivo</div><h2 class="section-title">Historial de temporadas</h2></div></div>
    ${seasons.length ? `
    <div class="table-wrap">
      <table style="min-width:0">
        <thead><tr><th>Temporada</th><th>Campeón</th><th>Subcampeón</th><th>Tercero</th><th>Constructor campeón</th></tr></thead>
        <tbody>
        ${seasons.map(([label, h]) => `
          <tr><td class="mono">${esc(label)}</td><td>${esc(h.champion||'-')}</td><td>${esc(h.runnerUp||'-')}</td><td>${esc(h.third||'-')}</td><td>${esc(h.constructorChampion||'-')}</td></tr>
        `).join("")}
        </tbody>
      </table>
    </div>` : `<div class="empty">Todavía no hay temporadas archivadas. Se guardan automáticamente al cerrar un campeonato desde Administración.</div>`}
  </section>`;
}

/* ---------- PERFIL DE PILOTO (modal) ---------- */
function driverProfileHTML(driver, S) {
  const team = driver.team ? S.teams[driver.team] : null;
  const odds = S.odds[driver.id];
  const stats = [
    ["Edad", driver.age ?? "-"],
    ["Victorias", driver.wins],
    ["Podios", driver.podiums],
    ["Poles", driver.poles],
    ["V. rápidas", driver.fastestLaps],
    ["Abandonos", driver.dnfs],
    ["Puntos", driver.points],
    ["Temporadas", driver.seasons],
    ["Mejor resultado", driver.bestResult || "-"],
  ];
  return `
  <div class="profile-head">
    ${avatarHTML(driver, team, "lg")}
    <div>
      <h2>${driver.flag} ${esc(driver.name)}</h2>
      <div class="muted">#${driver.number} · ${esc(driver.nationality)}</div>
      <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap">${teamChipHTML(team)}${statusPillHTML(driver.status)}</div>
    </div>
  </div>
  ${driver.note ? `<p class="muted">${esc(driver.note)}</p>` : ""}
  <div class="profile-grid">
    ${stats.map(([k,v]) => `<div class="profile-stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("")}
  </div>
  <div class="card" style="margin-top:6px">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
      <strong>Cuota actual</strong>${oddsBadgeHTML(odds)}
    </div>
    <div class="muted mono" style="font-size:12px; margin-bottom:10px">Probabilidad de campeonato: ${odds ? odds.probability + "%" : "-"}</div>
    <canvas id="profileOddsChart" height="70"></canvas>
  </div>`;
}

/* ---------- CHART RENDER (odds evolution) ---------- */
function renderOddsCharts() {
  document.querySelectorAll(".odds-chart").forEach(canvas => {
    if (canvas._chartDone) return;
    const data = (canvas.dataset.history || "").split(",").filter(Boolean).map(Number);
    if (!data.length || typeof Chart === "undefined") return;
    canvas._chartDone = true;
    new Chart(canvas, {
      type: "line",
      data: { labels: data.map((_,i)=>i+1), datasets: [{ data, borderColor: "#ff1b3d", borderWidth:2, pointRadius:0, tension:.35, fill:false }] },
      options: { responsive:true, plugins:{legend:{display:false}, tooltip:{enabled:false}}, scales:{x:{display:false}, y:{display:false}} }
    });
  });
}
function renderProfileChart(driverId, S) {
  const canvas = document.getElementById("profileOddsChart");
  const odds = S.odds[driverId];
  if (!canvas || !odds || typeof Chart === "undefined") return;
  const data = odds.history.length ? odds.history : [odds.cuota];
  new Chart(canvas, {
    type: "line",
    data: { labels: data.map((_,i)=>"R"+(i+1)), datasets: [{ label:"Cuota", data, borderColor:"#ff1b3d", backgroundColor:"rgba(255,27,61,.12)", fill:true, tension:.35, pointRadius:3 }] },
    options: { plugins:{legend:{display:false}}, scales:{ y:{ ticks:{color:"#9a9ca3"}, grid:{color:"rgba(255,255,255,.06)"} }, x:{ ticks:{color:"#9a9ca3"}, grid:{display:false} } } }
  });
}

/* ---------- START LIGHTS ANIMATION (hero signature) ---------- */
function playStartLights() {
  const bulbs = document.querySelectorAll("#startLights .lights__bulb");
  if (!bulbs.length) return;
  bulbs.forEach(b => b.classList.remove("on"));
  bulbs.forEach((b, i) => setTimeout(() => b.classList.add("on"), 220 * (i + 1)));
  setTimeout(() => bulbs.forEach(b => b.classList.remove("on")), 220 * (bulbs.length + 1) + 500);
}
