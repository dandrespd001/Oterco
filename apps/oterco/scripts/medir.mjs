/**
 * OT-11 — Medición reproducible de transferencia estática (OT-Q037/Q038).
 *
 * Node sin dependencias. Recorre `dist/`, informa bytes crudos y gzip por
 * archivo, totales de transferencia inicial de la portada y carga incremental
 * del preparador (0 bytes: módulo deshabilitado, OT-Q032).
 *
 * Método gzip registrado (Q037 exige "método registrado"):
 *   zlib.gzipSync(contenido) — gzip (RFC 1952), nivel 9 por defecto de zlib,
 *   medido con `node --version` vigente y sin Brotli (no se compara Brotli
 *   con gzip para aparentar cumplimiento).
 *
 * Uso:
 *   node scripts/medir.mjs [dir-dist] [--json]
 * Sin `--json` imprime tabla legible + JSON al final; con `--json` solo JSON.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, gzipSync } from "node:zlib";

const RAIZ_SCRIPT = join(fileURLToPath(import.meta.url), "..", "..");
const DIST_DEFECTO = join(RAIZ_SCRIPT, "dist");

/** Método registrado: nombre, herramienta y versión efectiva. */
export function metodoMedicion() {
  let zlibVersion = process.versions.zlib ?? "desconocida";
  let gzipVersion = "gzip del sistema no usado";
  try {
    const require = createRequire(import.meta.url);
    void require;
  } catch {
    /* sin require disponible: se informa igualmente el método */
  }
  return {
    algoritmo: "gzip (RFC 1952) vía node:zlib gzipSync, nivel 9 (defecto de zlib)",
    herramienta: `node ${process.version} + zlib ${zlibVersion}`,
    sistema: `${process.platform}-${process.arch}`,
    brotli: "no usado; prohibido comparar Brotli con gzip (presupuesto)",
    nota: gzipVersion,
  };
}

/** Archivos bajo un directorio (recursivo), rutas relativas POSIX. */
export function listarArchivos(dir) {
  const acc = [];
  function caminar(actual) {
    for (const nombre of readdirSync(actual)) {
      const ruta = join(actual, nombre);
      if (statSync(ruta).isDirectory()) {
        if (nombre === ".astro" || nombre === "node_modules") continue;
        caminar(ruta);
      } else {
        acc.push(relative(dir, ruta).split("\\").join("/"));
      }
    }
  }
  caminar(dir);
  return acc.sort();
}

export function medirBytes(contenido) {
  const crudo = contenido.length;
  return { crudo, gzip: gzipSync(contenido).length, deflate: deflateSync(contenido).length };
}

/**
 * Mide todo `dist`. Devuelve `{ metodo, archivos, portada, preparador }`.
 * - `archivos`: por ruta relativa { crudo, gzip }.
 * - `portada.transferenciaInicial`: index.html + CSS referenciado + favicon
 *   (recursos que el navegador pide con caché vacía y sin interacción).
 * - `preparador`: carga incremental del módulo (0 bytes deshabilitado).
 */
export function medirDist(dirDist = DIST_DEFECTO) {
  const dir = resolve(dirDist);
  const metodo = metodoMedicion();
  const archivos = {};
  for (const rel of listarArchivos(dir)) {
    // _headers no es transferencia HTTP de recurso (Cloudflare Pages lo
    // consume como configuración); se lista aparte como "config", no bytes.
    if (rel === "_headers") {
      archivos[rel] = { config: true, crudo: statSync(join(dir, rel)).size, gzip: 0 };
      continue;
    }
    const contenido = readFileSync(join(dir, rel));
    const { crudo, gzip } = medirBytes(contenido);
    archivos[rel] = { crudo, gzip };
  }

  // Transferencia inicial de la portada: HTML + activos que referencia.
  const html = readFileSync(join(dir, "index.html"), "utf-8");
  const cssHref = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  const iconoHref = [...html.matchAll(/<link[^>]+rel="icon"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  const refs = [...new Set([...cssHref, ...iconoHref])].map((h) => h.replace(/^\//, ""));
  const piezas = ["index.html", ...refs].filter((r) => archivos[r] && !archivos[r].config);
  const transferenciaInicial = {
    piezas,
    crudo: piezas.reduce((n, r) => n + archivos[r].crudo, 0),
    gzip: piezas.reduce((n, r) => n + archivos[r].gzip, 0),
  };

  // JS inicial: scripts referenciados o inline en la portada.
  const jsInline = [...html.matchAll(/<script[\s>][\s\S]*?<\/script\s*>/gi)].map((m) => m[0]);
  const jsRefs = [...html.matchAll(/<script[^>]+src="([^"]+)"/gi)].map((m) => m[1].replace(/^\//, ""));
  let jsGzip = 0;
  for (const cuerpo of jsInline) jsGzip += gzipSync(Buffer.from(cuerpo, "utf-8")).length;
  for (const r of jsRefs) if (archivos[r] && !archivos[r].config) jsGzip += archivos[r].gzip;

  // CSS inicial: hojas referenciadas + <style> inline de la portada.
  const cssInline = [...html.matchAll(/<style[\s>][\s\S]*?<\/style\s*>/gi)].map((m) => m[0]);
  let cssGzip = 0;
  for (const r of cssHref.map((h) => h.replace(/^\//, ""))) {
    if (archivos[r] && !archivos[r].config) cssGzip += archivos[r].gzip;
  }
  for (const cuerpo of cssInline) cssGzip += gzipSync(Buffer.from(cuerpo, "utf-8")).length;

  // Carga incremental del preparador: 0 bytes hoy (deshabilitado OT-Q032:
  // dist no publica data-preparador, mailto ni scripts del módulo).
  const tienePreparador = /data-preparador|preparar-consulta/.test(html) || jsRefs.length > 0;
  const preparador = {
    habilitado: tienePreparador,
    gzipIncremental: tienePreparador ? jsGzip : 0,
    nota: tienePreparador
      ? "preparador presente en dist: su JS cuenta como incremental"
      : "módulo deshabilitado (PREPARADOR_ENABLED=false): 0 bytes incrementales",
  };

  // Inventario de fuentes/fotos servidas en dist (hoy: ninguna).
  const fuentes = Object.keys(archivos).filter((r) => /\.(woff2?|ttf|otf)$/i.test(r));
  const fotos = Object.keys(archivos).filter((r) => /\.(avif|webp|jpe?g|png)$/i.test(r));

  return {
    metodo,
    dist: dir,
    archivos,
    portada: { transferenciaInicial, jsInicialGzip: jsGzip, cssInicialGzip: cssGzip },
    preparador,
    fuentes,
    fotos,
  };
}

/** Presupuestos documentados (06_CALIDAD/RENDIMIENTO_Y_CUOTAS.md + casos). */
export const PRESUPUESTOS = {
  transferenciaInicialBytes: 1000000, // OT-Q037
  jsInicialGzipBytes: 15000, // OT-Q037
  jsIncrementalPreparadorGzipBytes: 10000, // OT-Q038
  cssInicialGzipBytes: 40000, // OT-Q038
  fuentesObjetivoBytes: 160000, // objetivo, no límite duro
  fotoPrincipalObjetivoBytes: 250000, // objetivo, no límite duro
};

export function evaluarPresupuestos(medicion = medirDist()) {
  const filas = [
    {
      medida: "transferencia inicial (crudo)",
      valor: medicion.portada.transferenciaInicial.crudo,
      limite: PRESUPUESTOS.transferenciaInicialBytes,
    },
    {
      medida: "JS inicial (gzip)",
      valor: medicion.portada.jsInicialGzip,
      limite: PRESUPUESTOS.jsInicialGzipBytes,
    },
    {
      medida: "JS incremental preparador (gzip)",
      valor: medicion.preparador.gzipIncremental,
      limite: PRESUPUESTOS.jsIncrementalPreparadorGzipBytes,
    },
    {
      medida: "CSS inicial (gzip)",
      valor: medicion.portada.cssInicialGzip,
      limite: PRESUPUESTOS.cssInicialGzipBytes,
    },
  ];
  return filas.map((f) => ({ ...f, cumple: f.valor <= f.limite }));
}

function esPrincipal() {
  const ejecutado = resolve(process.argv[1] ?? "");
  const este = resolve(fileURLToPath(import.meta.url));
  return ejecutado === este;
}

if (esPrincipal()) {
  const args = process.argv.slice(2);
  const soloJson = args.includes("--json");
  const dir = args.find((a) => !a.startsWith("--")) ?? DIST_DEFECTO;
  const med = medirDist(dir);
  const evaluacion = evaluarPresupuestos(med);
  if (soloJson) {
    console.log(JSON.stringify({ ...med, evaluacion, presupuestos: PRESUPUESTOS }, null, 2));
  } else {
    console.log(`OT-11 medición de ${med.dist}`);
    console.log(`Método: ${med.metodo.algoritmo} (${med.metodo.herramienta})`);
    console.log("archivo | crudo | gzip");
    for (const [rel, v] of Object.entries(med.archivos)) {
      console.log(`${rel} | ${v.crudo} | ${v.gzip}${v.config ? " (config, no transferencia)" : ""}`);
    }
    const t = med.portada.transferenciaInicial;
    console.log(`portada inicial [${t.piezas.join(", ")}]: ${t.crudo} B crudo, ${t.gzip} B gzip`);
    console.log(`JS inicial: ${med.portada.jsInicialGzip} B gzip | CSS inicial: ${med.portada.cssInicialGzip} B gzip`);
    console.log(`preparador incremental: ${med.preparador.gzipIncremental} B gzip (${med.preparador.nota})`);
    console.log(`fuentes en dist: ${med.fuentes.length ? med.fuentes.join(", ") : "ninguna (no cableadas)"}`);
    console.log(`fotos en dist: ${med.fotos.length ? med.fotos.join(", ") : "ninguna (pendiente operador)"}`);
    for (const e of evaluacion) {
      console.log(`${e.cumple ? "CUMPLE" : "EXCEDE"} ${e.medida}: ${e.valor} ≤ ${e.limite}`);
    }
  }
}
