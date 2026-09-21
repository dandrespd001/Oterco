/**
 * OT-12 — Genera un candidato LOCAL de release (OT-Q044/Q045).
 *
 * Copia `dist` (sin recompilar, sin modificar el origen) a
 * `releases/<id>/` y escribe el manifiesto `releases/<id>.json` con siteId,
 * propósito, commit, versiones, hashes SHA-256 por fichero y total del
 * árbol, fecha y dominio/contacto PendienteAP.
 *
 * LOCAL y sin publicación: no hay subida, DNS, cuentas ni secretos.
 * Prohibido copiar dist hacia otro sitio (solo `releases/` propio).
 *
 * Falla (exit ≠ 0) si: propósito no permitido, siteId distinto de
 * OTERCO-<slug>, origen con marca ajena (PA), dist ausente/incompleto,
 * propósito comercial sin aprobaciones, git sin commit, o la copia difiere
 * del origen (integridad).
 *
 * Uso:
 *   node scripts/release/candidato.mjs [--dist <dir>] [--releases-dir <dir>]
 *     [--proposito candidato-tecnico|candidato-comercial-aprobado]
 *     [--site-id OTERCO-oterco] [--forzar]
 */

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  FORMATO_MANIFIESTO,
  MARCA_PENDIENTE_AP,
  PAGINAS_OBLIGATORIAS,
  PROPOSITO_COMERCIAL,
  PROPOSITO_TECNICO,
  PROPOSITOS_PERMITIDOS,
  RAIZ_APP,
  SITE_ID,
  comprobarAprobacionComercial,
  detectarOrigenAjeno,
  fallar,
  hashArbol,
  huellasDirectorio,
  infoGit,
  leerVersiones,
  parseArgs,
  reejecutarPresupuestos,
  totalBytes,
} from "./lib.mjs";

const { valores, errores } = parseArgs(process.argv.slice(2),
  ["dist", "releases-dir", "proposito", "site-id", "forzar"], ["forzar"]);
if (errores.length > 0) {
  for (const e of errores) console.error(`FALLA uso: ${e}`);
  process.exit(2);
}

const dirDist = resolve(valores["dist"] ?? join(RAIZ_APP, "dist"));
const dirReleases = resolve(valores["releases-dir"] ?? join(RAIZ_APP, "releases"));
const proposito = valores["proposito"] ?? PROPOSITO_TECNICO;
const siteId = valores["site-id"] ?? SITE_ID;
const forzar = valores["forzar"] === true;

if (!PROPOSITOS_PERMITIDOS.includes(proposito)) {
  fallar(`propósito "${proposito}" no autorizado (permitidos: ${PROPOSITOS_PERMITIDOS.join(", ")})`);
}
if (siteId !== SITE_ID) {
  fallar(`siteId "${siteId}" ajeno: se esperaba "${SITE_ID}" (patrón OTERCO-<slug>)`);
}
if (!existsSync(dirDist)) fallar(`dist ausente: ${dirDist} (ejecutar pnpm build antes)`);
for (const pagina of PAGINAS_OBLIGATORIAS) {
  if (!existsSync(join(dirDist, pagina))) fallar(`dist incompleto: falta ${pagina}`);
}
if (resolve(dirDist) === resolve(dirReleases)) {
  fallar("el directorio de releases no puede ser el propio dist");
}

const huellasOrigen = huellasDirectorio(dirDist);
const arbolOrigen = hashArbol(huellasOrigen);

const marcaAjenas = detectarOrigenAjeno(dirDist, huellasOrigen);
if (marcaAjenas.length > 0) {
  fallar(`origen ajeno (OT-Q045): ${marcaAjenas.join("; ")}`);
}

const git = infoGit(RAIZ_APP);
if (!git.disponible) fallar("sin commit de git disponible: el candidato exige commit/sha");

const id = `candidato-${git.corto}`;
const dirCandidato = join(dirReleases, id);
const rutaManifiesto = join(dirReleases, `${id}.json`);
if (!forzar && (existsSync(dirCandidato) || existsSync(rutaManifiesto))) {
  fallar(`el candidato ${id} ya existe en ${dirReleases} (usar --forzar para regenerar)`);
}

let presupuestos;
try {
  presupuestos = reejecutarPresupuestos(dirDist);
} catch (e) {
  fallar(`presupuestos no medibles sobre dist: ${e.message}`);
}
if (!presupuestos.cumple) {
  const excede = presupuestos.filas.filter((f) => !f.cumple).map((f) => f.medida).join("; ");
  fallar(`presupuestos OT-11 excedidos en origen: ${excede}`);
}

const pasosComercial = [];
if (proposito === PROPOSITO_COMERCIAL) {
  const puerta = await comprobarAprobacionComercial();
  if (!puerta.aprobada) {
    fallar(`propósito comercial bloqueado, queda técnico (OT-Q008/Q051): ${puerta.motivos.join(" | ")}`);
  }
  pasosComercial.push("aprobaciones verificadas: isPublicable=comercial, dominio y contacto aprobados");
}

mkdirSync(dirReleases, { recursive: true });
// H-3 (revisor OT-12): con --forzar se limpia el candidato previo antes de
// copiar (una copia sobre restos fusionaría árboles); sin --forzar la
// existencia ya falló arriba (falla segura).
if (forzar) rmSync(dirCandidato, { recursive: true, force: true });
mkdirSync(dirCandidato, { recursive: true });
cpSync(dirDist, dirCandidato, { recursive: true });

// Integridad en ambos sentidos: la copia debe igualar al origen y el
// origen debe seguir intacto (no se modifica dist).
const huellasCopia = huellasDirectorio(dirCandidato);
if (hashArbol(huellasCopia) !== arbolOrigen) {
  fallar("la copia difiere del origen: integridad rota, candidato abortado");
}
if (hashArbol(huellasDirectorio(dirDist)) !== arbolOrigen) {
  fallar("dist cambió durante la copia: origen inestable, candidato abortado");
}

const manifiesto = {
  formato: FORMATO_MANIFIESTO,
  id,
  siteId,
  proposito,
  commit: {
    sha: git.sha,
    corto: git.corto,
    seguimientoLimpio: git.seguimientoLimpio,
    sinSeguimiento: git.sinSeguimiento,
  },
  fecha: new Date().toISOString(),
  versiones: leerVersiones(),
  dominio: MARCA_PENDIENTE_AP,
  contacto: MARCA_PENDIENTE_AP,
  aprobacionesComercial: pasosComercial,
  origen: {
    // H-1 (revisor OT-12): ruta relativa a RAIZ_APP — el manifiesto no debe
    // filtrar rutas absolutas del operador.
    dist: relative(RAIZ_APP, dirDist) || ".",
    ficheros: huellasOrigen.length,
    totalBytes: totalBytes(huellasOrigen),
    copiadoSinRecompilar: true,
  },
  archivos: huellasOrigen,
  arbolHash: arbolOrigen,
  totalBytes: totalBytes(huellasOrigen),
  presupuestos: {
    metodo: presupuestos.metodo,
    filas: presupuestos.filas,
    cumple: presupuestos.cumple,
  },
  notas: [
    "candidato LOCAL: no publicado, sin DNS, sin cuentas remotas (publicar = OT-16/17 con operador)",
    "la promoción copia bytes sin recompilar; las cabeceras por destino se registran aparte (OT-16)",
  ],
};
writeFileSync(rutaManifiesto, JSON.stringify(manifiesto, null, 2) + "\n", "utf-8");

console.log(`CANDIDATO CREADO ${id} (local, no publicado)`);
console.log(`  siteId: ${siteId} | propósito: ${proposito}`);
console.log(`  commit: ${git.sha} (seguimiento limpio: ${git.seguimientoLimpio})`);
console.log(`  ficheros: ${huellasOrigen.length} | bytes: ${manifiesto.totalBytes} | árbol: ${arbolOrigen}`);
console.log(`  manifiesto: ${rutaManifiesto}`);
console.log(`  copia: ${dirCandidato} (bytes de dist, sin recompilar; dist intacto)`);
