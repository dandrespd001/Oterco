/**
 * OT-10 — Auditoría programática de accesibilidad y móvil (OT-Q013, OT-Q015,
 * OT-Q016, OT-Q017, OT-Q018, OT-Q019, OT-Q052).
 * Runner estándar Node (`node --test tests/`), sin paquetes nuevos.
 *
 * Consume el compilado (dist/index.html, dist/privacidad/index.html,
 * dist/404.html) + tokens de src/styles/base.css. No sustituye la revisión
 * manual con navegador real, lector de pantalla ni la inspección visual de
 * capturas: esas quedan como pasos pendientes del operador en
 * docs/implementacion/OT-10/INFORME.md (OT-Q052 honesto).
 *
 * Límites declarados de esta auditoría:
 * - Sin motor de render: no mide píxeles, foco real, orden de tabulación
 *   en vivo ni (scroll horizontal a 320 px. Usa proxies de código (unidades,
 *   reglas CSS, orden DOM, atributos).
 * - Sin axe-core: axe no está instalado y no se instala nada (permiso).
 *   El informe da la orden exacta para que el operador ejecute axe.
 * - Contraste: cálculo WCAG 2.x propio (luminancia relativa) sobre los
 *   tokens de base.css para los pares que las clases emitidas usan de
 *   verdad. No es medición instrumental de captura; el ocre (~3:1) solo
 *   se admite en bordes decorativos, nunca como color de texto.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(RAIZ, "dist", "index.html");
const PRIV = join(RAIZ, "dist", "privacidad", "index.html");
const NOTFOUND = join(RAIZ, "dist", "404.html");
const BASE_CSS = join(RAIZ, "src", "styles", "base.css");
const INFORME = join(RAIZ, "..", "..", "docs", "implementacion", "OT-10", "INFORME.md");

for (const [ruta, nombre] of [[INDEX, "dist/index.html"], [PRIV, "dist/privacidad/index.html"], [NOTFOUND, "dist/404.html"], [BASE_CSS, "src/styles/base.css"]]) {
  assert.ok(existsSync(ruta), `${nombre} existe: ejecutar \`pnpm build\` antes de \`pnpm test\``);
}

const index = readFileSync(INDEX, "utf-8");
const privacidad = readFileSync(PRIV, "utf-8");
const notfound = readFileSync(NOTFOUND, "utf-8");
const css = readFileSync(BASE_CSS, "utf-8");
const cssLimpio = css.replace(/\/\*[\s\S]*?\*\//g, "");

const PAGINAS = [
  { nombre: "portada", html: index },
  { nombre: "privacidad", html: privacidad },
  { nombre: "404", html: notfound },
];

const tituloDe = (html) => /<title>([^<]+)<\/title>/i.exec(html)?.[1] ?? "";
const nivelesDe = (html) => [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));

function idsDe(html) {
  const mapa = new Map();
  for (const m of html.matchAll(/\sid="([^"]+)"/gi)) mapa.set(m[1], (mapa.get(m[1]) ?? 0) + 1);
  return mapa;
}

/** Nombre accesible aproximado de un <a>: texto visible o aria-label. */
function enlacesConNombre(html) {
  const lista = [];
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)) {
    const attrs = m[1];
    const texto = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const aria = /aria-label="([^"]*)"/i.exec(attrs)?.[1]?.trim() ?? "";
    lista.push({ href: /href="([^"]*)"/i.exec(attrs)?.[1] ?? null, nombre: texto || aria });
  }
  return lista;
}

/* ---- Contraste WCAG sobre tokens ---- */

function hexALinea(canal) {
  const v = canal / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminancia(hex) {
  const c = hex.replace("#", "");
  return (
    0.2126 * hexALinea(parseInt(c.slice(0, 2), 16)) +
    0.7152 * hexALinea(parseInt(c.slice(2, 4), 16)) +
    0.0722 * hexALinea(parseInt(c.slice(4, 6), 16))
  );
}

function contraste(a, b) {
  const hi = Math.max(luminancia(a), luminancia(b));
  const lo = Math.min(luminancia(a), luminancia(b));
  return (hi + 0.05) / (lo + 0.05);
}

function token(nombre) {
  const m = new RegExp(`${nombre}:\\s*(#[0-9a-f]{6})`, "i").exec(css);
  assert.ok(m, `token ${nombre} declarado en base.css`);
  return m[1].toLowerCase();
}

/* OT-Q015 — Estructura, idioma, títulos, figuras y nombres accesibles. */
describe("OT-10 OT-Q015 estructura por página (portada, privacidad, 404)", () => {
  it("lang por página: las tres declaran lang=es", () => {
    for (const p of PAGINAS) {
      assert.ok(/<html[^>]*lang="es"/i.test(p.html), `${p.nombre}: lang es`);
    }
  });

  it("title únicos por página: tres títulos distintos y no vacíos", () => {
    const titulos = PAGINAS.map((p) => tituloDe(p.html));
    for (const [i, t] of titulos.entries()) {
      assert.ok(t.length > 0, `${PAGINAS[i].nombre}: título no vacío`);
    }
    assert.equal(new Set(titulos).size, 3, `tres títulos distintos: ${titulos.join(" | ")}`);
  });

  it("jerarquía H anidada y sin saltos en cada página", () => {
    const minH2 = { portada: 5, privacidad: 4, 404: 0 };
    for (const p of PAGINAS) {
      const niveles = nivelesDe(p.html);
      assert.ok(niveles.length >= 1, `${p.nombre}: al menos un encabezado`);
      assert.equal(niveles[0], 1, `${p.nombre}: empieza en H1`);
      assert.equal(niveles.filter((n) => n === 1).length, 1, `${p.nombre}: un solo H1`);
      for (let i = 1; i < niveles.length; i++) {
        assert.ok(
          niveles[i] - niveles[i - 1] <= 1,
          `${p.nombre}: sin salto en posición ${i} (${niveles[i - 1]}→${niveles[i]})`,
        );
      }
      const h2 = niveles.filter((n) => n === 2).length;
      assert.ok(h2 >= minH2[p.nombre], `${p.nombre}: al menos ${minH2[p.nombre]} H2 (${h2})`);
    }
  });

  it("figuras: cero <img>; cada <figure> trae nota accesible (figcaption + nombre)", () => {
    for (const p of PAGINAS) {
      assert.ok(!/<img[\s>]/i.test(p.html), `${p.nombre}: sin <img> (sin foto aprobada)`);
      const figuras = [...p.html.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure\s*>/gi)];
      for (const [, attrs, cuerpo] of figuras) {
        assert.ok(/<figcaption[\s>]/i.test(cuerpo), `${p.nombre}: figure con <figcaption>`);
        const nombre = /aria-label="([^"]*)"/i.exec(attrs)?.[1]?.trim() ?? "";
        assert.ok(nombre.length > 0, `${p.nombre}: figure con nota accesible (aria-label)`);
      }
    }
    const total = PAGINAS.reduce(
      (n, p) => n + [...p.html.matchAll(/<figure\b/gi)].length,
      0,
    );
    assert.ok(total >= 6, `figuras de reserva auditadas (${total})`);
  });

  it("sin campos sin etiquetar: el dist no publica inputs del preparador deshabilitado", () => {
    for (const p of PAGINAS) {
      assert.ok(!/<input[\s>]/i.test(p.html), `${p.nombre}: sin <input>`);
      assert.ok(!/<textarea[\s>]/i.test(p.html), `${p.nombre}: sin <textarea>`);
      assert.ok(!/<select[\s>]/i.test(p.html), `${p.nombre}: sin <select>`);
    }
  });

  it("labels/aria resueltos: todo enlace tiene nombre y toda referencia existe", () => {
    for (const p of PAGINAS) {
      const ids = idsDe(p.html);
      for (const e of enlacesConNombre(p.html)) {
        assert.ok(e.href, `${p.nombre}: enlace con href`);
        assert.ok(e.nombre.length > 0, `${p.nombre}: enlace con nombre accesible (${e.href})`);
        if (e.href.startsWith("#")) {
          assert.ok(ids.has(e.href.slice(1)), `${p.nombre}: destino existente ${e.href}`);
        }
      }
      for (const m of p.html.matchAll(/aria-labelledby="([^"]+)"/gi)) {
        assert.ok(ids.has(m[1]), `${p.nombre}: aria-labelledby resuelve (${m[1]})`);
      }
      for (const m of p.html.matchAll(/aria-controls="([^"]+)"/gi)) {
        assert.ok(ids.has(m[1]), `${p.nombre}: aria-controls resuelve (${m[1]})`);
      }
    }
  });

  it("skip-link visible con foco: primero en portada/privacidad y presente en 404", () => {
    for (const [p, nombre] of [[index, "portada"], [privacidad, "privacidad"]]) {
      const primero = /<body[^>]*>\s*(<a\b[^>]*>)/is.exec(p)?.[1] ?? "";
      assert.ok(/class="skip-link"/.test(primero) && /href="#contenido"/.test(primero), `${nombre}: skip-link primer enlace`);
      assert.ok(/<main[^>]*id="contenido"/.test(p), `${nombre}: main#contenido destino del salto`);
    }
    assert.ok(/class="skip-link"[^>]*href="#contenido"/.test(notfound), "404: skip-link a #contenido");
    assert.ok(/id="contenido"/.test(notfound), "404: destino #contenido existente");
    assert.ok(/\.skip-link:focus/.test(css), "skip-link con regla :focus (se hace visible)");
  });

  it("landmarks: portada completa; privacidad y 404 mínimas con main", () => {
    assert.ok(/<header\b/.test(index), "portada: header");
    assert.ok(/<nav[^>]*aria-label="Índice editorial"/.test(index), "portada: nav con nombre");
    assert.ok(/<main[^>]*id="contenido"/.test(index), "portada: main#contenido");
    assert.ok(/<footer\b/.test(index), "portada: footer");
    for (const [p, nombre] of [[privacidad, "privacidad"], [notfound, "404"]]) {
      assert.ok(/<main\b/.test(p), `${nombre}: main presente`);
    }
  });
});

/* OT-Q016 — Foco visible, taborder natural y teclado sin trampas. */
describe("OT-10 OT-Q016 foco y teclado (proxy de código, sin navegador)", () => {
  it("taborder natural: ningún tabindex en las tres páginas", () => {
    for (const p of PAGINAS) {
      const valores = [...p.html.matchAll(/tabindex="(-?\d+)"/gi)].map((m) => Number(m[1]));
      assert.equal(valores.length, 0, `${p.nombre}: sin tabindex (orden = orden del documento)`);
    }
  });

  it("sin atrapamiento: nada oculto a AT ni inert en las tres páginas", () => {
    for (const p of PAGINAS) {
      assert.ok(!/aria-hidden="true"/i.test(p.html), `${p.nombre}: sin aria-hidden`);
      assert.ok(!/inert[=\s>]/i.test(p.html), `${p.nombre}: sin inert`);
    }
  });

  it("foco visible: reglas focus-visible con outline ≥3px y offset", () => {
    for (const selector of ["a:focus-visible", "button:focus-visible", "summary:focus-visible"]) {
      assert.ok(css.includes(selector), `${selector} con estilo`);
    }
    const contorno = /outline:\s*(\d+)px solid/.exec(cssLimpio);
    assert.ok(contorno, "indicador con outline sólido");
    assert.ok(Number(contorno[1]) >= 3, `outline ≥3px (${contorno[1]}px), no solo color`);
    assert.ok(/outline-offset:\s*3px/.test(cssLimpio), "outline-offset 3px (no tapado por el borde)");
  });

  it("taborder frente a orden visual: el único reordenamiento no mueve enfocables", () => {
    const reordenes = [...cssLimpio.matchAll(/(^|\})\s*([^{]*?)\{[^}]*?\border\s*:\s*[^;}]+;?[^}]*?\}/gi)].map((m) => m[2].trim());
    assert.deepEqual(reordenes, [".territorio--invertido > :first-child"], "único reorden visual declarado");
    const articulos = [...index.matchAll(/<article\b[^>]*class="territorio[^"]*"[^>]*>([\s\S]*?)<\/article\s*>/gi)];
    assert.ok(articulos.length >= 2, "artículos de territorio presentes");
    for (const [, cuerpo] of articulos) {
      assert.ok(!/<a\b/i.test(cuerpo), "territorio sin enlaces: el reorden no altera el Tab");
      assert.ok(!/<button\b/i.test(cuerpo), "territorio sin botones");
      assert.ok(!/<summary\b/i.test(cuerpo), "territorio sin summary");
    }
  });
});

/* OT-Q017 — Contraste calculado desde los tokens de base.css. */
describe("OT-10 OT-Q017 contraste ≥4.5:1 sobre pares reales clase↔token", () => {
  const pares = () => {
    const t = {
      paper: token("--ot-paper"),
      paperAlt: token("--ot-paper-alt"),
      forest: token("--ot-forest"),
      deep: token("--ot-forest-deep"),
      ink: token("--ot-ink"),
      muted: token("--ot-muted"),
      clay: token("--ot-clay"),
    };
    return [
      ["cuerpo: ink sobre paper", t.ink, t.paper],
      ["títulos/marca/índice: forest sobre paper", t.forest, t.paper],
      ["metas y reserva: muted sobre paper", t.muted, t.paper],
      ["enlaces/kickers/etiquetas: clay sobre paper", t.clay, t.paper],
      ["botón principal y skip-link: paper sobre forest", t.paper, t.forest],
      ["cierre y pie: paper sobre deep", t.paper, t.deep],
      ["kicker de cierre: paperAlt sobre deep", t.paperAlt, t.deep],
      ["capítulo alt: ink sobre paperAlt", t.ink, t.paperAlt],
      ["kicker en capítulo alt: clay sobre paperAlt", t.clay, t.paperAlt],
      ["meta en capítulo alt: muted sobre paperAlt", t.muted, t.paperAlt],
      ["botón secundario: forest sobre paper (fondo transparente)", t.forest, t.paper],
    ];
  };

  it("todos los pares de texto cumplen ≥4.5:1 (cálculo WCAG en este test)", () => {
    for (const [nombre, texto, fondo] of pares()) {
      const ratio = contraste(texto, fondo);
      assert.ok(ratio >= 4.5, `${nombre}: ${ratio.toFixed(2)}:1 ≥ 4.5:1`);
    }
  });

  it("ocre decorativo: nunca color de texto, solo bordes/filetes", () => {
    const usosColor = [...cssLimpio.matchAll(/(^|[;{}])\s*color\s*:[^;{}]*--ot-ochre[^;{}]*;/gi)];
    assert.equal(usosColor.length, 0, "ocre jamás como color de texto (su ~3:1 no llegaría)");
    assert.ok(/border-(bottom|left)[^;]*--ot-ochre/.test(cssLimpio), "ocre solo en bordes decorativos");
  });

  it("foco y controles no dependen solo del color ni del ocre", () => {
    assert.ok(!/outline:[^;]*--ot-ochre/.test(cssLimpio), "indicador de foco sin ocre");
    const ratioFoco = contraste(token("--ot-forest"), token("--ot-paper"));
    assert.ok(ratioFoco >= 3, `foco forest/paper ${ratioFoco.toFixed(2)}:1 ≥ 3:1`);
  });
});

/* OT-Q013/OT-Q018 — Táctil, zoom y reflow por proxies de código. */
describe("OT-10 OT-Q013/OT-Q018 móvil, táctil y reflow (proxy sin render)", () => {
  it("viewport móvil en las tres páginas y cero scripts", () => {
    for (const p of PAGINAS) {
      assert.ok(
        /<meta[^>]*name="viewport"[^>]*content="width=device-width, initial-scale=1"/i.test(p.html),
        `${p.nombre}: viewport móvil`,
      );
      assert.ok(!/<script[\s>]/i.test(p.html), `${p.nombre}: sin scripts (navegación sin JS)`);
    }
  });

  it("objetivos táctiles ≥44px: recuento de selectores y tamaños declarados", () => {
    const declaraciones = [
      ["botones .boton", /\.boton\s*\{[\s\S]*?min-height:\s*44px/, true],
      ["enlaces del índice en móvil", /\.indice__lista a\s*\{[\s\S]*?padding-block:\s*0\.6rem/, true],
      ["resumen del índice", /\.indice__resumen\s*\{[\s\S]*?padding:\s*0\.75rem 0/, true],
      ["skip-link", /\.skip-link\s*\{[\s\S]*?padding:\s*0\.6rem 1rem/, true],
    ];
    for (const [nombre, patron, esperado] of declaraciones) {
      assert.equal(patron.test(css), esperado, `${nombre}: tamaño táctil declarado`);
    }
    // Excepción documentada: en escritorio (≥48rem, puntero fino) los enlaces
    // del índice vuelven a inline sin padding; el área táctil se exige en móvil.
    assert.ok(
      /@media\s*\(min-width:\s*48rem\)[\s\S]*?\.indice__lista a\s*\{[\s\S]*?padding-block:\s*0/.test(css),
      "excepción de escritorio declarada y acotada a la media query",
    );
  });

  it("zoom/reflow: sin anchos fijos, sin fixed, unidades relativas y topes de línea", () => {
    assert.ok(!/width:\s*\d{3,}px/.test(cssLimpio), "sin anchos fijos ≥100px");
    assert.ok(!/min-width:\s*\d{3,}px/.test(cssLimpio), "sin min-width que rompa 320px");
    assert.ok(!/position:\s*fixed/.test(cssLimpio), "sin position:fixed que tape foco o contenido");
    const absolutos = [...cssLimpio.matchAll(/position:\s*absolute[^}]*?\}/gi)];
    assert.ok(absolutos.length <= 1, `absolute acotado (${absolutos.length}, solo skip-link fuera de vista)`);
    assert.ok(!/100vw/.test(cssLimpio), "sin 100vw (no suma la barra de scroll)");
    for (const patron of [/max-width:\s*var\(--ot-medida\)/, /max-width:\s*var\(--ot-contenedor\)/, /max-width:\s*22rem/, /max-height:\s*35rem/]) {
      assert.ok(patron.test(cssLimpio), `tope de línea/contenedor ${patron}`);
    }
    assert.ok(/clamp\(/.test(cssLimpio), "escalas fluidas con clamp (zoom 200% sin saltos)");
    assert.ok(/@media\s*\(min-width:\s*48rem\)/.test(css), "media query de escritorio presente");
  });

  it("fuente deshabilitada también auditada: el estilo del preparador usa topes relativos", () => {
    const prep = readFileSync(join(RAIZ, "src", "tools", "preparador", "Preparador.astro"), "utf-8");
    assert.ok(!/width:\s*\d{3,}px/.test(prep), "preparador sin anchos fijos");
    assert.ok(/max-width:\s*60ch/.test(prep), "preparador con tope de línea 60ch");
  });
});

/* OT-Q019 — Movimiento reducido. */
describe("OT-10 OT-Q019 movimiento reducido y contenido sin animación", () => {
  it("prefers-reduced-motion elimina transiciones y animaciones", () => {
    assert.ok(/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css), "bloque reduced-motion");
    const bloque = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
    assert.ok(/transition:\s*none/.test(bloque), "transiciones eliminadas");
    assert.ok(/animation:\s*none/.test(bloque), "animaciones eliminadas");
  });

  it("sin movimiento por defecto: scroll instantáneo y cero animaciones base", () => {
    assert.ok(!/scroll-behavior:\s*smooth/.test(cssLimpio), "sin smooth scroll ornamental");
    const fueraReduce = cssLimpio.replace(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/, "");
    assert.ok(!/animation\s*:/.test(fueraReduce), "sin animaciones fuera del bloque reduce");
    assert.ok(!/transition\s*:/.test(fueraReduce), "sin transiciones fuera del bloque reduce");
  });

  it("OT-10.F3 el CSS emitido conserva el bloque reduced-motion (transition/animation none)", () => {
    const dirAstro = join(RAIZ, "dist", "_astro");
    assert.ok(existsSync(dirAstro), "dist/_astro existe: ejecutar `pnpm build` antes de `pnpm test`");
    const hojas = readdirSync(dirAstro).filter((f) => f.endsWith(".css"));
    assert.ok(hojas.length >= 1, `al menos una hoja emitida en dist/_astro (${hojas.length})`);
    const emitido = hojas.map((f) => readFileSync(join(dirAstro, f), "utf-8")).join("\n");
    assert.ok(/prefers-reduced-motion:\s*reduce/.test(emitido), "el bundle emitido conserva prefers-reduced-motion: reduce");
    assert.ok(/transition\s*:\s*none/.test(emitido), "el bundle emitido anula transiciones (transition: none, minificado o no)");
    assert.ok(/animation\s*:\s*none/.test(emitido), "el bundle emitido anula animaciones (animation: none, minificado o no)");
  });
});

/* OT-Q052 — Combinación honesta: proxies aquí, manual y axe con operador. */
describe("OT-10 OT-Q052 evidencia combinada sin fingir visión", () => {
  it("el informe del operador existe con pasos manuales y orden axe sin paquetes", () => {
    assert.ok(existsSync(INFORME), "docs/implementacion/OT-10/INFORME.md existe");
    const informe = readFileSync(INFORME, "utf-8");
    for (const marca of ["320", "390", "768", "1440", "Tab", "axe", "Orca", "captura"]) {
      assert.ok(informe.includes(marca), `informe cubre ${marca}`);
    }
  });
});
