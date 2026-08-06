/* =========================================================================
   MOTOR DE CUOTAS Y CLASIFICACIÓN DE PODER
   -------------------------------------------------------------------------
   Todo acá son funciones puras: reciben datos y devuelven números. No
   tocan la base de datos. Quien las llama (admin.js, render.js) decide
   qué hacer con el resultado.

   IMPORTANTE (aclaración que pide el propio sitio en la sección de
   Cuotas): esto NO son apuestas reales, es una simulación basada en
   rendimiento deportivo.
   ========================================================================= */

const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]; // P1..P10

/**
 * Calcula el puntaje de "forma" de cada piloto, combinando:
 *  - Victorias, podios, poles, vueltas rápidas (peso fijo)
 *  - Abandonos (resta)
 *  - Fuerza del equipo actual
 *  - Consistencia: qué tan parejos son sus últimos resultados
 *  - Peso mayor a los resultados recientes que a los antiguos
 *  - Penalización leve por cambio de equipo reciente (adaptación)
 *  - Diferencia de puntos con el líder del campeonato
 */
function computeDriverScore(driver, teams, leaderPoints) {
  const team = driver.team ? teams[driver.team] : null;
  const teamStrength = team ? team.strength : 2;

  // Preseason base: si todavía no hay carreras corridas, usamos el orden
  // de forma pretemporada declarado en los datos (menor rank = mejor).
  const preseasonBase = driver.preseasonRank ? (25 - driver.preseasonRank) : 0;

  const history = Array.isArray(driver.history) ? driver.history : [];
  // Peso creciente a los resultados más recientes (los últimos pesan más)
  let recentForm = 0;
  let recentWeightSum = 0;
  history.slice(-6).forEach((h, idx, arr) => {
    const weight = idx + 1; // más reciente => idx más alto => más peso
    const posScore = h.position ? Math.max(0, 21 - h.position) : 0;
    recentForm += posScore * weight;
    recentWeightSum += weight;
  });
  const recentFormAvg = recentWeightSum ? recentForm / recentWeightSum : 0;

  // Consistencia: penaliza resultados muy irregulares
  let consistencyBonus = 0;
  if (history.length >= 2) {
    const positions = history.slice(-6).map(h => h.position || 20);
    const avg = positions.reduce((a, b) => a + b, 0) / positions.length;
    const variance = positions.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / positions.length;
    consistencyBonus = Math.max(0, 10 - Math.sqrt(variance));
  }

  const adaptationPenalty = driver.recentTeamChange ? 4 : 0;
  const gapPenalty = leaderPoints > 0 ? Math.min(20, (leaderPoints - driver.points) * 0.25) : 0;

  const score =
    preseasonBase * 1.2 +
    recentFormAvg * 3 +
    driver.wins * 8 +
    driver.podiums * 4 +
    driver.poles * 3 +
    driver.fastestLaps * 1.5 -
    driver.dnfs * 3 +
    teamStrength * 2 +
    consistencyBonus -
    adaptationPenalty -
    gapPenalty;

  return Math.max(1, score);
}

/** Clasificación de poder: ranking independiente 1-10 con cambio semanal */
function computePowerRanking(drivers, teams, previousRanking) {
  const leaderPoints = Math.max(0, ...Object.values(drivers).map(d => d.points || 0));
  const scored = Object.values(drivers).map(d => ({
    id: d.id,
    driver: d,
    score: computeDriverScore(d, teams, leaderPoints),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s, i) => {
    const prevEntry = previousRanking && previousRanking[s.id];
    const prevPos = prevEntry ? prevEntry.position : i + 1;
    return {
      id: s.id,
      position: i + 1,
      score: Math.round(s.score * 10) / 10,
      change: prevPos - (i + 1), // positivo = subió puestos
    };
  });
}

/** Cuotas simuladas: probabilidad de campeonato + cuota estilo decimal */
function computeOdds(drivers, teams, previousOdds) {
  const leaderPoints = Math.max(0, ...Object.values(drivers).map(d => d.points || 0));
  const list = Object.values(drivers).map(d => ({
    id: d.id,
    score: computeDriverScore(d, teams, leaderPoints),
  }));

  // Softmax para pasar de "score" a probabilidad de campeonato
  const T = 18; // temperatura: más alto = cuotas más parejas
  const exps = list.map(l => Math.exp(l.score / T));
  const sumExp = exps.reduce((a, b) => a + b, 0);

  const result = {};
  list.forEach((l, i) => {
    const probability = exps[i] / sumExp;
    const cuota = Math.max(1.01, Math.round((1 / probability) * 100) / 100);
    const prev = previousOdds && previousOdds[l.id] ? previousOdds[l.id].cuota : cuota;
    result[l.id] = {
      probability: Math.round(probability * 1000) / 10, // en %
      cuota,
      trend: cuota < prev ? "baja" : cuota > prev ? "sube" : "igual", // baja cuota = sube favoritismo
      history: (previousOdds && previousOdds[l.id] && previousOdds[l.id].history) || [],
    };
    result[l.id].history = [...result[l.id].history, cuota].slice(-12);
  });
  return result;
}

/** Determina quién es el favorito actual: menor cuota = mayor probabilidad */
function getFavorite(odds, drivers) {
  let bestId = null, bestCuota = Infinity;
  Object.entries(odds).forEach(([id, o]) => {
    if (o.cuota < bestCuota) { bestCuota = o.cuota; bestId = id; }
  });
  return bestId ? { id: bestId, driver: drivers[bestId], odds: odds[bestId] } : null;
}

/** Tabla de campeonato de pilotos, ordenada, con diferencia respecto al líder */
function computeDriverStandings(drivers, odds) {
  const arr = Object.values(drivers).sort((a, b) =>
    (b.points - a.points) || (b.wins - a.wins) || (b.podiums - a.podiums)
  );
  const leaderPoints = arr.length ? arr[0].points : 0;
  return arr.map((d, i) => ({
    position: i + 1,
    driver: d,
    gap: i === 0 ? "-" : `-${leaderPoints - d.points}`,
    odds: odds ? odds[d.id] : null,
  }));
}

/** Tabla de campeonato de constructores */
function computeConstructorStandings(drivers, teams, odds) {
  const totals = {};
  Object.values(teams).forEach(t => {
    totals[t.id] = { team: t, points: 0, wins: 0, poles: 0, podiums: 0, cuota: null };
  });
  Object.values(drivers).forEach(d => {
    if (!d.team || !totals[d.team]) return;
    totals[d.team].points += d.points || 0;
    totals[d.team].wins += d.wins || 0;
    totals[d.team].poles += d.poles || 0;
    totals[d.team].podiums += d.podiums || 0;
  });
  if (odds) {
    Object.values(drivers).forEach(d => {
      if (!d.team || !totals[d.team] || !odds[d.id]) return;
      const cur = totals[d.team].cuota;
      const driverProb = odds[d.id].probability;
      totals[d.team].cuota = cur == null ? driverProb : cur + driverProb;
    });
    Object.values(totals).forEach(t => {
      t.cuota = t.cuota ? Math.max(1.01, Math.round((100 / t.cuota) * 100) / 100) : 99;
    });
  }
  return Object.values(totals)
    .sort((a, b) => b.points - a.points)
    .map((t, i) => Object.assign({ position: i + 1 }, t));
}

/** Aplica el resultado de UNA carrera (sábado o domingo) a los pilotos */
function applyRaceResultToDrivers(driversObj, orderedFinisherIds, poleDriverId, fastestLapDriverId, dnfIds) {
  const updated = JSON.parse(JSON.stringify(driversObj));
  orderedFinisherIds.forEach((id, idx) => {
    if (!updated[id]) return;
    const pos = idx + 1;
    const pts = POINTS_TABLE[idx] || 0;
    updated[id].points = (updated[id].points || 0) + pts;
    if (pos === 1) updated[id].wins = (updated[id].wins || 0) + 1;
    if (pos <= 3) updated[id].podiums = (updated[id].podiums || 0) + 1;
    updated[id].history = (updated[id].history || []).concat([{ position: pos, points: pts }]);
    if (!updated[id].bestResult || pos < (updated[id].bestResultNum || 99)) {
      updated[id].bestResultNum = pos;
      updated[id].bestResult = "P" + pos;
    }
  });
  (dnfIds || []).forEach(id => {
    if (!updated[id]) return;
    updated[id].dnfs = (updated[id].dnfs || 0) + 1;
    updated[id].history = (updated[id].history || []).concat([{ position: null, points: 0 }]);
  });
  if (poleDriverId && updated[poleDriverId]) updated[poleDriverId].poles = (updated[poleDriverId].poles || 0) + 1;
  if (fastestLapDriverId && updated[fastestLapDriverId]) updated[fastestLapDriverId].fastestLaps = (updated[fastestLapDriverId].fastestLaps || 0) + 1;
  return updated;
}

/** Top 10 estadísticas destacadas */
function computeTopStats(drivers) {
  const arr = Object.values(drivers);
  const top = key => [...arr].sort((a, b) => (b[key] || 0) - (a[key] || 0))[0];
  return {
    masVictorias: top("wins"),
    masPoles: top("poles"),
    masPodios: top("podiums"),
    masVueltasRapidas: top("fastestLaps"),
    masPuntos: top("points"),
    masAbandonos: top("dnfs"),
  };
}
