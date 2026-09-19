/**
 * OT-06 — Pruebas de capítulos y portafolio (OT-Q007, OT-Q009, OT-Q022, OT-Q023, OT-Q024).
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 *
 * Consumen el compilado (dist/index.html) + las fuentes: E2E local.
 * Requieren `pnpm build` previo; si dist falta, fallan con mensaje explícito.
 *
 * OT-Q007: las dos fincas y las tres líneas de oferta del compilado
 *   corresponden a la transcripción (`perfil.datos.ts`).
 * OT-Q009: edición localizada — ningún literal de contenido vive fuera de
 *   `perfil.datos.ts` (y los estructurales, en `perfil.esperado.ts`); los
 *   bloques solo interpolan props.
 * OT-Q022: los placeholders reservan dimensiones coherentes con la huella
 *   documental (data-source/data-dims + aspect-ratio), sin <img>.
 * OT-Q023: el bebedero vertical (485×650) se contiene proporcional en su
 *   composición: aspect-ratio declarado en CSS y usado, sin ampliación.
 * OT-Q024: ningún texto certifica raza o propiedad a partir de una imagen:
 *   greps sobre dist + lista explícita de cláusulas prohibidas.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { perfilBase } from "../src/content/perfil.datos.ts";
import {
  FUENTES_ORIGINALES,
  fuenteOriginalDe,
} from "../src/assets/resources.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RAIZ, "dist", "index.html");
const BASE_CSS = join(RAIZ, "src", "styles", "base.css");

assert.ok(existsSync(DIST), "dist/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");

const html = readFileSync(DIST, "utf-8");
const css = readFileSync(BASE_CSS, "utf-8");

/** Archivos UI de OT-06 (bloques + página): sin literales de contenido. */
const UI_OT06 = [
  "src/components/BloquePortafolio.astro",
  "src/components/BloqueFincas.astro",
  "src/components/BloqueGanadoManejo.astro",
  "src/components/BloqueInfraestructura.astro",
  "src/components/FotoPendiente.astro",
  "src/pages/index.astro",
].map((f) => join(RAIZ, f));

function uiCombinada() {
  return UI_OT06.map((f) => readFileSync(f, "utf-8")).join("\n");
}

/** Slots del compilado: figure[data-source][data-dims]. */
function slotsDist() {
  const slots = [];
  for (const m of html.matchAll(/<figure\b([^>]*)>/gi)) {
    const attrs = m[1];
    const source = /data-source="(O-IMG0\d)"/.exec(attrs)?.[1];
    if (!source) continue;
    const dims = /data-dims="(\d+x\d+)"/.exec(attrs)?.[1];
    const pendiente = /data-estado="pendienteAP"/.test(attrs);
    const ratio = /style="[^"]*aspect-ratio:\s*(\d+)\s*\/\s*(\d+)/.exec(attrs);
    slots.push({ source, dims, pendiente, ratio });
  }
  return slots;
}

/* OT-Q007 — Dos fincas y tres líneas literales según transcripción. */
describe("OT-Q007 capítulos y oferta del compilado según transcripción", () => {
  it("dos fincas con nombre, municipio, departamento, función y texto literales", () => {
    assert.equal(perfilBase.fincas.length, 2);
    for (const finca of perfilBase.fincas) {
      for (const campo of [finca.nombre, finca.municipio, finca.departamento, finca.funcion, finca.texto]) {
        assert.ok(html.includes(campo), `dist contiene «${campo.slice(0, 48)}…»`);
      }
    }
  });

  it("tres líneas de oferta con categoría, título y descripción literales", () => {
    assert.equal(perfilBase.oferta.length, 3);
    for (const linea of perfilBase.oferta) {
      assert.ok(html.includes(linea.categoria), `dist contiene categoría «${linea.categoria}»`);
      assert.ok(html.includes(linea.titulo), `dist contiene título «${linea.titulo}»`);
      assert.ok(html.includes(linea.descripcion), `dist contiene descripción de «${linea.categoria}»`);
    }
  });

  it("trazabilidad in-code: data-fuente O-D01/O-D02/O-IMG en bloques y slots", () => {
    assert.ok(html.includes('data-fuente="O-D01"'), "contenido trazado a O-D01");
    assert.ok(html.includes('data-fuente="O-D02"'), "infraestructura trazada a O-D02");
    for (const f of FUENTES_ORIGINALES) {
      assert.ok(html.includes(`data-fuente="${f.sourceId}"`), `slot trazado a ${f.sourceId}`);
    }
  });
});

/* OT-Q009 — Cambio localizado: sin literales duplicados fuera de datos/esperado. */
describe("OT-Q009 edición localizada en un solo archivo de datos", () => {
  it("títulos, descripciones y textos de finca viven solo en perfil.datos.ts", () => {
    const ui = uiCombinada();
    const literales = [
      ...perfilBase.oferta.flatMap((l) => [l.titulo, l.descripcion]),
      ...perfilBase.fincas.flatMap((f) => [f.nombre, f.municipio, f.departamento, f.texto]),
      perfilBase.identidad.perfil,
      perfilBase.identidad.region,
    ];
    for (const literal of literales) {
      assert.ok(!ui.includes(literal), `UI sin duplicar «${literal.slice(0, 48)}…»`);
    }
  });

  it("los bloques consumen la proyección por props (import real en la página)", () => {
    const pagina = readFileSync(join(RAIZ, "src", "pages", "index.astro"), "utf-8");
    assert.ok(pagina.includes("proyeccionPublica(perfilBase)"), "import real de la proyección en la página");
    assert.ok(pagina.includes("<BloquePortafolio oferta={publica.oferta}"), "oferta por props");
    assert.ok(pagina.includes("<BloqueFincas fincas={publica.fincas}"), "fincas por props");
    assert.ok(pagina.includes("<BloqueGanadoManejo fincas={publica.fincas}"), "manejo por props");
    assert.ok(pagina.includes("<BloqueInfraestructura />"), "infraestructura como bloque");
  });
});

/* OT-Q022 — Placeholders con dimensiones reservadas, sin <img>. */
describe("OT-Q022 reserva de dimensiones sin fotografía publicada", () => {
  it("cero <img>, cero base64 y seis slots con data-dims de la huella documental", () => {
    assert.ok(!/<img[\s>]/i.test(html), "dist sin <img>");
    assert.ok(!/data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(html), "dist sin base64");
    const slots = slotsDist();
    assert.equal(slots.length, 6, "seis slots, uno por huella O-IMG01..O-IMG06");
    for (const f of FUENTES_ORIGINALES) {
      const slot = slots.find((s) => s.source === f.sourceId);
      assert.ok(slot, `slot ${f.sourceId} presente`);
      assert.equal(slot.dims, `${f.widthOriginal}x${f.heightOriginal}`, `${f.sourceId}: dims de la huella`);
      assert.equal(slot.pendiente, true, `${f.sourceId}: marcado pendienteAP`);
      assert.ok(slot.ratio, `${f.sourceId}: aspect-ratio en línea`);
      assert.equal(Number(slot.ratio[1]), f.widthOriginal, `${f.sourceId}: proporción coherente (w)`);
      assert.equal(Number(slot.ratio[2]), f.heightOriginal, `${f.sourceId}: proporción coherente (h)`);
    }
  });

  it("cada slot declara fotografía pendiente + fuente, sin alt original", () => {
    assert.equal((html.match(/fotografía pendiente de aprobación/gi) || []).length >= 6, true, "texto pendiente en cada slot");
    for (const f of FUENTES_ORIGINALES) {
      assert.ok(!html.includes(f.sourceAltOriginal), `${f.sourceId}: alt original fuera de dist`);
    }
  });
});

/* OT-Q023 — Bebedero contenido proporcional, sin ampliación engañosa. */
describe("OT-Q023 bebedero vertical contenido en su composición", () => {
  it("slot O-IMG04 con dims 485x650 dentro del subapartado #bebederos", () => {
    const bebederos = /id="bebederos"[\s\S]*?data-dims="485x650"/.test(html);
    assert.ok(bebederos, "#bebederos contiene el slot 485x650");
    assert.ok(/detalle-vertical/.test(html), "clase de contención usada");
  });

  it("CSS declara la proporción 485/650 con topes de detalle (columna, ~560 px)", () => {
    assert.ok(/aspect-ratio:\s*485\s*\/\s*650/.test(css), "proporción 485/650 en la ficha");
    assert.ok(/max-height:\s*35rem/.test(css), "alto máximo ~560 px");
    assert.ok(/max-width:\s*22rem/.test(css), "columna de detalle, nunca todo el ancho");
  });
});

/* OT-Q024 — Sin certificación de raza o propiedad desde imágenes. */
describe("OT-Q024 textos sin certificar raza ni propiedad", () => {
  /** Cláusulas que certificarían raza/propiedad/calidad desde una foto. */
  const PROHIBIDAS = [
    /brahman/i,
    /b[uú]falos?/i,
    /nelore|guzer[aá]/i,
    /raza (pura|garantizada|certificada)/i,
    /gen[eé]tica (pura|garantizada|certificada)/i,
    /garantiz\w*/i,
    /certific\w*/i,
    /propiedad de|de nuestra (finca|hacienda)|nuestro ganado/i,
    /tomadas? en (las|nuestras?|estas?) (fincas|haciendas?)/i,
  ];

  it("ninguna cláusula certificadora en dist (lista explícita)", () => {
    for (const patron of PROHIBIDAS) {
      assert.ok(!patron.test(html), `dist sin «${patron}»`);
    }
  });

  it("ningún alt original de la fuente llega a dist ni a la UI OT-06", () => {
    const ui = uiCombinada();
    for (const f of FUENTES_ORIGINALES) {
      assert.ok(!html.includes(f.sourceAltOriginal), `dist sin alt de ${f.sourceId}`);
      assert.ok(!ui.includes(f.sourceAltOriginal), `UI sin alt de ${f.sourceId}`);
    }
  });

  it("puerta editorial en dist: sin NIT, contacto, solar ni fotos sin aprobar", () => {
    assert.ok(!html.includes("11.6"), "sin potencia solar en conflicto");
    assert.ok(!html.includes("21 hectáreas"), "sin superficie solar en conflicto");
    assert.ok(!html.includes("contacto@"), "sin buzón sin verificar");
    assert.ok(!html.includes("830.128"), "sin NIT sin confirmar");
    assert.ok(!html.includes("Fotografias tomadas"), "sin afirmación de origen sin licencias");
    assert.ok(html.includes("solar: omitido"), "omisión solar informada al operador");
  });
});
