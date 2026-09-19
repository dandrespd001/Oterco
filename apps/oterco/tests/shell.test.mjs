/**
 * OT-05 — Pruebas del shell y la navegación (OT-Q013, OT-Q014, OT-Q015, OT-Q016).
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 *
 * Consumen el compilado (dist/index.html), no solo las fuentes: E2E local.
 * Requieren `pnpm build` previo; si dist falta, fallan con mensaje explícito
 * (no se simula el compilado).
 *
 * OT-Q013: la navegación funciona a 320/390 CSS px con y sin JavaScript
 *   (proxy programático: 0 scripts, <details> nativo, destinos como anclas
 *   existentes, sin nav{display:none} sin alternativa, táctil ≥44 px).
 * OT-Q014: los trece enlaces file:// se sustituyen; destinos válidos.
 * OT-Q015: main, skip-link, un H1 y jerarquía coherente.
 * OT-Q016: orden de foco y teclado sin atrapamiento ni focos ocultos.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RAIZ, "dist", "index.html");
const BASE_CSS = join(RAIZ, "src", "styles", "base.css");
const NAVEGACION = join(RAIZ, "src", "config", "navegacion.ts");
const SRC_DIR = join(RAIZ, "src");

assert.ok(existsSync(DIST), "dist/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");

const html = readFileSync(DIST, "utf-8");
const css = readFileSync(BASE_CSS, "utf-8");
const navegacion = readFileSync(NAVEGACION, "utf-8");

/** Todos los href de <a> del compilado. */
function enlacesDist() {
  const enlaces = [];
  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = m[1];
    const href = /href="([^"]*)"/i.exec(attrs)?.[1];
    const pendiente = /data-estado="pendienteAP"/.test(attrs);
    const title = /title="([^"]*)"/i.exec(attrs)?.[1] ?? "";
    enlaces.push({ href, pendiente, title });
  }
  return enlaces;
}

/** Mapa id → ocurrencias en el compilado. */
function idsDist() {
  const mapa = new Map();
  for (const m of html.matchAll(/\sid="([^"]+)"/gi)) {
    mapa.set(m[1], (mapa.get(m[1]) ?? 0) + 1);
  }
  return mapa;
}

/** Quita comentarios (HTML, bloque y línea) para no confundir documentación con elementos. */
function sinComentarios(texto, ext) {
  let limpio = texto.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  if (ext === ".astro" || ext === ".ts") {
    limpio = limpio.replace(/(^|\s)\/\/[^\n]*/g, "$1");
  }
  return limpio;
}

/** Archivos fuente .astro/.ts/.css (sin dist ni node_modules). */
function fuentes() {
  const archivos = [];
  const visita = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) visita(p);
      else if (/\.(astro|ts|css)$/.test(e.name)) archivos.push(p);
    }
  };
  visita(SRC_DIR);
  return archivos;
}

/** Contenido efectivo de una fuente (sin comentarios). */
function fuenteEfectiva(ruta) {
  const ext = ruta.endsWith(".css") ? ".css" : ruta.endsWith(".ts") ? ".ts" : ".astro";
  return sinComentarios(readFileSync(ruta, "utf-8"), ext);
}

/* OT-Q013 — Navegación a 320/390 con y sin JavaScript. */
describe("OT-Q013 navegación sin JS y en pantallas estrechas", () => {
  it("cero scripts públicos: el shell no agrega JS", () => {
    assert.ok(!/<script[\s>]/i.test(html), "dist sin <script>");
    for (const f of fuentes()) {
      assert.ok(!/<script[\s>]/i.test(fuenteEfectiva(f)), `${f} sin elemento <script>`);
    }
  });

  it("índice plegable nativo: <details><summary> con nombre accesible", () => {
    assert.ok(/<nav[^>]*aria-label="Índice editorial"/.test(html), "nav con nombre accesible");
    assert.ok(/<details>/.test(html), "<details> nativo presente");
    assert.ok(/<summary[^>]*class="indice__resumen"[^>]*>Índice<\/summary>/.test(html), "resumen Í­ndice");
  });

  it("los destinos existen como enlaces aun plegado: nunca nav{display:none} sin alternativa", () => {
    const cssEfectivo = sinComentarios(css, ".css");
    assert.ok(!/\.indice\s*\{\s*display:\s*none/.test(cssEfectivo), "el nav nunca se oculta entero");
    assert.ok(!/(^|[\s;}])nav\s*\{\s*display:\s*none/.test(cssEfectivo), "ningún nav oculto por CSS");
    // En escritorio la lista se fuerza visible con independencia de open/cerrado.
    assert.ok(/details\[open\][\s\S]*?\.indice__lista/.test(css), "lista visible en escritorio con open");
    assert.ok(/details:not\(\[open\]\)[\s\S]*?\.indice__lista/.test(css), "lista visible en escritorio sin open");
  });

  it("controles con área táctil ≥44 px (objetivo del proyecto)", () => {
    assert.ok(/\.boton\s*\{[\s\S]*?min-height:\s*44px/.test(css), "botones ≥44 px de alto");
    assert.ok(/\.indice__resumen\s*\{[\s\S]*?padding:\s*0\.75rem 0/.test(css), "resumen con área táctil (0.75rem vertical)");
  });

  it("viewport móvil y reflow: sin ancho fijo que rompa 320 px", () => {
    assert.ok(/<meta[^>]*name="viewport"[^>]*content="width=device-width, initial-scale=1"/.test(html));
    assert.ok(!/width:\s*\d{4}px/.test(css), "sin anchos fijos de miles de px");
  });
});

/* OT-Q014 — Trece file:// sustituidos; destinos válidos. */
describe("OT-Q014 sustitución de los trece enlaces file://", () => {
  it("0 href file:// en dist y en fuentes (solo el marcador file:///… documentado en navegacion.ts)", () => {
    assert.ok(!/file:\/\//i.test(html), "dist sin file://");
    assert.ok(!/href\s*=\s*["']file:/i.test(navegacion), "navegacion.ts sin href file://");
    for (const f of fuentes()) {
      const efectivo = fuenteEfectiva(f);
      if (f === NAVEGACION) {
        // Solo se admite el marcador con elipsis (categoría, sin ruta real copiada).
        const restantes = efectivo.replace(/file:\/\/\/…/g, "");
        assert.ok(!/file:\/\//i.test(restantes), `${f} sin file:// reales`);
      } else {
        assert.ok(!/file:\/\//i.test(efectivo), `${f} sin file://`);
      }
    }
  });

  it("sin javascript:, rutas absolutas personales ni saved-from", () => {
    assert.ok(!/href="javascript:/i.test(html), "sin javascript:");
    assert.ok(!/[A-Z]:\\/.test(html), "sin rutas Windows");
    assert.ok(!/saved-from/i.test(html), "sin comentario saved-from con ruta personal");
  });

  it("toda ancla del compilado resuelve a un id único existente", () => {
    const ids = idsDist();
    for (const e of enlacesDist()) {
      assert.ok(e.href, "enlace con href");
      assert.ok(e.href.startsWith("#"), `href de documento, no remoto: ${e.href}`);
      assert.ok(e.href.length > 1, "ancla no vacía (sin href=\"#\" apagado)");
      const id = e.href.slice(1);
      assert.ok(ids.has(id), `destino existente: ${e.href}`);
      assert.equal(ids.get(id), 1, `id único: ${id}`);
    }
  });

  it("fuente única de ruteo: 13 categorías mapeadas, válidos resuelven y pendientes repliegan", () => {
    const mapeo = [...navegacion.matchAll(/destinoId: "([^"]+)"/g)].map((m) => m[1]);
    assert.equal(mapeo.length, 13, "13 categorías de la referencia mapeadas");
    const ids = idsDist();
    const entrada = /\{\s*id:\s*"([^"]+)",\s*href:\s*"(#[^"]+)",\s*etiqueta:[^}]*?estado:\s*"valido"/g;
    const hrefsValidos = [...navegacion.matchAll(entrada)];
    assert.ok(hrefsValidos.length >= 8, `destinos válidos declarados (${hrefsValidos.length})`);
    for (const [, id, href] of hrefsValidos) {
      if (id === "contenido") continue; // main del layout, ver OT-Q015
      assert.ok(ids.has(href.slice(1)), `válido resuelve: ${id} → ${href}`);
    }
    const pendientes = [...navegacion.matchAll(/\{\s*id:\s*"([^"]+)",\s*href:\s*"(#[^"]+)",\s*etiqueta:[^}]*?estado:\s*"pendienteAP"/g)];
    assert.ok(pendientes.length >= 1, "pendientes declarados");
    for (const [, id, href] of pendientes) {
      assert.ok(ids.has(href.slice(1)), `pendiente repliega a sección disponible: ${id} → ${href}`);
      assert.ok(html.includes(`href="${href}" data-estado="pendienteAP"`) || html.includes(`data-estado="pendienteAP"`), "pendiente marcado en el compilado");
    }
  });

  it("mapa de enlaces del compilado: válidos directos y pendienteAP declarados", () => {
    const enlaces = enlacesDist();
    assert.ok(enlaces.length >= 8, `suficientes enlaces (${enlaces.length})`);
    const pendientes = enlaces.filter((e) => e.pendiente);
    assert.ok(pendientes.length >= 1, "al menos un enlace pendienteAP (Contacto + pie)");
    for (const p of pendientes) {
      assert.ok(p.title.length > 0, `pendiente con motivo visible en title: ${p.href}`);
      assert.ok(idsDist().has(p.href.slice(1)), `pendiente con repliegue existente: ${p.href}`);
    }
  });
});

/* OT-Q015 — main, skip-link, H1 único, jerarquía coherente. */
describe("OT-Q015 estructura semántica", () => {
  it("un main#contenido, un H1 con id, skip-link primero", () => {
    assert.equal([...html.matchAll(/<main\b/gi)].length, 1, "un <main>");
    assert.ok(/<main[^>]*id="contenido"/.test(html), "main#contenido");
    assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, "un H1");
    assert.ok(/<h1[^>]*id="titulo"/.test(html), "H1 identificado (hero tipográfico)");
    const primerEnlace = /<body[^>]*>\s*(<a\b[^>]*>)/is.exec(html)?.[1] ?? "";
    assert.ok(/class="skip-link"/.test(primerEnlace) && /href="#contenido"/.test(primerEnlace), "skip-link como primer enlace al contenido");
    assert.ok(/<html[^>]*lang="es"/.test(html), "lang es");
  });

  it("jerarquía de encabezados coherente, sin saltos", () => {
    const niveles = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
    assert.ok(niveles[0] === 1, "empieza en H1");
    for (let i = 1; i < niveles.length; i++) {
      assert.ok(niveles[i] - niveles[i - 1] <= 1, `sin salto de nivel en posición ${i} (${niveles[i - 1]}→${niveles[i]})`);
    }
    const h2 = niveles.filter((n) => n === 2).length;
    assert.ok(h2 >= 5, `al menos 5 H2 de capítulo (${h2})`);
  });

  it("secciones con nombre accesible que resuelve", () => {
    const ids = idsDist();
    for (const m of html.matchAll(/<section\b([^>]*)>/gi)) {
      const labelledby = /aria-labelledby="([^"]+)"/.exec(m[1])?.[1];
      assert.ok(labelledby, "sección con aria-labelledby");
      assert.ok(ids.has(labelledby), `etiqueta existente: ${labelledby}`);
    }
  });

  it("head SEO mínimo fixture: title/description/robots, canonical pendiente sin URL real", () => {
    assert.ok(/<title>OTERCO — Prototipo editorial \(fixture, no publicable\)<\/title>/.test(html));
    assert.ok(/<meta[^>]*name="description"[^>]*FIXTURE/.test(html), "description fixture");
    assert.ok(/<meta[^>]*name="robots"[^>]*noindex, nofollow/.test(html), "noindex técnico");
    assert.ok(/canonical pendienteAP/.test(html), "canonical pendienteAP declarado");
    assert.ok(!/<link[^>]*rel="canonical"[^>]*href="https?:\/\//.test(html), "sin canonical con URL real inventada");
  });
});

/* OT-Q016 — foco y teclado sin atrapamiento. */
describe("OT-Q016 foco, teclado y estados sin atrapamiento", () => {
  it("sin tabindex positivo ni trampas: orden natural del documento", () => {
    const tabindex = [...html.matchAll(/tabindex="(-?\d+)"/gi)].map((m) => Number(m[1]));
    assert.ok(!tabindex.some((t) => t > 0), "ningún tabindex positivo");
    assert.ok(!tabindex.some((t) => t === -1), "ningún tabindex=-1 sin foco gestionado (shell sin JS)");
  });

  it("sin aria-atrapamiento ni focos ocultos", () => {
    assert.ok(!/aria-hidden="true"/i.test(html), "nada oculto a AT que pueda recibir foco");
    assert.ok(!/inert[=\s>]/i.test(html), "sin inert que atrape");
  });

  it("índice operable por teclado: summary nativo (Enter/Espacio) sin JS", () => {
    assert.ok(/<summary[^>]*class="indice__resumen"/.test(html), "summary enfocable nativo");
    // El resumen solo se oculta en escritorio (≥48rem), donde la lista se
    // fuerza visible con/sin open; en móvil siempre está disponible.
    const desktop = /@media\s*\(min-width:\s*48rem\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
    assert.ok(/\.indice__resumen\s*\{[^}]*display:\s*none/.test(desktop), "resumen oculto solo en escritorio");
    const movil = css.split("@media")[0];
    assert.ok(!/\.indice__resumen\s*\{[^}]*display:\s*none/.test(movil), "resumen nunca oculto en móvil");
  });

  it("foco siempre visible y no solo color: :focus-visible en enlaces, botones y resumen", () => {
    for (const selector of ["a:focus-visible", "button:focus-visible", "summary:focus-visible"]) {
      assert.ok(css.includes(selector), `${selector} con estilo`);
    }
    assert.ok(/outline:\s*3px solid/.test(css), "indicador de foco con contorno, no solo color");
    assert.ok(/\.skip-link:focus/.test(css), "skip-link visible al recibir foco");
  });

  it("enlaces distinguibles sin depender solo de hover", () => {
    assert.ok(/a\s*\{[\s\S]*?text-underline-offset/.test(css), "subrayado permanente en enlaces");
    assert.ok(/a\[data-estado="pendienteAP"\][\s\S]*?text-decoration-style:\s*dashed/.test(css), "pendientes con subrayado discontinuo");
  });
});
