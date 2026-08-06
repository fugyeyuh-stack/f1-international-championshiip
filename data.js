/* =========================================================================
   F1 INTERNATIONAL CHAMPIONSHIP — DATOS INICIALES (SEED)
   Estos datos se cargan UNA SOLA VEZ en la base de datos (Firebase o local)
   la primera vez que se abre el sitio. Después de eso, todo se lee/edita
   desde la base de datos, no desde este archivo.
   ========================================================================= */

const SEASON_LABEL = "Temporada 26/27";

/* ---------- EQUIPOS (12) ---------- */
/* strength: fuerza del auto/equipo (1-10), usada en el cálculo de cuotas */
const SEED_TEAMS = [
  { id: "redbull",      name: "Red Bull",               short: "RBR", color: "#1E41FF", color2: "#0B0F2E", base: "Austria",     strength: 9 },
  { id: "ferrari",      name: "Ferrari",                short: "FER", color: "#DC0000", color2: "#111111", base: "Italia",      strength: 8 },
  { id: "williams",     name: "Williams",               short: "WIL", color: "#00A0DE", color2: "#041E30", base: "Reino Unido", strength: 7 },
  { id: "mercedes",     name: "Mercedes",               short: "MER", color: "#00D7B9", color2: "#0B1615", base: "Alemania",    strength: 9 },
  { id: "mclaren",      name: "McLaren",                short: "MCL", color: "#FF8700", color2: "#1B1B1B", base: "Reino Unido", strength: 7 },
  { id: "audifxr",      name: "Audi FXR",               short: "AUD", color: "#BB0A30", color2: "#C0C0C0", base: "Alemania",    strength: 6 },
  { id: "porsche",      name: "Porsche",                short: "POR", color: "#C9A227", color2: "#0E0E0E", base: "Alemania",    strength: 5 },
  { id: "koenigsegg",   name: "Koenigsegg",              short: "KOE", color: "#39FF14", color2: "#0E1A0E", base: "Suecia",      strength: 4 },
  { id: "haastgr",      name: "Haas TGR",               short: "HAS", color: "#E4002B", color2: "#F5F5F5", base: "EE.UU.",      strength: 4 },
  { id: "astonmartin",  name: "Aston Martin",           short: "AMR", color: "#00674F", color2: "#0B1F1B", base: "Reino Unido", strength: 6 },
  { id: "alpine",       name: "Alpine",                 short: "ALP", color: "#2293D3", color2: "#FF1493", base: "Francia",     strength: 6 },
  { id: "lotusrenault", name: "Lotus Renault Racing",   short: "LRR", color: "#FFD400", color2: "#111111", base: "Francia",     strength: 3 },
];

/* ---------- PILOTOS (24) ---------- */
/* preseasonRank: orden de forma pretemporada (1 = mejor), usado solo para
   sembrar el Power Ranking y las Cuotas iniciales antes de que arranque la
   temporada. status: "confirmado" | "rumor" | "libre" */
const SEED_DRIVERS = [
  { id:"pujalski", name:"Alexander Pujalski", number:1,  nationality:"Argentina", flag:"🇦🇷", team:"williams",   status:"confirmado", age:29, preseasonRank:1,  note:"Campeón vigente de la Temporada 1. Sale de Red Bull rumbo a Williams." },
  { id:"coffin",   name:"Coffin",             number:99, nationality:"Venezuela", flag:"🇻🇪", team:"mercedes",   status:"confirmado", age:27, preseasonRank:2,  note:"Cerró la Temporada 1 con 5 poles consecutivas y varios segundos puestos. Llega a Mercedes." },
  { id:"carreon",  name:"Manuel Carreón",     number:21, nationality:"México",    flag:"🇲🇽", team:"redbull",    status:"confirmado", age:26, preseasonRank:3,  note:"Ganó una carrera pero flojo cierre en McLaren. Ahora a Red Bull." },
  { id:"moran",    name:"Gabriel Morán",      number:58, nationality:"Paraguay",  flag:"🇵🇾", team:"ferrari",    status:"confirmado", age:28, preseasonRank:4,  note:"Excelente temporada con varios podios en Audi. Ahora a Ferrari." },
  { id:"acosta",   name:"Hernán Acosta",      number:40, nationality:"Argentina", flag:"🇦🇷", team:"redbull",    status:"confirmado", age:31, preseasonRank:5,  note:"Grandes actuaciones en Alpine (P4/P5 habitual). Ahora a Red Bull." },
  { id:"mauricio", name:"Mauricio",           number:75, nationality:"México",    flag:"🇲🇽", team:"ferrari",    status:"confirmado", age:24, preseasonRank:6,  note:"Temporada regular. Se va a Ferrari." },
  { id:"vidal",    name:"Santiago Vidal",     number:25, nationality:"Bolivia",   flag:"🇧🇴", team:null,         status:"rumor",      age:25, preseasonRank:7,  note:"Salió de Lotus Renault Racing. Lo siguen Alpine, McLaren y Mercedes.", previousTeam:"lotusrenault", rumorTeams:["alpine","mclaren","mercedes"] },
  { id:"pichardo", name:"Pichardo",           number:22, nationality:"México",    flag:"🇲🇽", team:"williams",   status:"confirmado", age:30, preseasonRank:8 },
  { id:"osorio",   name:"Osmany Osorio",      number:67, nationality:"Cuba",      flag:"🇨🇺", team:"mercedes",   status:"confirmado", age:32, preseasonRank:9 },
  { id:"eflores",  name:"Eduardo Flores",     number:15, nationality:"México",    flag:"🇲🇽", team:null,         status:"libre",      age:23, preseasonRank:10 },
  { id:"maximo",   name:"Máximo",             number:9,  nationality:"Por confirmar", flag:"🏁", team:null,     status:"libre",      age:24, preseasonRank:11 },
  { id:"caceres",  name:"Santino Cáceres",    number:12, nationality:"Argentina", flag:"🇦🇷", team:"porsche",    status:"confirmado", age:22, preseasonRank:12 },
  { id:"jeanfranco",name:"Jeanfranco",        number:96, nationality:"Venezuela", flag:"🇻🇪", team:"astonmartin",status:"confirmado", age:27, preseasonRank:13 },
  { id:"raneri",   name:"Nehemías Raneri",    number:10, nationality:"Argentina", flag:"🇦🇷", team:"alpine",     status:"confirmado", age:29, preseasonRank:14 },
  { id:"camilo",   name:"Camilo",             number:43, nationality:"Argentina", flag:"🇦🇷", team:null,        status:"libre",      age:26, preseasonRank:15 },
  { id:"dave",     name:"Dave",               number:56, nationality:"Chile",     flag:"🇨🇱", team:null,        status:"libre",      age:25, preseasonRank:16 },
  { id:"chichar",  name:"Chichar",            number:47, nationality:"Perú",      flag:"🇵🇪", team:"mclaren",    status:"confirmado", age:28, preseasonRank:17 },
  { id:"libre1",   name:"Piloto Libre 1",     number:2,  nationality:"Por confirmar", flag:"🏁", team:null,     status:"libre",      age:24, preseasonRank:18 },
  { id:"libre2",   name:"Piloto Libre 2",     number:3,  nationality:"Por confirmar", flag:"🏁", team:null,     status:"libre",      age:24, preseasonRank:19 },
  { id:"libre3",   name:"Piloto Libre 3",     number:4,  nationality:"Por confirmar", flag:"🏁", team:null,     status:"libre",      age:24, preseasonRank:20 },
  { id:"libre4",   name:"Piloto Libre 4",     number:5,  nationality:"Por confirmar", flag:"🏁", team:null,     status:"libre",      age:24, preseasonRank:21 },
  { id:"libre5",   name:"Piloto Libre 5",     number:6,  nationality:"Por confirmar", flag:"🏁", team:null,     status:"libre",      age:24, preseasonRank:22 },
  { id:"libre6",   name:"Piloto Libre 6",     number:7,  nationality:"Por confirmar", flag:"🏁", team:null,     status:"libre",      age:24, preseasonRank:23 },
  { id:"libre7",   name:"Piloto Libre 7",     number:8,  nationality:"Por confirmar", flag:"🏁", team:null,     status:"libre",      age:24, preseasonRank:24 },
].map(d => Object.assign({
  points:0, wins:0, podiums:0, poles:0, dnfs:0, fastestLaps:0,
  seasons:1, bestResult:"-", history:[],
}, d));

/* ---------- CALENDARIO (24 fechas / 12 fines de semana) ---------- */
const SEED_RACES = [
  { order:1,  gp:"Baréin",        flag:"🇧🇭", r1:"2026-09-12", r2:"2026-09-13" },
  { order:2,  gp:"Catar",         flag:"🇶🇦", r1:"2026-09-19", r2:"2026-09-20" },
  { order:3,  gp:"China",         flag:"🇨🇳", r1:"2026-09-26", r2:"2026-09-27" },
  { order:4,  gp:"Malasia",       flag:"🇲🇾", r1:"2026-10-03", r2:"2026-10-04" },
  { order:5,  gp:"Australia",     flag:"🇦🇺", r1:"2026-10-10", r2:"2026-10-11" },
  { order:6,  gp:"Mount Panorama",flag:"🇦🇺", r1:"2026-10-17", r2:"2026-10-18" },
  { order:7,  gp:"Canadá",        flag:"🇨🇦", r1:"2026-10-24", r2:"2026-10-25" },
  { order:8,  gp:"Miami",         flag:"🇺🇸", r1:"2026-10-31", r2:"2026-11-01" },
  { order:9,  gp:"South Carolina",flag:"🇺🇸", r1:"2026-11-07", r2:"2026-11-08" },
  { order:10, gp:"Barcelona",     flag:"🇪🇸", r1:"2026-11-14", r2:"2026-11-15" },
  { order:11, gp:"Mónaco",        flag:"🇲🇨", r1:"2026-11-21", r2:"2026-11-22" },
  { order:12, gp:"Austria",       flag:"🇦🇹", r1:"2026-11-28", r2:"2026-11-29" },
  { order:13, gp:"Hungría",       flag:"🇭🇺", r1:"2026-12-05", r2:"2026-12-06" },
  { order:14, gp:"Bélgica",       flag:"🇧🇪", r1:"2026-12-12", r2:"2026-12-13" },
  { order:15, gp:"Reino Unido",   flag:"🇬🇧", r1:"2026-12-19", r2:"2026-12-20" },
  { order:16, gp:"Georgia",       flag:"🇬🇪", r1:"2026-12-26", r2:"2026-12-27" },
  { order:17, gp:"Italia",        flag:"🇮🇹", r1:"2027-01-02", r2:"2027-01-03" },
  { order:18, gp:"Singapur",      flag:"🇸🇬", r1:"2027-01-09", r2:"2027-01-10" },
  { order:19, gp:"EE.UU.",        flag:"🇺🇸", r1:"2027-01-16", r2:"2027-01-17" },
  { order:20, gp:"México",        flag:"🇲🇽", r1:"2027-01-23", r2:"2027-01-24" },
  { order:21, gp:"Las Vegas",     flag:"🇺🇸", r1:"2027-01-30", r2:"2027-01-31" },
  { order:22, gp:"Brasil",        flag:"🇧🇷", r1:"2027-02-06", r2:"2027-02-07" },
  { order:23, gp:"Arabia Saudita",flag:"🇸🇦", r1:"2027-02-13", r2:"2027-02-14" },
  { order:24, gp:"Abu Dabi",      flag:"🇦🇪", r1:"2027-02-20", r2:"2027-02-21" },
].map(r => Object.assign({
  id: "r" + r.order,
  status: "pendiente", // pendiente | proximo | finalizado
  r1Results: null, // { qualy:[driverIds...], race:[driverIds...] }
  r2Results: null,
}, r));

/* ---------- NOTICIAS ---------- */
const SEED_NEWS = [
  { id:"n1", title:"Coffin firma con Mercedes", date:"2026-08-01", category:"Fichaje",
    text:"Tras un cierre de temporada arrollador con 5 poles consecutivas, Coffin deja Audi FXR y firma con Mercedes para la Temporada 26/27. El venezolano llega como una de las grandes apuestas del mercado." , driverId:"coffin" },
  { id:"n2", title:"Pujalski deja Red Bull y ficha por Williams", date:"2026-08-02", category:"Fichaje",
    text:"El campeón vigente Alexander Pujalski sorprende al mercado y abandona Red Bull para sumarse a Williams. La pregunta que todos se hacen: ¿podrá revalidar el título con un auto distinto?", driverId:"pujalski" },
  { id:"n3", title:"Manuel Carreón refuerza a Red Bull", date:"2026-08-03", category:"Fichaje",
    text:"Después de un irregular cierre de temporada en McLaren, el mexicano Manuel Carreón firma con Red Bull para ocupar el asiento que deja Pujalski.", driverId:"carreon" },
  { id:"n4", title:"Gabriel Morán es nuevo piloto de Ferrari", date:"2026-08-04", category:"Fichaje",
    text:"El paraguayo Gabriel Morán, autor de una gran temporada con Audi FXR llena de podios, firma con la Scuderia Ferrari para la nueva temporada.", driverId:"moran" },
  { id:"n5", title:"Tres equipos siguen de cerca a Santiago Vidal", date:"2026-08-05", category:"Rumor",
    text:"El boliviano Santiago Vidal, que sale de Lotus Renault Racing, es uno de los nombres más buscados del mercado. Alpine, McLaren y Mercedes ya habrían realizado sondeos por el piloto.", driverId:"vidal" },
];

/* Contraseña de administrador por defecto (cambiarla desde Firebase o el
   panel una vez configurado). */
const DEFAULT_ADMIN_PASSWORD = "f1admin2026";
