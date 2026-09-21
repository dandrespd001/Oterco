/**
 * OT-12 — Promoción LOCAL de un candidato, sin recompilar (OT-Q044/Q047).
 *
 * Copia los bytes del candidato a `releases/promocion/<id>/`, valida que el
 * hash del árbol promovido iguala al del manifiesto (sin rebuild) y ejecuta
 * un humo local con servidor efímero: `/` → 200 e inexistente → 404 real.
 *
 * LOCAL y sin publicación: no sube a ningún destino, no toca DNS ni cuentas.
 * La promoción remota real (publish/rollback) es OT-16/17 con operador.
 * `_headers` viaja como fichero; su aplicación efectiva por destino se
 * comprueba en OT-16, no aquí (diferencias permitidas por destino).
 *
 * Exit 0 = OK, 1 = FALLA, 2 = uso.
 *
 * Uso:
 *   node scripts/release/promocionar.mjs --candidato <id>
 *     [--releases-dir <dir>] [--dest-dir <dir>] [--forzar]
 */

import http from "node:http";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import {
  RAIZ_APP,
  fallar,
  hashArbol,
  huellasDirectorio,
  parseArgs,
  totalBytes,
} from "./lib.mjs";

const { valores, errores } = parseArgs(process.argv.slice(2),
  ["candidato", "releases-dir", "dest-dir", "forzar"], ["forzar"]);
if (errores.length > 0) {
  for (const e of errores) console.error(`FALLA uso: ${e}`);
  process.exit(2);
}
if (!valores["candidato"]) {
  console.error("FALLA uso: falta --candidato <id>");
  process.exit(2);
}

const dirReleases = resolve(valores["releases-dir"] ?? join(RAIZ_APP, "releases"));
const id = basename(valores["candidato"], ".json");
const rutaManifiesto = join(dirReleases, `${id}.json`);
const dirCandidato = join(dirReleases, id);
const dirDestino = resolve(valores["dest-dir"] ?? join(dirReleases, "promocion", id));
const forzar = valores["forzar"] === true;

if (!existsSync(rutaManifiesto)) fallar(`manifiesto ausente: ${rutaManifiesto}`);
if (!existsSync(dirCandidato)) fallar(`carpeta del candidato ausente: ${dirCandidato}`);
if (!forzar && existsSync(dirDestino)) {
  fallar(`destino ya promovido: ${dirDestino} (usar --forzar para repetir)`);
}

const manifiesto = JSON.parse(readFileSync(rutaManifiesto, "utf-8"));
const huellasOrigen = huellasDirectorio(dirCandidato);
if (hashArbol(huellasOrigen) !== manifiesto.arbolHash) {
  fallar("el candidato cambió desde su manifiesto: no se promociona un árbol alterado");
}
console.log(`PASA candidato íntegro: ${huellasOrigen.length} ficheros, árbol ${manifiesto.arbolHash}`);

mkdirSync(dirname(dirDestino), { recursive: true });
mkdirSync(dirDestino, { recursive: true });
cpSync(dirCandidato, dirDestino, { recursive: true });

const huellasDestino = huellasDirectorio(dirDestino);
const arbolDestino = hashArbol(huellasDestino);
if (arbolDestino !== manifiesto.arbolHash) {
  fallar(`promoción corrupta: árbol ${arbolDestino} ≠ manifiesto ${manifiesto.arbolHash}`);
}
console.log(`PASA promoción sin recompilar: bytes idénticos (${totalBytes(huellasDestino)} B, árbol ${arbolDestino})`);

const NOTFOUND = join(dirDestino, "404.html");
const TIPOS = {
  ".html": "text/html",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".css": "text/css",
};
const servidor = http.createServer((req, res) => {
  const ruta = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const servir = (rutaFs, estado) => {
    const cuerpo = readFileSync(rutaFs);
    const ext = rutaFs.slice(rutaFs.lastIndexOf("."));
    res.writeHead(estado, { "content-type": `${TIPOS[ext] ?? "application/octet-stream"}; charset=utf-8` });
    res.end(cuerpo);
  };
  if (ruta === "/" || ruta === "/index.html") return servir(join(dirDestino, "index.html"), 200);
  if (ruta === "/privacidad" || ruta === "/privacidad/") {
    return servir(join(dirDestino, "privacidad", "index.html"), 200);
  }
  const candidatoFs = join(dirDestino, ruta.replace(/^\/+/, ""));
  if (existsSync(candidatoFs) && !ruta.endsWith("/")) {
    try {
      if (readFileSync(candidatoFs).length >= 0) return servir(candidatoFs, 200);
    } catch {
      /* cae al 404 */
    }
  }
  return servir(NOTFOUND, 404);
});

function pedir(puerto, ruta) {
  return new Promise((resuelve, rechaza) => {
    http
      .get({ host: "127.0.0.1", port: puerto, path: ruta }, (res) => {
        let cuerpo = "";
        res.on("data", (c) => (cuerpo += c));
        res.on("end", () => resuelve({ estado: res.statusCode, cuerpo }));
      })
      .on("error", rechaza);
  });
}

await new Promise((listo) => servidor.listen(0, "127.0.0.1", listo));
const humo = {};
try {
  const puerto = servidor.address().port;
  const raiz = await pedir(puerto, "/");
  humo.raiz200 = raiz.estado === 200 && raiz.cuerpo.includes("<h1");
  console.log(`${humo.raiz200 ? "PASA" : "FALLA"} humo: / → ${raiz.estado}`);
  const perdida = await pedir(puerto, "/ruta-inexistente-ot12-xyz");
  humo.noExiste404 = perdida.estado === 404 && perdida.cuerpo.includes("Página no encontrada (404)");
  console.log(`${humo.noExiste404 ? "PASA" : "FALLA"} humo: inexistente → ${perdida.estado}`);
} finally {
  await new Promise((listo) => servidor.close(listo));
}

if (!humo.raiz200 || !humo.noExiste404) {
  fallar("humo local de promoción: códigos o cuerpos inesperados");
}

const registro = {
  tipo: "oterco-promocion-local/1",
  id,
  siteId: manifiesto.siteId,
  proposito: manifiesto.proposito,
  arbolHash: arbolDestino,
  totalBytes: totalBytes(huellasDestino),
  fecha: new Date().toISOString(),
  humo,
  ambito: "LOCAL: servidor efímero 127.0.0.1; sin destino remoto, sin DNS (remoto = OT-16/17)",
  notaHeaders: "_headers viaja como fichero; su aplicación efectiva por destino se verifica en OT-16",
};
writeFileSync(join(dirname(dirDestino), `${id}.json`), JSON.stringify(registro, null, 2) + "\n", "utf-8");

console.log(`PROMOCIÓN LOCAL OK ${id} → ${dirDestino} (sin recompilar, sin publicar)`);
