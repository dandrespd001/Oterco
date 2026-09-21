/**
 * OT-12 — Utilidades compartidas del release local (OT-Q044/Q045/Q053).
 *
 * Node sin dependencias. Sin red, sin secretos, sin cuentas remotas y sin
 * operaciones de publicación: solo lectura de `dist`, copia local de bytes
 * y hashes SHA-256. Lo usan `candidato.mjs`, `verificar.mjs`,
 * `promocionar.mjs` y `tests/release.test.mjs`.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluarPresupuestos, medirDist, metodoMedicion } from "../medir.mjs";

/** Raíz de la app (`apps/oterco`): dist, scripts y releases cuelgan de aquí. */
export const RAIZ_APP = resolve(join(dirname(fileURLToPath(import.meta.url)), "..", ".."));

/** Versión del formato de manifiesto de candidato. */
export const FORMATO_MANIFIESTO = "oterco-candidato/1";

/**
 * Identificador de sitio esperado. Patrón `OTERCO-<slug>` exigido por el
 * encargo: cualquier otro siteId (p. ej. de Puerta Abierta) se rechaza.
 */
export const SITE_ID = "OTERCO-oterco";

/** Propósitos autorizados. Solo estos dos; cualquier otro se rechaza. */
export const PROPOSITO_TECNICO = "candidato-tecnico";
export const PROPOSITO_COMERCIAL = "candidato-comercial-aprobado";
export const PROPOSITOS_PERMITIDOS = [PROPOSITO_TECNICO, PROPOSITO_COMERCIAL];

/** Marca que acompaña a todo valor pendiente de aprobación (OT-15). */
export const MARCA_PENDIENTE_AP = "pendienteAP";

/**
 * Cuotas del plan Free (05_INFRAESTRUCTURA/REGLAS_FREE.md): límites de
 * plataforma, no objetivos de peso. Superarlas limita la función y se
 * informa (OT-Q053); nunca activa pagos automáticamente.
 */
export const CUOTAS_FREE = {
  assetsPorVersion: 20000,
  bytesPorArchivo: 25 * 1024 * 1024, // 25 MiB por archivo
};

/**
 * Marca de origen ajeno (OT-Q045): un dist que mencione a Puerta Abierta
 * no puede convertirse en candidato de OTERCO. Se inspecciona texto y
 * nombres de fichero. (Hoy el dist real no contiene esta marca.)
 */
export const RE_ORIGEN_AJENO = /puerta[\s_\-]?abierta/i;

/** Páginas que deben existir en todo dist candidato. */
export const PAGINAS_OBLIGATORIAS = ["index.html", "privacidad/index.html", "404.html"];

/** Archivos de texto inspeccionables por el detector de origen ajeno. */
const EXT_TEXTO = new Set([".html", ".css", ".txt", ".xml", ".svg", ".json", ".js"]);

/** Archivos/directorios que nunca entran en huellas (ruido local). */
const EXCLUIDOS = new Set(["node_modules", ".astro", ".DS_Store"]);

/**
 * Lista recursiva de ficheros bajo `dir`, rutas relativas POSIX ordenadas.
 * Solo lectura.
 */
export function listarRelativos(dir) {
  const acc = [];
  function caminar(actual) {
    for (const nombre of readdirSync(actual)) {
      if (EXCLUIDOS.has(nombre)) continue;
      const ruta = join(actual, nombre);
      if (statSync(ruta).isDirectory()) caminar(ruta);
      else acc.push(relative(dir, ruta).split("\\").join("/"));
    }
  }
  caminar(dir);
  return acc.sort();
}

/** SHA-256 hex de un fichero (bytes, sin normalizar: copia exacta). */
export function sha256Archivo(ruta) {
  return createHash("sha256").update(readFileSync(ruta)).digest("hex");
}

/**
 * Huellas de un directorio: `[{ ruta, bytes, sha256 }]` ordenadas por ruta.
 * Recalculable por cualquiera con el mismo árbol (OT-Q044/Q053).
 */
export function huellasDirectorio(dir) {
  return listarRelativos(dir).map((ruta) => {
    const abs = join(dir, ruta);
    return { ruta, bytes: statSync(abs).size, sha256: sha256Archivo(abs) };
  });
}

/**
 * Hash total del árbol: SHA-256 sobre líneas `ruta\tsha256\tbytes`.
 * Detecta añadidos, eliminaciones, reordenaciones y alteraciones.
 */
export function hashArbol(archivos) {
  const cuerpo = archivos.map((a) => `${a.ruta}\t${a.sha256}\t${a.bytes}`).join("\n");
  return createHash("sha256").update(cuerpo, "utf-8").digest("hex");
}

/** Suma de bytes del árbol. */
export function totalBytes(archivos) {
  return archivos.reduce((n, a) => n + a.bytes, 0);
}

/**
 * Información de git (solo lectura). `seguimientoLimpio` cubre ficheros
 * seguidos (`git diff --quiet` + staged); los nuevos sin seguimiento se
 * cuentan aparte y no bloquean: el candidato registra el commit, no lo
 * exige limpio para crearse (el fallo por suciedad no está en el encargo).
 */
export function infoGit(cwd = RAIZ_APP) {
  try {
    const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd, encoding: "utf-8" }).trim();
    const corto = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd, encoding: "utf-8" }).trim();
    let seguimientoLimpio = true;
    try {
      execFileSync("git", ["diff", "--quiet", "HEAD", "--"], { cwd, stdio: "ignore" });
    } catch {
      seguimientoLimpio = false;
    }
    let sinSeguimiento = 0;
    try {
      const out = execFileSync("git", ["status", "--porcelain"], { cwd, encoding: "utf-8" });
      sinSeguimiento = out.split("\n").filter((l) => l.startsWith("??")).length;
    } catch {
      /* conteo opcional */
    }
    return { disponible: true, sha, corto, seguimientoLimpio, sinSeguimiento };
  } catch {
    return { disponible: false };
  }
}

/** Versiones reales del stack (fuente: docs/implementacion/VERSIONES.md). */
export function leerVersiones() {
  const pkg = JSON.parse(readFileSync(join(RAIZ_APP, "package.json"), "utf-8"));
  let pnpm = "desconocida";
  try {
    pnpm = execFileSync("pnpm", ["--version"], { encoding: "utf-8" }).trim();
  } catch {
    /* pnpm ausente: se registra como desconocida, no se inventa */
  }
  return {
    node: process.version,
    pnpm,
    astro: pkg.dependencies?.astro ?? "desconocida",
    typescript: pkg.devDependencies?.typescript ?? "desconocida",
    check: pkg.devDependencies?.["@astrojs/check"] ?? "desconocida",
    fuente: "docs/implementacion/VERSIONES.md (fijación OT-01, 2026-09-19)",
  };
}

/**
 * Rastrea marca de origen ajeno en un árbol ya listado. Devuelve la lista
 * de hallazgos (`ruta: motivo`); vacía = origen limpio (OT-Q045).
 */
export function detectarOrigenAjeno(dir, archivos) {
  const hallazgos = [];
  for (const a of archivos) {
    if (RE_ORIGEN_AJENO.test(a.ruta)) {
      hallazgos.push(`${a.ruta}: nombre con marca ajena`);
      continue;
    }
    const punto = a.ruta.lastIndexOf(".");
    if (!EXT_TEXTO.has(a.ruta.slice(punto).toLowerCase())) continue;
    let texto;
    try {
      texto = readFileSync(join(dir, a.ruta), "utf-8");
    } catch {
      continue;
    }
    if (RE_ORIGEN_AJENO.test(texto)) hallazgos.push(`${a.ruta}: contenido con marca ajena`);
  }
  return hallazgos;
}

/**
 * Cordura de modo técnico sobre un directorio servible: 0 `<script>` y
 * `noindex` en cada página (coherente con robots cerrado). Devuelve
 * `{ pasa, fallos[] }`.
 */
export function corduraTecnica(dir) {
  const fallos = [];
  for (const pagina of PAGINAS_OBLIGATORIAS) {
    const abs = join(dir, pagina);
    if (!existsSync(abs)) {
      fallos.push(`${pagina}: ausente`);
      continue;
    }
    const html = readFileSync(abs, "utf-8");
    if (/<script[\s>]/i.test(html)) fallos.push(`${pagina}: contiene <script>`);
    if (!/<meta[^>]*name="robots"[^>]*noindex/i.test(html)) fallos.push(`${pagina}: sin noindex`);
  }
  const robots = join(dir, "robots.txt");
  if (!existsSync(robots) || !/^Disallow: \/$/m.test(readFileSync(robots, "utf-8"))) {
    fallos.push("robots.txt: sin cierre total coherente con noindex");
  }
  return { pasa: fallos.length === 0, fallos };
}

/**
 * Cordura de modo comercial-aprobado: 0 `<script>` y SIN noindex (producción
 * indexable). Hoy inalcanzable: la puerta de aprobaciones la precede y falla.
 */
export function corduraComercial(dir) {
  const fallos = [];
  for (const pagina of PAGINAS_OBLIGATORIAS) {
    const abs = join(dir, pagina);
    if (!existsSync(abs)) {
      fallos.push(`${pagina}: ausente`);
      continue;
    }
    const html = readFileSync(abs, "utf-8");
    if (/<script[\s>]/i.test(html)) fallos.push(`${pagina}: contiene <script>`);
    if (/<meta[^>]*name="robots"[^>]*noindex/i.test(html)) {
      fallos.push(`${pagina}: con noindex (producción debe ser indexable)`);
    }
  }
  return { pasa: fallos.length === 0, fallos };
}

/**
 * Puerta de aprobación comercial (OT-Q008/Q051): exige datos aprobados
 * (`isPublicable(perfilBase) === "comercial"`, con NIT y contacto
 * verificados) y dominio aprobado (`DOMINIO_APROBADO`). Hoy ambas fallan:
 * el propósito comercial se rechaza y queda registrado como técnico.
 */
export async function comprobarAprobacionComercial() {
  const { perfilBase } = await import("../../src/content/perfil.datos.ts");
  const { isPublicable, motivosBloqueo } = await import("../../src/config/publicacion.ts");
  const { DOMINIO_APROBADO } = await import("../../src/config/publico.ts");
  const motivos = [];
  const nivel = isPublicable(perfilBase);
  if (nivel !== "comercial") {
    motivos.push(`puerta editorial: nivel "${nivel}" (motivos: ${motivosBloqueo(perfilBase).join("; ")})`);
  }
  if (DOMINIO_APROBADO == null || DOMINIO_APROBADO === "") {
    motivos.push("dominio sin aprobar (DOMINIO_APROBADO = null, pendiente OT-15/OT-16)");
  }
  if (perfilBase.contacto?.estado !== "aprobado" || perfilBase.contacto?.verificado !== true) {
    motivos.push("contacto sin aprobación verificada (pendiente OT-15)");
  }
  return { aprobada: motivos.length === 0, motivos };
}

/**
 * Re-ejecuta los presupuestos de OT-11 (`medir.mjs`) sobre un directorio
 * servible. Devuelve `{ filas, cumple }`. Un exceso bloquea (FALLA).
 */
export function reejecutarPresupuestos(dir) {
  const med = medirDist(dir);
  const filas = evaluarPresupuestos(med);
  return { metodo: metodoMedicion(), filas, cumple: filas.every((f) => f.cumple) };
}

/**
 * Evalúa un árbol contra las cuotas Free (OT-Q053). Función pura sobre
 * `[{ ruta, bytes }]` para poder probarse con fixtures sintéticos.
 * Superar una cuota limita la función y se informa; no activa pagos.
 */
export function evaluarCuotas(archivos) {
  const revisiones = [
    {
      regla: "activos por versión",
      valor: archivos.length,
      limite: CUOTAS_FREE.assetsPorVersion,
      cumple: archivos.length <= CUOTAS_FREE.assetsPorVersion,
    },
  ];
  let maxFichero = { ruta: "(vacío)", bytes: 0 };
  for (const a of archivos) {
    if (a.bytes > maxFichero.bytes) maxFichero = a;
    revisiones.push({
      regla: `tamaño de ${a.ruta}`,
      valor: a.bytes,
      limite: CUOTAS_FREE.bytesPorArchivo,
      cumple: a.bytes <= CUOTAS_FREE.bytesPorArchivo,
    });
  }
  const pasa = revisiones.every((r) => r.cumple);
  return {
    pasa,
    revisiones,
    resumen: pasa
      ? `${archivos.length} activos, mayor fichero ${maxFichero.ruta} (${maxFichero.bytes} B): dentro de cuotas Free`
      : `cuota Free superada: la función queda limitada y se informa; sin pagos automáticos`,
  };
}

/**
 * Analizador mínimo de CLI: `--clave valor` o `--clave=valor`; `--forzar`
 * como booleano. Rechaza claves desconocidas (exit 2 en cada script).
 */
export function parseArgs(argv, permitidas, booleanas = []) {
  const valores = {};
  const errores = [];
  for (const crudo of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(crudo);
    if (!m) {
      errores.push(`argumento no reconocido: ${crudo}`);
      continue;
    }
    const [, clave, conIgual] = m;
    if (!permitidas.includes(clave)) {
      errores.push(`opción desconocida: --${clave}`);
      continue;
    }
    if (booleanas.includes(clave)) {
      valores[clave] = true;
      continue;
    }
    if (conIgual !== undefined) valores[clave] = conIgual;
    else {
      const i = argv.indexOf(crudo);
      const siguiente = argv[i + 1];
      if (siguiente === undefined || siguiente.startsWith("--")) {
        errores.push(`--${clave} exige valor`);
      } else {
        valores[clave] = siguiente;
        argv.splice(i + 1, 1);
      }
    }
  }
  return { valores, errores };
}

/** Falla con mensaje y código (1 = FALLA de validación, 2 = uso). */
export function fallar(mensaje, codigo = 1) {
  console.error(`FALLA ${mensaje}`);
  process.exit(codigo);
}
