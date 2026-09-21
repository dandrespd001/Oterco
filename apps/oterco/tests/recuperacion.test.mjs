/**
 * OT-13 — Prueba local de recuperación del artefacto (OT-Q047).
 *
 * Simulación local con fixture temporal (base preferente `/tmp/opencode`,
 * con repliegue a `os.tmpdir()`): copia `dist`→copia, corrompe un byte, la
 * copia difiere al verificar; restauración (re-copia desde la fuente del
 * candidato con `candidato.mjs --forzar`) → `verificar` PASA; humo 200/404
 * mediante `promocionar.mjs` con `--dest-dir` temporal.
 *
 * Nunca toca `dist/` ni `releases/` reales: todo vive en el fixture.
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 * Requiere `pnpm build` previo (dist presente); si falta, falla explícito.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST_REAL = join(RAIZ, "dist");
const CANDIDATO = join(RAIZ, "scripts", "release", "candidato.mjs");
const VERIFICAR = join(RAIZ, "scripts", "release", "verificar.mjs");
const PROMOCIONAR = join(RAIZ, "scripts", "release", "promocionar.mjs");

before(() => {
  assert.ok(existsSync(join(DIST_REAL, "index.html")), "dist/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");
});

/** Base temporal: /tmp/opencode (aprobado) con repliegue a os.tmpdir(). */
function baseTemporal() {
  try {
    mkdirSync("/tmp/opencode", { recursive: true });
    return mkdtempSync("/tmp/opencode/ot13-");
  } catch {
    return mkdtempSync(join(tmpdir(), "ot13-"));
  }
}

function correr(script, args) {
  const r = spawnSync("node", [script, ...args], { cwd: RAIZ, encoding: "utf-8" });
  return { exit: r.status, salida: `${r.stdout ?? ""}\n${r.stderr ?? ""}` };
}

/** Fixture aislado: copia del dist real (fuente) + releases temporal propio. */
function fixtureAislado() {
  const base = baseTemporal();
  const fuente = join(base, "dist-fuente");
  const releases = join(base, "releases");
  mkdirSync(releases, { recursive: true });
  cpSync(DIST_REAL, fuente, { recursive: true });
  return { base, fuente, releases };
}

function idCandidatoEsperado() {
  return `candidato-${execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: RAIZ, encoding: "utf-8" }).trim()}`;
}

/** Corrompe exactamente un byte de un fichero (xor del byte 100, o del último si es corto). */
function corromperUnByte(ruta) {
  const buf = readFileSync(ruta);
  assert.ok(buf.length > 0, `fichero no vacío para corromper: ${ruta}`);
  const pos = Math.min(100, buf.length - 1);
  const copia = Buffer.from(buf);
  copia[pos] = copia[pos] ^ 0x01;
  writeFileSync(ruta, copia);
}

describe("OT-13 recuperación local del artefacto (OT-Q047)", () => {
  it("la copia con un byte corrompido difiere al verificar (FALLA)", () => {
    const f = fixtureAislado();
    const creado = correr(CANDIDATO, ["--dist", f.fuente, "--releases-dir", f.releases]);
    assert.equal(creado.exit, 0, `candidato válido esperado:\n${creado.salida}`);
    const id = idCandidatoEsperado();
    const copiaIndex = join(f.releases, id, "index.html");
    assert.ok(existsSync(copiaIndex), "la copia del candidato incluye index.html");
    corromperUnByte(copiaIndex);
    const v = correr(VERIFICAR, ["--candidato", id, "--releases-dir", f.releases]);
    assert.equal(v.exit, 1, `verificar debe FALLAR sobre la copia corrompida:\n${v.salida}`);
    assert.match(v.salida, /FALLA/, "la salida marca FALLA");
    assert.match(v.salida, /alterado|árbol|arbol/i, "la salida identifica alteración o árbol distinto");
    assert.match(v.salida, /RESULTADO: FALLA/, "resultado final FALLA");
  });

  it("la restauración (re-copia desde la fuente) devuelve verificar a PASA", () => {
    const f = fixtureAislado();
    const creado = correr(CANDIDATO, ["--dist", f.fuente, "--releases-dir", f.releases]);
    assert.equal(creado.exit, 0, `candidato válido esperado:\n${creado.salida}`);
    const id = idCandidatoEsperado();
    corromperUnByte(join(f.releases, id, "index.html"));
    const antes = correr(VERIFICAR, ["--candidato", id, "--releases-dir", f.releases]);
    assert.equal(antes.exit, 1, "precondición: la copia corrompida falla");
    // Restauración reproducible: regenerar el candidato desde la fuente intacta.
    const restaurado = correr(CANDIDATO, ["--dist", f.fuente, "--releases-dir", f.releases, "--forzar"]);
    assert.equal(restaurado.exit, 0, `restauración (re-copia) esperada:\n${restaurado.salida}`);
    const despues = correr(VERIFICAR, ["--candidato", id, "--releases-dir", f.releases]);
    assert.equal(despues.exit, 0, `verificar debe PASAR tras restaurar:\n${despues.salida}`);
    assert.match(despues.salida, /RESULTADO: PASA/, "resultado final PASA");
  });

  it("la copia restaurada sirve humo local 200/404 (promoción temporal)", () => {
    const f = fixtureAislado();
    const creado = correr(CANDIDATO, ["--dist", f.fuente, "--releases-dir", f.releases]);
    assert.equal(creado.exit, 0, `candidato válido esperado:\n${creado.salida}`);
    const id = idCandidatoEsperado();
    const destino = join(f.base, "promocion", id);
    const p = correr(PROMOCIONAR, ["--candidato", id, "--releases-dir", f.releases, "--dest-dir", destino]);
    assert.equal(p.exit, 0, `promoción temporal esperada:\n${p.salida}`);
    assert.match(p.salida, /humo: \/ → 200/, "humo: raíz 200");
    assert.match(p.salida, /inexistente → 404/, "humo: inexistente 404");
    assert.match(p.salida, /PROMOCIÓN LOCAL OK/, "promoción local confirmada");
    assert.ok(existsSync(join(destino, "index.html")), "la promoción temporal incluye index.html");
  });
});
