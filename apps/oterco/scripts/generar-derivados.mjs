#!/usr/bin/env node
/**
 * OT-03 — Generador de derivados responsive (utilidad de preparación, no web).
 *
 * Lee la carpeta privada que produce `extraer.py` (09_FUENTES/EXTRACCION_LOCAL.md):
 *   original-01.jpg … original-06.jpg + inventory.json
 * Verifica cada SHA-256 contra la huella documental de
 * 09_FUENTES/INVENTARIO_RECURSOS.md (espejo en HUELLAS_DOCUMENTALES; la fuente
 * canónica en repo es `src/assets/resources.ts`), valida magia JPEG y
 * dimensiones, retira segmentos APPn/COM (EXIF y metadatos innecesarios) con
 * parser propio sin dependencias, y emite derivados + manifiesto con
 * srcset/sizes, crop, destino, alt pendiente y permiso `pendiente`.
 *
 * - Sin carpeta de originales (o sin inventory.json): exit 2, "originales
 *   ausentes — operador encargado". NUNCA falla el build (este script no corre
 *   en `astro build`).
 * - Huella, formato o destino inválido: exit 1, sin escribir nada. En
 *   particular, `--dest` bajo `public/` (o `apps/oterco/public/`) se rechaza
 *   con exit 1 antes de crear directorios.
 * - Éxito: exit 0 tras verificar 6/6 huellas y dejar base EXIF-strip +
 *   manifiesto. El reescalado a anchos responsive requiere herramienta del
 *   operador (p. ej. sharp); el manifiesto deja el plan de anchos topado a la
 *   resolución natural (sin simular calidad) como trabajo pendiente, sin
 *   código de salida adicional. Solo existen los exits 0/1/2.
 *
 * Uso:
 *   node scripts/generar-derivados.mjs <carpeta-privada> [--dest <dir>]
 *
 * No se ejecuta sin originales (bloqueo OT-03 registrado en evidencia).
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

/** Espejo documental de 09_FUENTES/INVENTARIO_RECURSOS.md (ver resources.ts). */
const HUELLAS_DOCUMENTALES = [
  { sourceId: "O-IMG01", archivo: "original-01.jpg", bytes: 90263, width: 603, height: 423,
    sha256: "dd4904ea9ee89b668ea546d93584a91ab89e6ca5015837d1b432c18dd43cb260" },
  { sourceId: "O-IMG02", archivo: "original-02.jpg", bytes: 224442, width: 1100, height: 733,
    sha256: "21df0731f84e2fef366a38c701f1eec42c24dcf99be6cce50b03158df1b2425c" },
  { sourceId: "O-IMG03", archivo: "original-03.jpg", bytes: 164798, width: 1100, height: 733,
    sha256: "113fd2b8ddadccc7b239b5c9aecee294cb2371c93bfbc42bf6844d6b6a770a07" },
  { sourceId: "O-IMG04", archivo: "original-04.jpg", bytes: 94924, width: 485, height: 650,
    sha256: "0ce8ddf915d1b780ffca46cdc085099e09e451ce808d3c320719f44650074bb0" },
  { sourceId: "O-IMG05", archivo: "original-05.jpg", bytes: 245580, width: 1208, height: 605,
    sha256: "a8c7809d434e6cddbc1dd594ee9af4a42fd8f7d76f41620fccde635f2c56c1f5" },
  { sourceId: "O-IMG06", archivo: "original-06.jpg", bytes: 190592, width: 986, height: 638,
    sha256: "6fb920ddf7c3bc1d77958ade202e84b58fe045bd4db6886b7706daddf696f0d8" },
];

const ANCHOS_CANDIDATOS = [480, 768, 1024, 1208];

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

/** Dimensiones JPEG vía marcadores SOF (sin dependencias). Null si no es JPEG válido. */
function dimensionesJPEG(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) return null;
  let i = 2;
  while (i + 8 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marcador = buf[i + 1];
    if (marcador === 0xd8 || marcador === 0xd9) { i += 2; continue; }
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd7)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > buf.length) return null;
    if (
      (marcador >= 0xc0 && marcador <= 0xcf && marcador !== 0xc4 && marcador !== 0xc8 && marcador !== 0xcc)
    ) {
      return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    }
    if (marcador === 0xda) break; // SOS: empiezan los datos comprimidos
    i += 2 + len;
  }
  return null;
}

/** Retira segmentos APPn (0xE0–0xEF, incl. EXIF APP1) y COM (0xFE). Conserva el resto intacto. */
function retirarMetadatos(buf) {
  const salida = [buf.subarray(0, 2)];
  let i = 2;
  let retirados = 0;
  while (i + 3 < buf.length) {
    if (buf[i] !== 0xff) break;
    const marcador = buf[i + 1];
    if (marcador === 0xd8 || marcador === 0xd9) { salida.push(buf.subarray(i, i + 2)); i += 2; continue; }
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd7)) {
      salida.push(buf.subarray(i, i + 2)); i += 2; continue;
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > buf.length) break;
    const esMetadato =
      (marcador >= 0xe0 && marcador <= 0xef) || marcador === 0xfe;
    if (esMetadato) {
      retirados += 1;
    } else {
      salida.push(buf.subarray(i, i + 2 + len));
    }
    i += 2 + len;
    if (marcador === 0xda) {
      salida.push(buf.subarray(i)); // resto del stream + EOI, intacto
      break;
    }
  }
  return { limpio: Buffer.concat(salida), segmentosRetirados: retirados };
}

function planAnchos(naturalWidth) {
  const anchos = ANCHOS_CANDIDATOS.filter((w) => w < naturalWidth);
  anchos.push(naturalWidth);
  return [...new Set(anchos)].sort((a, b) => a - b);
}

function main() {
  const args = process.argv.slice(2);
  const carpeta = args[0];
  const destIdx = args.indexOf("--dest");
  const destino = resolve(destIdx >= 0 && args[destIdx + 1] ? args[destIdx + 1] : "src/assets/derivados");

  if (!carpeta || !existsSync(resolve(carpeta))) {
    console.error(
      "originales ausentes — operador encargado: aporte la carpeta privada " +
        "de `extraer.py` (original-01…06.jpg + inventory.json) y reintente.",
    );
    process.exit(2);
  }
  const dir = resolve(carpeta);
  if (/[/\\]public[/\\]?$/.test(dir) || dir.includes(`${resolve(".")}/public`)) {
    console.error("Destino/Origen inválido: nunca operar dentro de public/.");
    process.exit(1);
  }
  if (esBajoPublic(destino)) {
    console.error(
      "Destino inválido (--dest): nunca escribir bajo public/ ni " +
        "apps/oterco/public/; use src/assets/derivados/.",
    );
    process.exit(1);
  }

  const inventarioPath = join(dir, "inventory.json");
  if (!existsSync(inventarioPath)) {
    console.error("originales ausentes — operador encargado: falta inventory.json de extraer.py.");
    process.exit(2);
  }
  let inventario;
  try {
    inventario = JSON.parse(readFileSync(inventarioPath, "utf-8"));
  } catch {
    console.error("inventory.json ilegible; revisión manual del operador.");
    process.exit(1);
  }
  if (!Array.isArray(inventario) || inventario.length !== 6) {
    console.error("Cantidad inesperada en inventory.json: inspeccionar original antes de continuar.");
    process.exit(1);
  }

  const errores = [];
  const registros = [];
  for (const esperado of HUELLAS_DOCUMENTALES) {
    const ruta = join(dir, esperado.archivo);
    if (!existsSync(ruta)) {
      errores.push(`${esperado.archivo}: ausente.`);
      continue;
    }
    const buf = readFileSync(ruta);
    const huella = sha256(buf);
    if (huella !== esperado.sha256) {
      errores.push(
        `${esperado.archivo}: SHA-256 ${huella} ≠ huella documental ${esperado.sha256}; no habilitar.`,
      );
      continue;
    }
    if (buf.length !== esperado.bytes) {
      errores.push(`${esperado.archivo}: ${buf.length} bytes ≠ ${esperado.bytes} documentados.`);
      continue;
    }
    const dims = dimensionesJPEG(buf);
    if (!dims || dims.width !== esperado.width || dims.height !== esperado.height) {
      errores.push(
        `${esperado.archivo}: dimensiones ${dims ? `${dims.width}×${dims.height}` : "ilegibles"} ≠ ${esperado.width}×${esperado.height} documentadas.`,
      );
      continue;
    }
    const entradaInventario = inventario.find((e) => e.file === esperado.archivo);
    if (!entradaInventario || sha256HexInvalido(entradaInventario, esperado)) {
      errores.push(`${esperado.archivo}: inventory.json no coincide con la huella documental.`);
      continue;
    }
    registros.push({ esperado, buf });
  }
  if (errores.length > 0) {
    for (const e of errores) console.error(`ERROR ${e}`);
    process.exit(1);
  }

  mkdirSync(destino, { recursive: true });
  const manifiesto = [];
  for (const { esperado, buf } of registros) {
    const { limpio, segmentosRetirados } = retirarMetadatos(buf);
    const base = esperado.sourceId.toLowerCase();
    const nombreBase = `${base}-base.jpg`;
    writeFileSync(join(destino, nombreBase), limpio);
    const anchos = planAnchos(esperado.width);
    manifiesto.push({
      sourceId: esperado.sourceId,
      sha256Original: esperado.sha256,
      baseExifStrip: `src/assets/derivados/${nombreBase}`,
      hashBase: sha256(limpio),
      bytesBase: limpio.length,
      segmentosMetadatosRetirados: segmentosRetirados,
      formato: "jpeg",
      widthNatural: esperado.width,
      heightNatural: esperado.height,
      planAnchosResponsive: anchos,
      srcsetPlan: anchos.map((w) => `src/assets/derivados/${base}-${w}.webp ${w}w`).join(", "),
      sizesSugerido: "(max-width: 48rem) 100vw, 48rem",
      crop: esperado.sourceId === "O-IMG04" ? "contenido" : "ninguno",
      altRevisado: null,
      estadoPermiso: "pendiente",
      reescaladoPendiente:
        "Requiere herramienta del operador (p. ej. sharp) para emitir los anchos del plan en webp/avif; sin simular calidad.",
      fechaDerivacion: new Date().toISOString().slice(0, 10),
    });
  }
  writeFileSync(
    join(destino, "derivados-manifiesto.json"),
    JSON.stringify(manifiesto, null, 2),
    "utf-8",
  );
  console.log(
    `Verificadas 6/6 huellas; base EXIF-strip + manifiesto en ${destino}. ` +
      "Reescalado responsive pendiente del operador; nada aprobado para publicación.",
  );
}

function esBajoPublic(rutaAbsoluta) {
  const partes = rutaAbsoluta.split(/[/\\]+/);
  return partes.includes("public");
}

function sha256HexInvalido(entrada, esperado) {
  return (
    typeof entrada.sha256 !== "string" ||
    entrada.sha256 !== esperado.sha256 ||
    entrada.bytes !== esperado.bytes
  );
}

main();
