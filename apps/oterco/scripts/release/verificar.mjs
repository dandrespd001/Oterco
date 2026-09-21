/**
 * OT-12 — Verifica un candidato LOCAL contra su manifiesto (OT-Q044/Q045/Q053).
 *
 * Re-hash de cada fichero + comparación con el manifiesto (detecta
 * alteración, añadidos y eliminaciones), re-ejecución de presupuestos
 * OT-11, cordura según propósito (técnico: 0 scripts + noindex; comercial:
 * exige aprobaciones de isPublicable + DOMINIO_APROBADO, hoy técnicas) y
 * cuotas Free (Q053: el exceso limita la función y se informa, sin pagos).
 *
 * Salida clara PASA/FALLA. Exit 0 = PASA, 1 = FALLA, 2 = uso.
 *
 * Uso:
 *   node scripts/release/verificar.mjs --candidato <id|ruta-manifiesto>
 *     [--releases-dir <dir>]
 */

import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import {
  FORMATO_MANIFIESTO,
  MARCA_PENDIENTE_AP,
  PROPOSITO_COMERCIAL,
  PROPOSITO_TECNICO,
  PROPOSITOS_PERMITIDOS,
  RAIZ_APP,
  SITE_ID,
  comprobarAprobacionComercial,
  corduraComercial,
  corduraTecnica,
  detectarOrigenAjeno,
  evaluarCuotas,
  fallar,
  hashArbol,
  huellasDirectorio,
  parseArgs,
  reejecutarPresupuestos,
  totalBytes,
} from "./lib.mjs";

const { valores, errores } = parseArgs(process.argv.slice(2), ["candidato", "releases-dir"]);
if (errores.length > 0) {
  for (const e of errores) console.error(`FALLA uso: ${e}`);
  process.exit(2);
}
if (!valores["candidato"]) {
  console.error("FALLA uso: falta --candidato <id|ruta-manifiesto>");
  process.exit(2);
}

const dirReleases = resolve(valores["releases-dir"] ?? join(RAIZ_APP, "releases"));
const pedido = valores["candidato"];
const rutaManifiesto = pedido.endsWith(".json") && existsSync(resolve(pedido))
  ? resolve(pedido)
  : join(dirReleases, `${basename(pedido, ".json")}.json`);

const fallos = [];
const pasa = (linea) => console.log(`PASA ${linea}`);
const falla = (linea) => {
  fallos.push(linea);
  console.log(`FALLA ${linea}`);
};

if (!existsSync(rutaManifiesto)) fallar(`manifiesto ausente: ${rutaManifiesto}`);
let manifiesto;
try {
  manifiesto = JSON.parse(readFileSync(rutaManifiesto, "utf-8"));
} catch (e) {
  fallar(`manifiesto ilegible: ${e.message}`);
}

console.log(`Verificando candidato ${manifiesto.id ?? "(sin id)"} · ${rutaManifiesto}`);

// 1. Formato, sitio y propósito.
if (manifiesto.formato !== FORMATO_MANIFIESTO) {
  falla(`formato "${manifiesto.formato}" distinto de "${FORMATO_MANIFIESTO}"`);
} else pasa(`formato ${manifiesto.formato}`);
if (manifiesto.siteId !== SITE_ID) {
  falla(`siteId "${manifiesto.siteId}" ajeno: se esperaba "${SITE_ID}"`);
} else pasa(`siteId ${manifiesto.siteId}`);
if (!PROPOSITOS_PERMITIDOS.includes(manifiesto.proposito)) {
  falla(`propósito "${manifiesto.proposito}" no autorizado`);
} else pasa(`propósito ${manifiesto.proposito}`);

// 2. Directorio del candidato y re-hash contra el manifiesto.
const dirCandidato = join(dirReleases, manifiesto.id);
if (!existsSync(dirCandidato)) {
  falla(`carpeta del candidato ausente: ${dirCandidato}`);
} else {
  pasa(`carpeta presente: ${dirCandidato}`);
  const actuales = huellasDirectorio(dirCandidato);
  const esperadas = new Map((manifiesto.archivos ?? []).map((a) => [a.ruta, a]));
  // H-4 (revisor OT-12): contador local del bucle de ficheros — el resumen
  // de integridad se imprime aunque hubiera fallos previos de formato/siteId.
  const fallosIntegridadAntes = fallos.length;
  for (const a of actuales) {
    const e = esperadas.get(a.ruta);
    if (!e) falla(`fichero añadido tras el manifiesto: ${a.ruta}`);
    else if (e.sha256 !== a.sha256) falla(`fichero alterado: ${a.ruta}`);
    else if (e.bytes !== a.bytes) falla(`tamaño cambiado: ${a.ruta}`);
  }
  for (const ruta of esperadas.keys()) {
    if (!actuales.some((a) => a.ruta === ruta)) falla(`fichero eliminado tras el manifiesto: ${ruta}`);
  }
  if (fallos.length === fallosIntegridadAntes) pasa(`${actuales.length} ficheros con hash íntegro`);
  const arbol = hashArbol(actuales);
  if (arbol !== manifiesto.arbolHash) falla(`hash de árbol ${arbol} distinto del manifiesto ${manifiesto.arbolHash}`);
  else pasa(`hash de árbol recalculable: ${arbol}`);
  if (totalBytes(actuales) !== manifiesto.totalBytes) {
    falla(`total de bytes ${totalBytes(actuales)} distinto del manifiesto ${manifiesto.totalBytes}`);
  } else pasa(`total de bytes: ${manifiesto.totalBytes}`);

  // 3. Origen ajeno (OT-Q045) sobre la copia del candidato.
  const ajenos = detectarOrigenAjeno(dirCandidato, actuales);
  if (ajenos.length > 0) falla(`origen ajeno (OT-Q045): ${ajenos.join("; ")}`);
  else pasa("sin marca de origen ajeno (OT-Q045)");

  // 4. Cordura según propósito.
  if (manifiesto.proposito === PROPOSITO_TECNICO) {
    const c = corduraTecnica(dirCandidato);
    if (!c.pasa) for (const f of c.fallos) falla(`cordura técnica: ${f}`);
    else pasa("cordura técnica: 0 scripts + noindex en páginas");
  } else if (manifiesto.proposito === PROPOSITO_COMERCIAL) {
    const puerta = await comprobarAprobacionComercial();
    if (!puerta.aprobada) {
      falla(`comercial sin aprobaciones (OT-Q008/Q051): ${puerta.motivos.join(" | ")}`);
    } else {
      pasa("aprobaciones comerciales verificadas (isPublicable + DOMINIO_APROBADO)");
      const c = corduraComercial(dirCandidato);
      if (!c.pasa) for (const f of c.fallos) falla(`cordura comercial: ${f}`);
      else pasa("cordura comercial: 0 scripts + sin noindex");
    }
  }

  // 5. Presupuestos OT-11 re-ejecutados sobre el candidato (sin recompilar).
  try {
    const p = reejecutarPresupuestos(dirCandidato);
    for (const f of p.filas) {
      if (!f.cumple) falla(`presupuesto excedido: ${f.medida} ${f.valor} > ${f.limite}`);
    }
    if (p.cumple) pasa("presupuestos OT-11 re-ejecutados: todos cumplen");
  } catch (e) {
    falla(`presupuestos no medibles: ${e.message}`);
  }

  // 6. Cuotas Free (OT-Q053): el exceso limita e informa, sin pagos.
  const q = evaluarCuotas(actuales);
  if (!q.pasa) {
    const rotas = q.revisiones.filter((r) => !r.cumple).map((r) => `${r.regla}: ${r.valor} > ${r.limite}`);
    falla(`cuotas Free (OT-Q053): ${rotas.join("; ")} — función limitada, sin pagos automáticos`);
  } else pasa(`cuotas Free (OT-Q053): ${q.resumen}`);
}

// 7. Campos de dominio/contacto pendientes (hoy siempre PendienteAP).
if (manifiesto.dominio !== MARCA_PENDIENTE_AP || manifiesto.contacto !== MARCA_PENDIENTE_AP) {
  falla(`dominio/contacto "${manifiesto.dominio}/${manifiesto.contacto}": sin aprobación solo vale PendienteAP`);
} else pasa("dominio/contacto: PendienteAP (sin aprobación comercial)");

if (fallos.length > 0) {
  console.log(`RESULTADO: FALLA (${fallos.length} causa(s))`);
  process.exit(1);
}
console.log("RESULTADO: PASA");
