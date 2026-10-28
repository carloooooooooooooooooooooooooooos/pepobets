// ===================== CONFIGURACIÓN DE FIREBASE =====================

const firebaseConfig = {
  apiKey: "AIzaSyCqDo0GzIzXT-E3VPAkJVGg6wHiBBFb-Ac",
  authDomain: "pepobets.firebaseapp.com",
  projectId: "pepobets",
  storageBucket: "pepobets.firebasestorage.app",
  messagingSenderId: "147554075482",
  appId: "1:147554075482:web:2b2827b8699b8c37b0e963",
  measurementId: "G-CL8NTKKTNP"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// ===================== CONFIGURACIÓN GENERAL TENIS =====================

const UMBRAL_VALOR = 0.02;
const MAX_PARTIDOS = 15;

// API KEY CONFIGURADA
const MI_API_KEY = "43d1835242f2dcbc0d4191d34292943c";

const INFO_LIGAS = {
  // Grand Slams
  'AO':     { nombre: 'Australian Open', icono: '🇦🇺', superficie: 'Dura' },
  'RG':     { nombre: 'Roland Garros', icono: '🇫🇷', superficie: 'Tierra Batida' },
  'WIM':    { nombre: 'Wimbledon', icono: '🇬🇧', superficie: 'Hierba' },
  'USO':    { nombre: 'US Open', icono: '🇺🇸', superficie: 'Dura' },
  // Finals
  'FIN':    { nombre: 'ATP / WTA Finals', icono: '👑', superficie: 'Dura Indoor' },
  // Masters 1000
  'IW':     { nombre: 'Indian Wells', icono: '🇺🇸', superficie: 'Dura' },
  'MIA':    { nombre: 'Miami Open', icono: '🇺🇸', superficie: 'Dura' },
  'MC':     { nombre: 'Monte-Carlo Masters', icono: '🇲🇨', superficie: 'Tierra Batida' },
  'MAD':    { nombre: 'Mutua Madrid Open', icono: '🇪🇸', superficie: 'Tierra Batida' },
  'ROM':    { nombre: 'Internazionali BNL d\'Italia (Roma)', icono: '🇮🇹', superficie: 'Tierra Batida' },
  'CAN':    { nombre: 'Canadian Open', icono: '🇨🇦', superficie: 'Dura' },
  'CIN':    { nombre: 'Cincinnati Open', icono: '🇺🇸', superficie: 'Dura' },
  'SHA':    { nombre: 'Rolex Shanghai Masters', icono: '🇨🇳', superficie: 'Dura' },
  'PAR':    { nombre: 'Rolex Paris Masters', icono: '🇫🇷', superficie: 'Dura Indoor' },
  // ATP 500 (Viena prioritario)
  'VIE':    { nombre: 'Erste Bank Open (Viena)', icono: '🇦🇹', superficie: 'Dura Indoor' },
  'BAR':    { nombre: 'Barcelona Open Banc Sabadell', icono: '🇪🇸', superficie: 'Tierra Batida' },
  'LON':    { nombre: 'Queen\'s Club Championships', icono: '🇬🇧', superficie: 'Hierba' },
  'HAL':    { nombre: 'Halle Open', icono: '🇩🇪', superficie: 'Hierba' },
  'DUB':    { nombre: 'Dubai Tennis Championships', icono: '🇦🇪', superficie: 'Dura' },
  'ACA':    { nombre: 'Abierto Mexicano Acapulco', icono: '🇲🇽', superficie: 'Dura' },
  'TOK':    { nombre: 'Japan Open (Tokio)', icono: '🇯🇵', superficie: 'Dura' },
  // Circuitos y Equipos
  'ATP250': { nombre: 'Circuito ATP 250', icono: '🎾', superficie: 'Varias' },
  'WTA':    { nombre: 'WTA 1000 / 500 Tour', icono: '✨', superficie: 'Varias' },
  'DAV':    { nombre: 'Copa Davis / Laver Cup', icono: '🌍', superficie: 'Dura Indoor' }
};

const FOTOS_JUGADORES = {
  'alcaraz': './Logos Jugadores/alcaraz.png',
  'sinner': './Logos Jugadores/sinner.png',
  'djokovic': './Logos Jugadores/djokovic.png',
  'zverev': './Logos Jugadores/zverev.png',
  'medvedev': './Logos Jugadores/medvedev.png',
  'rublev': './Logos Jugadores/rublev.png',
  'ruud': './Logos Jugadores/ruud.png',
  'de minaur': './Logos Jugadores/deminaur.png',
  'tsitsipas': './Logos Jugadores/tsitsipas.png',
  'fritz': './Logos Jugadores/fritz.png',
  'dimitrov': './Logos Jugadores/dimitrov.png',
  'paolini': './Logos Jugadores/paolini.png',
  'swiatek': './Logos Jugadores/swiatek.png',
  'sabalenka': './Logos Jugadores/sabalenka.png',
  'gauff': './Logos Jugadores/gauff.png',
  'rybakina': './Logos Jugadores/rybakina.png'
};

let ligaActual = 'VIE'; // Predeterminado en Viena
let soloValor = false;
let ordenActual = 'fecha';
let modoHistorial = false;
let partidosAnalizados = [];
let dbEstatica = null;
let cargaId = 0;
let cargandoDatosApi = false;

// ===================== UTILIDADES =====================

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const EUR = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const FECHA = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
});
const media = (arr) => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null;

const ICONO_TENIS_DEFAULT = 'https://cdn-icons-png.flaticon.com/512/889/889494.png';

function buscarEscudo(nombre) {
  if (!nombre) return ICONO_TENIS_DEFAULT;
  const nombreLimpio = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  for (const [jugador, ruta] of Object.entries(FOTOS_JUGADORES)) {
    if (nombreLimpio.includes(jugador) && ruta.trim() !== '') {
      return encodeURI(ruta);
    }
  }
  return ICONO_TENIS_DEFAULT;
}

// ===================== CAPA DE DATOS CON CACHÉ LOCAL (LOCALSTORAGE) =====================

function mapearClaveTorneo(sportKey) {
  const k = sportKey.toLowerCase();
  if (k.includes('vienna') || k.includes('erste_bank')) return 'VIE';
  if (k.includes('aus_open')) return 'AO';
  if (k.includes('french_open') || k.includes('roland_garros')) return 'RG';
  if (k.includes('wimbledon')) return 'WIM';
  if (k.includes('us_open')) return 'USO';
  if (k.includes('finals')) return 'FIN';
  if (k.includes('wta')) return 'WTA';
  return 'ATP250';
}

async function cargarArchivoEstatico() {
  if (dbEstatica) return dbEstatica;
  if (cargandoDatosApi) return null;

  // 1. COMPROBAR CACHÉ LOCAL (Expira en 2 horas para no gastar peticiones)
  const CACHE_KEY = 'pepobets_tenis_cache_v1';
  const CACHE_TIEMPO_KEY = 'pepobets_tenis_tiempo_v1';
  const DOS_HORAS = 2 * 60 * 60 * 1000;

  const cacheGuardada = localStorage.getItem(CACHE_KEY);
  const tiempoGuardado = localStorage.getItem(CACHE_TIEMPO_KEY);

  if (cacheGuardada && tiempoGuardado && (Date.now() - parseInt(tiempoGuardado) < DOS_HORAS)) {
    try {
      dbEstatica = JSON.parse(cacheGuardada);
      return dbEstatica;
    } catch (e) {}
  }

  cargandoDatosApi = true;

  // 2. Intento de carga mediante The Odds API
  if (MI_API_KEY) {
    try {
      const resSports = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${MI_API_KEY}`);
      if (resSports.ok) {
        const todosDeportes = await resSports.json();
        const torneosTenisActivos = todosDeportes.filter(s => s.key.startsWith('tennis_') && s.active);

        const baseDatosVivo = { restantes: null, ligas: {} };

        for (const torneo of torneosTenisActivos) {
          const urlOdds = `https://api.the-odds-api.com/v4/sports/${torneo.key}/odds/?apiKey=${MI_API_KEY}&regions=eu&markets=h2h,totals&oddsFormat=decimal`;
          const resOdds = await fetch(urlOdds);
          if (resOdds.ok) {
            const partidos = await resOdds.json();
            const restantesHeader = resOdds.headers.get('x-requests-remaining');
            if (restantesHeader) baseDatosVivo.restantes = restantesHeader;

            const codigoTuWeb = mapearClaveTorneo(torneo.key);
            if (!baseDatosVivo.ligas[codigoTuWeb]) baseDatosVivo.ligas[codigoTuWeb] = [];
            baseDatosVivo.ligas[codigoTuWeb].push(...partidos);
          }
        }

        if (Object.keys(baseDatosVivo.ligas).length > 0) {
          dbEstatica = baseDatosVivo;
          localStorage.setItem(CACHE_KEY, JSON.stringify(dbEstatica));
          localStorage.setItem(CACHE_TIEMPO_KEY, Date.now().toString());
          cargandoDatosApi = false;
          return dbEstatica;
        }
      }
    } catch (err) {
      console.warn("Aviso: Conexión con API en vivo no disponible, recurriendo a archivo local.", err);
    }
  }

  // 3. Respaldo local (datos-tenis.json)
  const archivos = ['datos-tenis.json', 'datos-ligas.json', 'partidos.json'];
  for (const archivo of archivos) {
    try {
      const res = await fetch(`${archivo}?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json) {
          if (json.torneos && !json.ligas) json.ligas = json.torneos;
          dbEstatica = json;
          cargandoDatosApi = false;
          return dbEstatica;
        }
      }
    } catch (e) {}
  }

  cargandoDatosApi = false;
  return null;
}

async function obtenerDatosLiga(codigoLiga) {
  const estatico = await cargarArchivoEstatico();
  if (!estatico) {
    return { partidos: [], restantes: null, origen: 'sin_jornada' };
  }

  if (estatico.ligas && Array.isArray(estatico.ligas[codigoLiga])) {
    return {
      partidos: estatico.ligas[codigoLiga],
      restantes: estatico.restantes ?? null,
      origen: 'robot'
    };
  }

  if (Array.isArray(estatico)) {
    return {
      partidos: estatico,
      restantes: null,
      origen: 'robot'
    };
  }

  return { partidos: [], restantes: null, origen: 'sin_jornada' };
}

async function AlimentarCalculadoraSiExiste() {
  if (typeof renderizarPartidosCalculadora !== 'function') return;

  const estatico = await cargarArchivoEstatico();
  let todos = [];

  if (estatico && estatico.ligas) {
    for (const [cod, lista] of Object.entries(estatico.ligas)) {
      if (Array.isArray(lista)) {
        const nombreLiga = INFO_LIGAS[cod]?.nombre || cod;
        lista.forEach((p, idx) => {
          const analizado = analizarPartido(p, idx);
          if (analizado) {
            todos.push({
              local: analizado.local,
              visitante: analizado.visitante,
              liga: nombreLiga,
              hora: FECHA.format(analizado.fecha),
              cuota1: analizado.cuotasOriginales.local.toFixed(2),
              cuota2: analizado.cuotasOriginales.visitante.toFixed(2),
              prob1: analizado.justa.local,
              prob2: analizado.justa.visitante
            });
          }
        });
      }
    }
  } else if (Array.isArray(estatico)) {
    todos = estatico;
  }

  renderizarPartidosCalculadora(todos.slice(0, 30));
}

// ===================== MOTOR DE ANÁLISIS (2-WAY TENIS) =====================

function analizarPartido(partido, index) {
  const claves = ['local', 'visitante'];
  let cuotasSeleccionadas = null;
  let nombreCasa = partido.casa || 'Bet365';

  const localNombre = partido.player1 || partido.home_team || partido.local || 'Jugador 1';
  const visitanteNombre = partido.player2 || partido.away_team || partido.visitante || 'Jugador 2';

  if (partido.cuotas && Number.isFinite(partido.cuotas.local) && Number.isFinite(partido.cuotas.visitante)) {
    cuotasSeleccionadas = {
      local: partido.cuotas.local,
      visitante: partido.cuotas.visitante
    };
  } else if (partido.bookmakers && partido.bookmakers.length > 0) {
    const bet365Book = partido.bookmakers.find(b => (b.title || '').toLowerCase() === 'bet365');
    const casas = bet365Book ? [bet365Book, ...partido.bookmakers] : partido.bookmakers;

    for (const casa of casas) {
      const mercado = (casa.markets || []).find(m => m.key === 'h2h');
      if (mercado && Array.isArray(mercado.outcomes)) {
        const precio = (nombre) => mercado.outcomes.find(o => o.name === nombre)?.price;
        const q = {
          local: precio(localNombre),
          visitante: precio(visitanteNombre)
        };
        if (claves.every(k => Number.isFinite(q[k]) && q[k] > 1)) {
          cuotasSeleccionadas = q;
          nombreCasa = casa.title || 'Bet365';
          break;
        }
      }
    }
  }

  if (!cuotasSeleccionadas && (partido.cuota1 || partido.cuota2)) {
    cuotasSeleccionadas = {
      local: parseFloat(partido.cuota1) || 1.75,
      visitante: parseFloat(partido.cuota2) || 2.10
    };
  }

  if (!cuotasSeleccionadas) return null;

  const inversas = claves.map(k => 1 / cuotasSeleccionadas[k]);
  const suma = inversas.reduce((a, b) => a + b, 0);
  const justa = {};
  claves.forEach((k, i) => { justa[k] = inversas[i] / suma; });

  const mejor = {
    local: { cuota: cuotasSeleccionadas.local, casa: nombreCasa },
    visitante: { cuota: cuotasSeleccionadas.visitante, casa: nombreCasa }
  };

  const ventaja = {};
  claves.forEach((k) => { ventaja[k] = mejor[k].cuota * justa[k] - 1; });
  const claveValor = claves.reduce((a, b) => (ventaja[b] > ventaja[a] ? b : a));

  const valor = ventaja[claveValor] >= UMBRAL_VALOR
    ? { clave: claveValor, cuota: mejor[claveValor].cuota, casa: nombreCasa }
    : null;

  const orden = [...claves].sort((a, b) => justa[b] - justa[a]);
  const probable = { clave: orden[0], prob: justa[orden[0]] };

  let etiquetaConfianza = "Partido muy parejo";
  if (probable.prob >= 0.68) etiquetaConfianza = "Favorito muy claro";
  else if (probable.prob >= 0.56) etiquetaConfianza = "Favorito sólido";

  const probOver215 = probabilidadGeneral(partido, 'totals', 'Over', 21.5);
  const probOver225 = probabilidadGeneral(partido, 'totals', 'Over', 22.5);
  let tendenciaJuegos = partido.tendenciaJuegos || partido.tendenciaGoles || "";
  if (!tendenciaJuegos) {
    if (probOver225 !== null && probOver225 >= 0.53) {
      tendenciaJuegos = `Más de 22.5 Juegos (${Math.round(probOver225 * 100)}% prob.)`;
    } else if (probOver215 !== null && probOver215 >= 0.55) {
      tendenciaJuegos = `Más de 21.5 Juegos (${Math.round(probOver215 * 100)}% prob.)`;
    } else if (probable.prob >= 0.68) {
      tendenciaJuegos = "Menos de 21.5 Juegos (Dominio claro)";
    } else {
      tendenciaJuegos = "Más de 21.5 Juegos (Partido disputado)";
    }
  }

  let tendenciaSets = partido.tendenciaSets || partido.ambosMarcanTexto || "";
  if (!tendenciaSets) {
    tendenciaSets = (probable.prob >= 0.64) ? "2 Sets (Victoria en sets corridos)" : "3 Sets / Ambos ganan un set";
  }

  const nombreFavorito = probable.clave === 'local' ? localNombre : visitanteNombre;
  let tendenciaHandicap = partido.tendenciaHandicap || partido.tendenciaCorners || "";
  if (!tendenciaHandicap) {
    tendenciaHandicap = (probable.prob >= 0.62) ? `Hándicap -3.5 Juegos (${nombreFavorito})` : "Hándicap +3.5 No Favorito / Posible Tie-Break";
  }

  const fechaPartido = new Date(partido.commence_time || partido.fecha || Date.now() + 3600000);

  return {
    id: index,
    local: localNombre,
    visitante: visitanteNombre,
    fecha: isNaN(fechaPartido.getTime()) ? new Date(Date.now() + 3600000) : fechaPartido,
    valor,
    probable,
    justa,
    cuotasOriginales: cuotasSeleccionadas,
    etiquetaConfianza,
    mejorCuota: mejor[valor ? valor.clave : probable.clave],
    resultadoSugerido: valor ? valor.clave : probable.clave,
    esOportunidadTop: !!valor,
    probabilidadAcierto: probable.prob,
    tendenciaJuegos,
    tendenciaSets,
    tendenciaHandicap
  };
}

function probabilidadGeneral(partido, tipoMercado, nombreSalida, punto = null) {
  const probs = [];
  for (const casa of partido.bookmakers || []) {
    const mercado = (casa.markets || []).find((m) => m.key === tipoMercado);
    if (!mercado || !Array.isArray(mercado.outcomes)) continue;
    const itemPrincipal = mercado.outcomes.find((o) => o.name === nombreSalida && (punto === null || o.point === punto));
    if (itemPrincipal && itemPrincipal.price > 1) {
      probs.push(1 / itemPrincipal.price);
    }
  }
  return probs.length ? media(probs) : null;
}

// ===================== RENDERIZADO =====================

function actualizarEncabezadoLiga(codigoLiga) {
  const info = INFO_LIGAS[codigoLiga] || { nombre: 'Torneo Oficial ATP/WTA', icono: '🎾', superficie: 'Pista Oficial' };
  const tituloEl = document.getElementById('liga-titulo');
  const iconoEl = document.getElementById('liga-icono');
  if (tituloEl) tituloEl.textContent = modoHistorial ? `Historial — ${info.nombre}` : `${info.nombre} (${info.superficie || 'Circuito'})`;
  if (iconoEl) iconoEl.textContent = info.icono;
}

async function cargarPartidos(codigoLiga = 'VIE') {
  const container = document.getElementById('partidos-container');
  if (!container) return;

  const id = ++cargaId;
  actualizarEncabezadoLiga(codigoLiga);
  mostrarEsqueleto();
  setEstado('Sincronizando pronósticos del torneo...');

  try {
    const datos = await obtenerDatosLiga(codigoLiga);
    if (id !== cargaId) return;

    partidosAnalizados = (datos.partidos || []).map((p, idx) => analizarPartido(p, idx)).filter(Boolean);
    renderizarPartidos(datos.origen, datos.restantes);
  } catch (error) {
    if (id !== cargaId) return;
    mostrarError(error.message);
  }
}

function setEstado(texto) {
  const el = document.getElementById('estado');
  if (el) el.textContent = texto;
}

function mostrarEsqueleto() {
  const container = document.getElementById('partidos-container');
  if (container) container.innerHTML = '<div class="bg-slate-900/50 animate-pulse h-44 rounded-2xl border border-slate-800"></div>'.repeat(3);
}

function mostrarError(mensaje) {
  const container = document.getElementById('partidos-container');
  if (!container) return;
  container.innerHTML = `<div class="text-center py-12 text-sm text-red-400">Error: ${esc(mensaje)}</div>`;
}

function descripcionApuesta(p, clave) {
  if (clave === 'local') return `Victoria de ${p.local}`;
  return `Victoria de ${p.visitante}`;
}

const imgEscudo = (url, alt) => url ? `<img src="${esc(url)}" class="w-7 h-7 object-contain shrink-0 rounded-full bg-slate-950 p-0.5 border border-slate-800" alt="${esc(alt)}" loading="lazy" onerror="this.src='${ICONO_TENIS_DEFAULT}'">` : '';

function tarjetaPartido(p, stake) {
  const cuotaFinal = p.mejorCuota.cuota;
  const casaFinal = p.mejorCuota.casa;
  const retornoBruto = stake * cuotaFinal;
  const beneficioNeto = retornoBruto - stake;
  const textoRecomendacion = descripcionApuesta(p, p.resultadoSugerido);

  return `
    <article onclick="window.location.href='partido.html?liga=${ligaActual}&id=${p.id}'" class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:border-slate-600 transition duration-200 group shadow-lg">
      <div class="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-3">
        <span>📅 ${esc(FECHA.format(p.fecha))} ${p.nombreLigaCompeticion ? `• 🎾 ${esc(p.nombreLigaCompeticion)}` : ''}</span>
        <div class="flex items-center gap-2">
          ${modoHistorial ? '<span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold text-[10px]">🏁 Finalizado</span>' : (p.esOportunidadTop ? '<span class="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/30">💎 Oportunidad EV+</span>' : `<span class="text-slate-400">${p.etiquetaConfianza}</span>`)}
          <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded group-hover:bg-slate-700 group-hover:text-white transition">🔍 Ver Análisis</span>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 my-1">
        <div class="flex items-center gap-3 w-5/12 justify-end">
          <span class="font-bold text-right text-sm md:text-base truncate">${esc(p.local)}</span>
          ${imgEscudo(buscarEscudo(p.local), p.local)}
        </div>
        <span class="text-emerald-400 font-black text-xs px-2">VS</span>
        <div class="flex items-center gap-3 w-5/12 justify-start">
          ${imgEscudo(buscarEscudo(p.visitante), p.visitante)}
          <span class="font-bold text-left text-sm md:text-base truncate">${esc(p.visitante)}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div class="flex items-center justify-between sm:justify-start gap-2">
          <span class="text-slate-400">🎾 Juegos:</span>
          <span class="font-bold text-slate-200">${esc(p.tendenciaJuegos)}</span>
        </div>
        <div class="flex items-center justify-between sm:justify-start gap-2">
          <span class="text-slate-400">📊 Sets:</span>
          <span class="font-bold text-slate-200">${esc(p.tendenciaSets)}</span>
        </div>
        <div class="flex items-center justify-between sm:justify-start gap-2">
          <span class="text-slate-400">🔥 Hándicap:</span>
          <span class="font-bold text-slate-200">${esc(p.tendenciaHandicap)}</span>
        </div>
      </div>

      <div class="bg-slate-950/80 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 border border-slate-800">
        <div class="text-center sm:text-left">
          <div class="text-[11px] text-slate-400 font-medium">${modoHistorial ? 'Pronóstico que se realizó:' : 'Ganador recomendado:'}</div>
          <div class="text-sm sm:text-base font-extrabold text-emerald-400">${esc(textoRecomendacion)}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Cuota: <strong class="text-white">${cuotaFinal.toFixed(2)}</strong> (${esc(casaFinal)}) • Prob. IA: <strong class="text-emerald-300">${(p.probabilidadAcierto * 100).toFixed(1)}%</strong></div>
        </div>

        <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
          <div class="text-right text-xs">
            <div class="text-slate-400">${modoHistorial ? 'Beneficio registrado:' : 'Beneficio estimado:'}</div>
            <div class="text-sm font-extrabold text-emerald-400">+${esc(EUR.format(beneficioNeto))}</div>
          </div>
          ${modoHistorial ? '' : `<a href="https://www.bet365.com" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-xl text-center active:scale-95 transition shadow-lg">Apostar</a>`}
        </div>
      </div>
    </article>`;
}

function renderizarPartidos() {
  const container = document.getElementById('partidos-container');
  if (!container) return;

  const inputStake = document.getElementById('input-stake');
  const stake = Math.min(Math.max(parseFloat(inputStake?.value) || 10, 1), 10000);

  let lista = partidosAnalizados.filter((p) => {
    const esFuturo = p.fecha.getTime() > Date.now();
    return modoHistorial ? !esFuturo : esFuturo;
  });

  if (!modoHistorial && lista.length === 0 && partidosAnalizados.length > 0) {
    lista = [...partidosAnalizados];
  }

  if (soloValor) {
    lista = lista.filter(p => p.esOportunidadTop);
  }

  if (ordenActual === 'probabilidad') {
    lista.sort((a, b) => b.probabilidadAcierto - a.probabilidadAcierto);
  } else {
    lista.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }

  if (modoHistorial) {
    setEstado('📜 Mostrando historial de partidos de tenis finalizados con sus pronósticos');
  } else {
    setEstado(`🟢 pepobets Tenis V5 activo — ${lista.length} partido(s) disponibles`);
  }

  if (lista.length === 0) {
    container.innerHTML = `<div class="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-slate-400 text-center text-sm">${
      soloValor ? 'No hay oportunidades Top (EV+) en esta ronda del torneo.' : (modoHistorial ? 'No hay partidos en el historial para este torneo.' : 'No hay partidos próximos programados en este torneo actualmente.')
    }</div>`;
    return;
  }

  container.innerHTML = lista.slice(0, MAX_PARTIDOS).map((p) => tarjetaPartido(p, stake)).join('');
}

function toggleVistaHistorial() {
  modoHistorial = !modoHistorial;
  actualizarEncabezadoLiga(ligaActual);
  renderizarPartidos();
}

function cambiarLiga(codigo) {
  ligaActual = codigo || 'VIE';
  cargarPartidos(ligaActual);
}

function toggleSoloValor() {
  soloValor = !soloValor;
  const btn = document.getElementById('btn-solo-valor');
  if (btn) {
    btn.setAttribute('aria-pressed', String(soloValor));
    if (soloValor) {
      btn.classList.remove('bg-slate-950', 'border-slate-800', 'text-slate-300');
      btn.classList.add('bg-amber-600', 'border-amber-500', 'text-white');
    } else {
      btn.classList.remove('bg-amber-600', 'border-amber-500', 'text-white');
      btn.classList.add('bg-slate-950', 'border-slate-800', 'text-slate-300');
    }
  }
  renderizarPartidos();
}

function cambiarOrden() {
  const select = document.getElementById('select-orden');
  if (select) {
    ordenActual = select.value;
    renderizarPartidos();
  }
}

function actualizarSimulacion() {
  renderizarPartidos();
}

// ===================== AUTENTICACIÓN CON FIREBASE =====================

auth.onAuthStateChanged((user) => {
  const authContainer = document.getElementById('auth-user-container');
  if (!authContainer) return;

  if (user) {
    authContainer.innerHTML = `
      <span class="text-xs text-emerald-400 font-bold truncate max-w-[140px]">👤 ${esc(user.email)}</span>
      <button onclick="cerrarSesionFirebase()" class="bg-slate-900 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-900 text-xs font-bold px-3 py-2 rounded-xl transition shadow">
        🚪 Salir
      </button>
    `;
  } else {
    authContainer.innerHTML = `
      <button onclick="abrirSpAuthModal(false)" class="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5">
        🔑 Iniciar Sesión
      </button>
      <button onclick="abrirSpAuthModal(true)" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5">
        📝 Registrarse
      </button>
    `;
  }
});

async function cerrarSesionFirebase() {
  try {
    await auth.signOut();
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const ligaParam = params.get('liga') || 'VIE';
  modoHistorial = params.get('historial') === 'true';

  if (document.getElementById('partidos-container')) {
    cambiarLiga(ligaParam);
  }

  AlimentarCalculadoraSiExiste();
});
