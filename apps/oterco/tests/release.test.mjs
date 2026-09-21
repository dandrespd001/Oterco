/**
 * OT-12 — Pipeline y candidato independiente (OT-Q044/Q045/Q046/Q049/Q053).
 *
 * Perturbaciones sobre fixtures en tmp (nunca sobre el dist real ni sobre
 * `releases/` del repo): candidato válido, rechazos (byte alterado, siteId
 * ajeno, marca PA, propósito indebido, comercial sin aprobaciones, dist
 * ausente), verificación PASA/FALLA, promoción local sin recompilar con
 * humo 200/404, árbol recalculable y cuotas Q053 sintéticas.
 *
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 * Los scripts bajo prueba son `scripts/release/*.mjs` (node sin deps).
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MARCA_PENDIENTE_AP,
  SITE_ID,
  evaluarCuotas,
  hashArbol,
  huellasDirectorio,
} from "../scripts/release/lib.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST_REAL = join(RAIZ, "dist");
const CANDIDATO = join(RAIZ, "scripts", "release", "candidato.mjs");
const VERIFICAR = join(RAIZ, "scripts", "release", "verificar.mjs");
const PROMOCIONAR = join(RAIZ, "scripts", "release", "promocionar.mjs");

before(() => {
  assert.ok(existsSync(join(DIST_REAL, "index.html")), "dist/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");
});

function correr(script, args) {
  const r = spawnSync("node", [script, ...args], { cwd: RAIZ, encoding: "utf-8" });
  return { exit: r.status, salida: `${r.stdout ?? ""}\n${r.stderr ?? ""}` };
}

/** Fixture aislado: copia del dist real + releases temporal propio. */
function fixtureAislado() {
  const base = mkdtempSync(join(tmpdir(), "ot12-"));
  const fixture = join(base, "dist-fixture");
  const releases = join(base, "releases");
  mkdirSync(releases, { recursive: true });
  cpSync(DIST_REAL, fixture, { recursive: true });
  return { base, fixture, releases };
}

/** Crea un candidato técnico válido en un fixture aislado. */
function candidatoValido(extraArgs = []) {
  const f = fixtureAislado();
  const r = correr(CANDIDATO, ["--dist", f.fixture, "--releases-dir", f.releases, ...extraArgs]);
  assert.equal(r.exit, 0, `candidato válido esperado:\n${r.salida}`);
  const corto = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: RAIZ, encoding: "utf-8" }).trim();
  const id = `candidato-${corto}`;
  const manifiesto = join(f.releases, `${id}.json`);
  assert.ok(existsSync(manifiesto), "manifiesto del candidato existe");
  return { ...f, id, manifiesto, resultado: r };
}

const leerManifiesto = (ruta) => JSON.parse(readFileSync(ruta, "utf-8"));

/* OT-Q044 — Una sola cadena: commit, huellas, sin recompilar al promover. */
describe("OT-Q044 candidato técnico válido y manifiesto completo", () => {
  it("crea copia + manifiesto con siteId, propósito, commit, versiones y hashes", () => {
    const { id, manifiesto, releases, resultado } = candidatoValido();
    const m = leerManifiesto(manifiesto);
    assert.equal(m.id, id);
    assert.equal(m.siteId, SITE_ID);
    assert.match(m.siteId, /^OTERCO-.+/);
    assert.equal(m.proposito, "candidato-tecnico");
    assert.match(m.commit.sha, /^[0-9a-f]{40}$/);
    assert.ok(m.fecha.length > 0, "fecha registrada");
    assert.ok(m.versiones?.node?.startsWith("v"), "versiones registradas");
    assert.ok(m.versiones?.astro?.length > 0, "versión Astro registrada");
    assert.equal(m.dominio, MARCA_PENDIENTE_AP);
    assert.equal(m.contacto, MARCA_PENDIENTE_AP);
    assert.ok(Array.isArray(m.archivos) && m.archivos.length > 0, "hashes por fichero");
    for (const a of m.archivos) assert.match(a.sha256, /^[0-9a-f]{64}$/, `${a.ruta}: sha256`);
    assert.match(m.arbolHash, /^[0-9a-f]{64}$/, "hash total del árbol");
    assert.equal(m.origen.copiadoSinRecompilar, true);
    assert.ok(m.presupuestos?.cumple === true, "presupuestos OT-11 medidos en origen");
    assert.ok(existsSync(join(releases, id, "index.html")), "carpeta del candidato con copia de dist");
    assert.match(resultado.salida, /CANDIDATO CREADO/);
    assert.match(resultado.salida, /no publicado/);
  });

  it("el árbol es recalculable por un tercero (Q053: verificación independiente)", () => {
    const { id, manifiesto, releases } = candidatoValido();
    const m = leerManifiesto(manifiesto);
    const recalculado = hashArbol(huellasDirectorio(join(releases, id)));
    assert.equal(recalculado, m.arbolHash, "hash de árbol recalculado == manifiesto");
  });

  it("no modifica el dist de origen", () => {
    const f = fixtureAislado();
    const antes = hashArbol(huellasDirectorio(f.fixture));
    const r = correr(CANDIDATO, ["--dist", f.fixture, "--releases-dir", f.releases]);
    assert.equal(r.exit, 0, r.salida);
    assert.equal(hashArbol(huellasDirectorio(f.fixture)), antes, "origen intacto tras generar el candidato");
  });
});

/* OT-Q045 — Rechazos: técnico/alterado/ajeno/no publicable/comercial sin aprobación. */
describe("OT-Q045 rechazos del pipeline", () => {
  it("dist ausente → rechazo", () => {
    const f = fixtureAislado();
    const r = correr(CANDIDATO, ["--dist", join(f.base, "no-existe"), "--releases-dir", f.releases]);
    assert.notEqual(r.exit, 0);
    assert.match(r.salida, /FALLA.*dist ausente/);
  });

  it("siteId ajeno (otro sitio) → rechazo", () => {
    const f = fixtureAislado();
    const r = correr(CANDIDATO, ["--dist", f.fixture, "--releases-dir", f.releases, "--site-id", "PA-puerta-abierta"]);
    assert.notEqual(r.exit, 0);
    assert.match(r.salida, /FALLA.*siteId/);
  });

  it("propósito no autorizado → rechazo", () => {
    const f = fixtureAislado();
    const r = correr(CANDIDATO, ["--dist", f.fixture, "--releases-dir", f.releases, "--proposito", "produccion-directa"]);
    assert.notEqual(r.exit, 0);
    assert.match(r.salida, /FALLA.*propósito/);
  });

  it("propósito comercial sin aprobaciones → rechazo (hoy técnico)", () => {
    const f = fixtureAislado();
    const r = correr(CANDIDATO, [
      "--dist", f.fixture, "--releases-dir", f.releases,
      "--proposito", "candidato-comercial-aprobado",
    ]);
    assert.notEqual(r.exit, 0);
    assert.match(r.salida, /FALLA.*comercial bloqueado/);
  });

  it("origen con marca de Puerta Abierta → rechazo", () => {
    const f = fixtureAislado();
    writeFileSync(join(f.fixture, "nota-ajena.html"), "<html><body>Puerta Abierta</body></html>", "utf-8");
    const r = correr(CANDIDATO, ["--dist", f.fixture, "--releases-dir", f.releases]);
    assert.notEqual(r.exit, 0);
    assert.match(r.salida, /FALLA.*origen ajeno/);
  });

  it("verificar PASA en candidato intacto", () => {
    const { id, releases } = candidatoValido();
    const r = correr(VERIFICAR, ["--candidato", id, "--releases-dir", releases]);
    assert.equal(r.exit, 0, r.salida);
    assert.match(r.salida, /RESULTADO: PASA/);
  });

  it("alterar un byte en la copia → verificar FALLA", () => {
    const { id, releases } = candidatoValido();
    appendFileSync(join(releases, id, "index.html"), "<!-- byte intruso OT-12 -->", "utf-8");
    const r = correr(VERIFICAR, ["--candidato", id, "--releases-dir", releases]);
    assert.equal(r.exit, 1, r.salida);
    assert.match(r.salida, /FALLA.*alterado/);
    assert.match(r.salida, /RESULTADO: FALLA/);
  });

  it("manifiesto comercial manipulado sin aprobaciones → verificar FALLA", () => {
    const { id, manifiesto, releases } = candidatoValido();
    const m = leerManifiesto(manifiesto);
    m.proposito = "candidato-comercial-aprobado";
    writeFileSync(manifiesto, JSON.stringify(m, null, 2), "utf-8");
    const r = correr(VERIFICAR, ["--candidato", id, "--releases-dir", releases]);
    assert.equal(r.exit, 1, r.salida);
    assert.match(r.salida, /FALLA.*comercial sin aprobaciones/);
  });
});

/* OT-Q044/Q047 — Promoción local sin recompilar + humo. */
describe("OT-Q044/Q047 promoción local sin recompilar", () => {
  it("copia bytes idénticos y humo 200/404 con servidor efímero", () => {
    const { id, manifiesto, releases } = candidatoValido();
    const m = leerManifiesto(manifiesto);
    const r = correr(PROMOCIONAR, ["--candidato", id, "--releases-dir", releases]);
    assert.equal(r.exit, 0, r.salida);
    assert.match(r.salida, /PASA promoción sin recompilar/);
    assert.match(r.salida, /humo: \/ → 200/);
    assert.match(r.salida, /humo: inexistente → 404/);
    assert.match(r.salida, /PROMOCIÓN LOCAL OK/);
    const destino = join(releases, "promocion", id);
    assert.equal(hashArbol(huellasDirectorio(destino)), m.arbolHash, "promovido == manifiesto, sin rebuild");
    const registro = join(releases, "promocion", `${id}.json`);
    assert.ok(existsSync(registro), "registro de promoción con huellas solamente");
    const reg = JSON.parse(readFileSync(registro, "utf-8"));
    assert.equal(reg.arbolHash, m.arbolHash);
    assert.equal(reg.humo.raiz200, true);
    assert.equal(reg.humo.noExiste404, true);
  });

  it("no promociona un candidato alterado", () => {
    const { id, releases } = candidatoValido();
    appendFileSync(join(releases, id, "robots.txt"), "# intruso", "utf-8");
    const r = correr(PROMOCIONAR, ["--candidato", id, "--releases-dir", releases]);
    assert.notEqual(r.exit, 0);
    assert.match(r.salida, /FALLA.*alterado/);
  });
});

/* OT-Q053 — Cuotas: el exceso limita e informa; sin pagos automáticos. */
describe("OT-Q053 cuotas Free limitan e informan", () => {
  it("árbol normal dentro de cuotas: pasa", () => {
    const q = evaluarCuotas([{ ruta: "index.html", bytes: 12275 }, { ruta: "grande.css", bytes: 6387 }]);
    assert.equal(q.pasa, true);
    assert.match(q.resumen, /dentro de cuotas/);
  });

  it("fichero sobre 25 MiB: limita, informa y no activa pagos", () => {
    const q = evaluarCuotas([{ ruta: "video.bin", bytes: 26 * 1024 * 1024 }]);
    assert.equal(q.pasa, false);
    assert.match(q.resumen, /sin pagos automáticos/);
    const rota = q.revisiones.find((r) => !r.cumple);
    assert.ok(rota && rota.limite === 25 * 1024 * 1024, "límite Free registrado, no inventado");
  });
});
