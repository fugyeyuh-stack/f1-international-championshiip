/* =========================================================================
   CAPA DE DATOS (DB)
   -------------------------------------------------------------------------
   Si completás firebase-config.js con las credenciales de tu proyecto de
   Firebase, el sitio usa Firebase Realtime Database: todos los que entren
   a la página (vos y tus amigos) ven y editan la MISMA información en
   tiempo real.

   Si NO configurás Firebase, el sitio funciona igual pero guarda los datos
   en el navegador de cada persona (localStorage) — cada uno ve solo sus
   propios cambios. Es el modo ideal para probar el sitio antes de crear el
   proyecto de Firebase.

   El resto del código (render.js, admin.js, odds.js) nunca toca Firebase
   ni localStorage directamente: siempre usa el objeto DB de acá.
   ========================================================================= */

const DB = (() => {
  let mode = "local"; // "firebase" | "local"
  let fbRoot = null;
  const listeners = {}; // path -> Set(callback)
  const LOCAL_KEY = "f1champ_data_v1";

  function readLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function writeLocal(data) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  }
  function getAtPath(obj, path) {
    return path.split("/").filter(Boolean).reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function setAtPath(obj, path, value) {
    const parts = path.split("/").filter(Boolean);
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    if (parts.length === 0) return value;
    cur[parts[parts.length - 1]] = value;
    return obj;
  }
  function notifyLocal(path) {
    const data = readLocal();
    Object.keys(listeners).forEach(p => {
      if (path.startsWith(p) || p.startsWith(path)) {
        const val = getAtPath(data, p);
        listeners[p].forEach(cb => cb(val));
      }
    });
  }

  async function init() {
    const cfg = window.FIREBASE_CONFIG;
    const isConfigured = cfg && cfg.apiKey && cfg.apiKey.indexOf("TU_") !== 0 && cfg.databaseURL;
    if (isConfigured && window.firebase) {
      try {
        firebase.initializeApp(cfg);
        fbRoot = firebase.database().ref();
        mode = "firebase";
        console.log("%c[DB] Conectado a Firebase — modo colaborativo activo", "color:#39FF14");
      } catch (err) {
        console.warn("[DB] No se pudo inicializar Firebase, uso modo local.", err);
        mode = "local";
      }
    } else {
      mode = "local";
      console.log("%c[DB] Modo local (sin Firebase configurado). Ver README para activar el modo colaborativo.", "color:#FFB100");
    }
    await seedIfEmpty();
    return mode;
  }

  async function get(path) {
    if (mode === "firebase") {
      const snap = await fbRoot.child(path).once("value");
      return snap.exists() ? snap.val() : null;
    }
    return getAtPath(readLocal(), path) ?? null;
  }

  async function set(path, value) {
    if (mode === "firebase") {
      await fbRoot.child(path).set(value);
    } else {
      const data = readLocal();
      setAtPath(data, path, value);
      writeLocal(data);
      notifyLocal(path);
    }
  }

  async function update(path, partial) {
    if (mode === "firebase") {
      await fbRoot.child(path).update(partial);
    } else {
      const data = readLocal();
      const cur = getAtPath(data, path) || {};
      setAtPath(data, path, Object.assign({}, cur, partial));
      writeLocal(data);
      notifyLocal(path);
    }
  }

  async function remove(path) {
    if (mode === "firebase") {
      await fbRoot.child(path).remove();
    } else {
      const data = readLocal();
      const parts = path.split("/").filter(Boolean);
      const last = parts.pop();
      const parent = getAtPath(data, parts.join("/"));
      if (parent) delete parent[last];
      writeLocal(data);
      notifyLocal(path);
    }
  }

  function subscribe(path, cb) {
    if (mode === "firebase") {
      const ref = fbRoot.child(path);
      const handler = snap => cb(snap.exists() ? snap.val() : null);
      ref.on("value", handler);
      return () => ref.off("value", handler);
    } else {
      listeners[path] = listeners[path] || new Set();
      listeners[path].add(cb);
      get(path).then(cb);
      return () => listeners[path].delete(cb);
    }
  }

  async function seedIfEmpty() {
    const teams = await get("teams");
    if (!teams) {
      const teamsObj = {};
      SEED_TEAMS.forEach(t => teamsObj[t.id] = t);
      await set("teams", teamsObj);
    }
    const drivers = await get("drivers");
    if (!drivers) {
      const driversObj = {};
      SEED_DRIVERS.forEach(d => driversObj[d.id] = d);
      await set("drivers", driversObj);
    }
    const races = await get("races");
    if (!races) {
      const racesObj = {};
      SEED_RACES.forEach(r => racesObj[r.id] = r);
      await set("races", racesObj);
    }
    const news = await get("news");
    if (!news) {
      const newsObj = {};
      SEED_NEWS.forEach(n => newsObj[n.id] = n);
      await set("news", newsObj);
    }
    const settings = await get("settings");
    if (!settings) {
      await set("settings", { adminPassword: DEFAULT_ADMIN_PASSWORD, seasonLabel: SEASON_LABEL, favoriteId: "coffin" });
    }
    const teamsForCalc = await get("teams");
    const driversForCalc = await get("drivers");

    const odds = await get("odds");
    if (!odds) {
      await set("odds", computeOdds(driversForCalc, teamsForCalc, null));
    }
    const power = await get("powerRanking");
    if (!power) {
      const arr = computePowerRanking(driversForCalc, teamsForCalc, null);
      const obj = {};
      arr.forEach(p => obj[p.id] = p);
      await set("powerRanking", obj);
    }
    const history = await get("history");
    if (!history) await set("history", {});
  }

  function getMode() { return mode; }

  return { init, get, set, update, remove, subscribe, getMode };
})();
