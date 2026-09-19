/**
 * OT-04 — Pruebas de composición editorial (OT-Q010, OT-Q011, OT-Q012, OT-Q023).
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 *
 * OT-Q010: wireframes completos + ficha propia, sin clonar Puerta Abierta.
 * OT-Q011: skip honesto — binarios tipográficos pendientes (fonts.css sin
 *   cablear); solo se verifica la guarda (nada presenta el fallback como
 *   tipografía aprobada).
 * OT-Q012: skip honesto — la comparación visual completa requiere capturas
 *   inspeccionadas por humano/operador; aquí solo consta la comparación
 *   conceptual registrada.
 * OT-Q023 (aplicable a OT-04): el bebedero se contiene en su composición
 *   (regla CSS vigente aun sin fotos) y el prototipo publica cero <img>.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_CSS = join(RAIZ, "src", "styles", "base.css");
const FONTS_CSS = join(RAIZ, "src", "styles", "fonts.css");
const INDEX = join(RAIZ, "src", "pages", "index.astro");
const DOC = join(RAIZ, "..", "..", "docs", "implementacion", "OT-04", "DISENO.md");
const COMPARACION = join(
  RAIZ,
  "..",
  "..",
  "docs",
  "implementacion",
  "OT-04",
  "fonts",
  "COMPARACION.md",
);

const css = readFileSync(BASE_CSS, "utf-8");
const index = readFileSync(INDEX, "utf-8");

function seccionesEnOrden() {
  const ids = ["portafolio", "fincas", "manejo", "infraestructura", "cierre"];
  const pos = ids.map((id) => index.indexOf(`id="${id}"`));
  for (const [i, p] of pos.entries()) {
    assert.ok(p >= 0, `sección #${ids[i]} presente`);
    if (i > 0) assert.ok(p > pos[i - 1], `#${ids[i]} tras #${ids[i - 1]}`);
  }
}

/* OT-Q010 — Wireframes completos y ficha propia, sin clonar PA. */
describe("OT-Q010 composición editorial propia", () => {
  it("documento wireframe con viewports 320/768/1280 y estados", () => {
    assert.ok(existsSync(DOC), "docs/implementacion/OT-04/DISENO.md existe");
    const doc = readFileSync(DOC, "utf-8");
    for (const v of ["320", "768", "1280"]) {
      assert.ok(doc.includes(v), `viewport ${v} descrito`);
    }
    for (const e of ["teclado", "no-JS", "contraste", "reflow"]) {
      assert.ok(
        doc.toLowerCase().includes(e.toLowerCase()),
        `estado ${e} descrito`,
      );
    }
    assert.ok(/implementaci/i.test(doc), "correspondencia wireframe↔implementación");
  });

  it("prototipo con estructura completa: masthead, índice, hero y capítulos en orden", () => {
    assert.ok(/class="masthead"/.test(index), "masthead propio");
    assert.ok(/aria-label="Índice editorial"/.test(index), "índice editorial");
    for (const destino of ["#portafolio", "#fincas", "#manejo", "#infraestructura", "#cierre"]) {
      assert.ok(index.includes(`href="${destino}"`), `destino ${destino}`);
    }
    assert.ok(/class="hero"/.test(index), "hero tipográfico");
    assert.ok(/<h1[^>]*>/.test(index), "un H1");
    seccionesEnOrden();
  });

  it("ficha propia: tokens reservados y retícula editorial, sin material de PA", () => {
    for (const token of ["#ede6d2", "#1f3327", "#7a3b24", "#e3d8bb", "#16241b"]) {
      assert.ok(css.toLowerCase().includes(token), `token ${token}`);
    }
    assert.ok(css.includes("--ot-contenedor: 70rem"), "contenedor 1120 px");
    assert.ok(!/position:\s*sticky/.test(css), "masthead no sticky");
    assert.ok(!/puerta-abierta|puerta_abierta|manrope|source sans/i.test(css + index));
    assert.ok(
      !/(?:import\s+["']|from\s+["']|<link[^>]*href=["']|@import\s+["'])[^"']*fonts\.css/.test(index),
      "fonts.css sin cablear en el prototipo (sin import ni link)",
    );
  });

  it("negativos: cero fotos, cero scripts, cero canvas/CAPTCHA, cero contacto/preparador", () => {
    assert.ok(!/<img[\s>]/i.test(index), "sin <img>");
    assert.ok(!/<script[\s>]/i.test(index), "sin scripts");
    assert.ok(!/<canvas[\s>]/i.test(index), "sin canvas");
    assert.ok(!/captcha/i.test(index), "sin CAPTCHA");
    assert.ok(!/mailto:|tel:|type="email"|<form/i.test(index), "sin módulo de contacto");
    assert.ok(!/preparador/i.test(index + css) || /no.*preparador|sin.*preparador|pertenecen a OT-07/i.test(index),
      "preparador ausente como función (solo mención de exclusión OT-07)");
    const pendientes = index.match(/data-estado="pendienteAP"/g) || [];
    assert.ok(pendientes.length >= 4, `bloques deshabilitados pendienteAP (${pendientes.length})`);
    assert.ok(/FIXTURE, no publicable/.test(index), "etiqueta fixture visible");
  });
});

/* OT-Q011 — Tipografía: skip honesto (binarios pendientes). */
describe("OT-Q011 tipografía autorizada y realmente cargada", () => {
  it("guarda: el stack de trabajo no se anuncia como tipografía aprobada", () => {
    assert.ok(
      !/(?:import\s+["']|from\s+["']|<link[^>]*href=["']|@import\s+["'])[^"']*fonts\.css/.test(index),
      "prototipo sin cableado a fonts.css",
    );
    const fonts = readFileSync(FONTS_CSS, "utf-8");
    assert.match(fonts, /NO se importa/, "fonts.css declara su no-cableado");
    assert.ok(/no.*aprobada/i.test(css), "base.css advierte stack no aprobado");
  });

  it("binarios .woff2 cargados realmente", {
    skip: "pendiente operador: binarios .woff2 + licencias (OT-03/OT-15); fonts.css sin cablear a propósito",
  }, () => {
    // Requiere originales del operador y cableado posterior; no ejecutable aquí.
  });
});

/* OT-Q012 — Comparación visual completa: skip honesto (operador). */
describe("OT-Q012 comparación visual frente a Puerta Abierta", () => {
  it("comparación conceptual registrada sin copiar otra marca", () => {
    assert.ok(existsSync(COMPARACION), "comparación conceptual registrada");
    const texto = readFileSync(COMPARACION, "utf-8");
    assert.ok(/sin capturas nuevas/i.test(texto), "consta que no se generaron capturas");
    assert.ok(/pendiente.*operador|operador.*pendiente/i.test(texto));
  });

  it("comparación visual con capturas inspeccionadas (color + gris sin logos)", {
    skip: "tarea de operador: requiere capturas aprobadas de PA y revisión humana con capacidad real de visión (OT-14); un DOM no equivale a visión",
  }, () => {
    // Ver CHECKLIST_VISUAL V-15/V-17: capturas completas examinadas realmente.
  });
});

/* OT-Q023 aplicable — Bebedero contenido en su composición. */
describe("OT-Q023 bebedero contenido (aplicable a OT-04)", () => {
  it("regla de contención vigente en la ficha (máx. 560 px, columna de detalle)", () => {
    assert.ok(/\.detalle-vertical/.test(css), "clase de contención");
    assert.ok(/max-height:\s*35rem/.test(css), "alto máximo ~560 px");
    assert.ok(/max-width:\s*22rem/.test(css), "columna de detalle, nunca todo el ancho");
  });

  it("el prototipo no amplía ni publica el bebedero: cero <img>, figura contenida y pendiente", () => {
    assert.ok(!/<img[\s>]/i.test(index), "ninguna foto que ampliar");
    assert.ok(/detalle-vertical/.test(index), "figura del bebedero usa la contención");
    assert.ok(/id="bebederos"/.test(index), "subapartado con ancla propia");
  });
});
