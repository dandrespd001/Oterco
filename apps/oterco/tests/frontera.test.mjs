/**
 * OT-09 — Verificadores de frontera (OT-Q001, OT-Q003, OT-Q004, OT-Q009,
 * OT-Q021, OT-Q031, OT-Q032, OT-Q033, OT-Q034, OT-Q050).
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 *
 * Frontera = lo que el sitio compilado y el código NO deben contener ni
 * cruzar: marca/recursos de Puerta Abierta, red/API/analítica, persistencia,
 * scripts con el preparador deshabilitado. Requiere `pnpm build` previo
 * para los barridos sobre dist.
 *
 * Convención: "código efectivo" = fuente sin comentarios (HTML, bloque y
 * línea). Una mención nominativa en un comentario ("NO es la identidad de
 * Puerta Abierta") no es un import/recurso: el barrido Q001 distingue
 * mención documental de dependencia real.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { PREPARADOR_ENABLED } from "../src/tools/preparador/index.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(RAIZ, "src");
const DIST = join(RAIZ, "dist");
const PUBLICO = join(RAIZ, "public");
const RAIZ_REPO = join(RAIZ, "..", "..");

assert.ok(existsSync(join(DIST, "index.html")), "dist/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");

/** Quita comentarios para no confundir documentación con dependencia real. */
function sinComentarios(texto, ext) {
  let limpio = texto.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  if (ext === ".astro" || ext === ".ts" || ext === ".mjs" || ext === ".js") {
    limpio = limpio.replace(/(^|\s)\/\/[^\n]*/g, "$1");
  }
  return limpio;
}

/** Camina un directorio devolviendo rutas absolutas (sin node_modules/.astro/.git). */
function caminar(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".astro" || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) caminar(p, acc);
    else acc.push(p);
  }
  return acc;
}

function leer(ruta) {
  return readFileSync(ruta, "utf-8");
}

function textoDist(ruta) {
  try {
    return leer(ruta);
  } catch {
    return null; // binario: no inspeccionable como texto
  }
}

/* OT-Q021 — dist limpio: árbol conocido, sin base64/privados/certificados. */
describe("OT-Q021 frontera dist: árbol conocido y sin restos privados", () => {
  it("dist contiene solo los artefactos conocidos (allowlist de primer nivel)", () => {
    const entradas = new Set(readdirSync(DIST));
    const permitidas = new Set([
      "index.html",
      "privacidad",
      "404.html",
      "robots.txt",
      "sitemap.xml",
      "_headers",
      "favicon.svg",
      "_astro",
    ]);
    for (const e of entradas) {
      assert.ok(permitidas.has(e), `dist sin restos inesperados: ${e}`);
    }
    for (const esperada of ["index.html", "404.html", "robots.txt", "sitemap.xml", "_headers", "favicon.svg"]) {
      assert.ok(entradas.has(esperada), `dist emite ${esperada}`);
    }
  });

  it("_astro solo con CSS con hash: sin JS, mapas ni binarios inesperados", () => {
    const astro = caminar(join(DIST, "_astro"));
    assert.ok(astro.length >= 1, "_astro con activos");
    for (const ruta of astro) {
      assert.ok(!/\.(js|mjs|map|ts)$/i.test(ruta), `sin ejecutables ni mapas: ${relative(DIST, ruta)}`);
      assert.ok(!/\.pem$/i.test(ruta), `sin certificados: ${relative(DIST, ruta)}`);
    }
  });

  it("dist textual sin base64, certificados, privados ni ficheros ocultos", () => {
    const prohibidos = [
      "data:image/",
      ";base64,",
      "BEGIN PRIVATE",
      ".pem",
      ".private-references",
      "private-references",
      "inventory.json",
      ".env",
      ".DS_Store",
    ];
    for (const ruta of caminar(DIST)) {
      const base = ruta.split("/").pop();
      assert.ok(!base.startsWith("."), `sin ficheros ocultos: ${relative(DIST, ruta)}`);
      const texto = textoDist(ruta);
      if (texto === null) continue;
      for (const literal of prohibidos) {
        assert.ok(!texto.includes(literal), `${relative(DIST, ruta)}: sin «${literal}»`);
      }
    }
  });
});

/* OT-Q050 — Sin API/D1/IA/CRM/fetch/XHR/analytics/autoplay/modo oscuro. */
describe("OT-Q050 frontera de alcance: sin red, servicios ni extras", () => {
  const RED = [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /EventSource/];
  const SERVICIOS = [/\/api\//, /\bD1\b/, /cloudflare/i, /workers\.dev/i, /\bCRM\b/, /hubspot|salesforce|notion-so/i, /\bopenai\b|\bchatgpt\b/i];
  const RASTREO = [/gtag\s*\(/, /google-analytics/i, /facebook.*pixel|fbq\s*\(/i, /plausible|umami|hotjar|segment\.io/i, /\banalytics\b/i];
  const EXTRAS = [/autoplay/i, /modo oscuro/i, /dark-mode/i, /data-theme/, /prefers-color-scheme:\s*dark/i];

  it("código efectivo de src sin red remota, servicios, rastreo ni extras", () => {
    for (const ruta of caminar(SRC)) {
      if (/\.(woff2|png|jpe?g|webp|avif|svg)$/i.test(ruta)) continue;
      const ext = ruta.endsWith(".css") ? ".css" : ruta.endsWith(".ts") ? ".ts" : ".astro";
      const efectivo = sinComentarios(leer(ruta), ext);
      const rel = relative(RAIZ, ruta);
      for (const patron of [...RED, ...SERVICIOS, ...RASTREO, ...EXTRAS]) {
        assert.ok(!patron.test(efectivo), `${rel}: sin ${patron}`);
      }
    }
  });

  it("dist textual sin red, servicios, rastreo ni extras", () => {
    for (const ruta of caminar(DIST)) {
      const texto = textoDist(ruta);
      if (texto === null) continue;
      const rel = relative(RAIZ, ruta);
      for (const patron of [...RED, ...SERVICIOS, ...RASTREO, ...EXTRAS]) {
        assert.ok(!patron.test(texto), `${rel}: sin ${patron}`);
      }
      // Los namespaces XML (w3.org, sitemaps.org) son identificadores del
      // esquema, nunca peticiones; la base reservada .invalid tampoco resuelve.
      const sinNamespaces = texto
        .replace(/http:\/\/www\.w3\.org\/[^\s"'<>]*/g, "")
        .replace(/http:\/\/www\.sitemaps\.org\/[^\s"'<>]*/g, "");
      assert.ok(!/https?:\/\/(?!oterco-pendiente-ap\.invalid(?![.\w-]))/.test(sinNamespaces), `${rel}: sin URL remota real`);
    }
  });

  it("la exención del host reservado no deja colar subdominios maliciosos y un host real sí se detecta", () => {
    const patronRemota = /https?:\/\/(?!oterco-pendiente-ap\.invalid(?![.\w-]))/;
    assert.ok(!patronRemota.test("https://oterco-pendiente-ap.invalid"), "el host reservado sigue exento");
    assert.ok(
      patronRemota.test("https://oterco-pendiente-ap.invalid.evil.example"),
      "…invalid.evil.example no se cuela como exento (frontera de host)",
    );
    assert.ok(patronRemota.test("https://ejemplo.example"), "un host real distinto SÍ se detecta");
  });
});

/* OT-Q031..Q034 — Módulo deshabilitado: 0 listeners/storage/teléfono en dist. */
describe("OT-Q031..Q034 frontera del módulo deshabilitado", () => {
  it("Q032: flag apagado y listeners confinados al preparador (fuera de dist)", () => {
    assert.equal(PREPARADOR_ENABLED, false, "PREPARADOR_ENABLED === false");
    const conListeners = [];
    for (const ruta of caminar(SRC)) {
      if (!/\.(ts|astro)$/.test(ruta)) continue;
      if (/addEventListener/.test(sinComentarios(leer(ruta), ruta.endsWith(".ts") ? ".ts" : ".astro"))) {
        conListeners.push(relative(RAIZ, ruta));
      }
    }
    assert.ok(conListeners.length >= 1, "el conector declara sus listeners en fuente");
    for (const f of conListeners) {
      assert.ok(f.startsWith("src/tools/preparador/"), `listener solo en el módulo: ${f}`);
    }
  });

  it("Q031/Q033: dist sin listeners, scripts ni almacenamiento del navegador", () => {
    for (const ruta of caminar(DIST)) {
      const texto = textoDist(ruta);
      if (texto === null) continue;
      const rel = relative(RAIZ, ruta);
      assert.ok(!/<script[\s>]/i.test(texto), `${rel}: sin scripts (nada que duplique listeners)`);
      assert.ok(!/addEventListener/.test(texto), `${rel}: sin listeners`);
      for (const patron of [/localStorage/, /sessionStorage/, /indexedDB/, /document\.cookie/]) {
        assert.ok(!patron.test(texto), `${rel}: sin ${patron} (borrador sin persistencia)`);
      }
    }
  });

  it("Q034: contacto y portafolio intactos en estático; sin teléfono ni mailto", () => {
    const html = leer(join(DIST, "index.html"));
    for (const id of ["portafolio", "cierre"]) {
      assert.ok(new RegExp(`id="${id}"`).test(html), `#${id} en estático (sin JS no se rompe)`);
    }
    for (const ruta of caminar(DIST)) {
      const texto = textoDist(ruta);
      if (texto === null) continue;
      assert.ok(!/mailto:/i.test(texto), `${relative(RAIZ, ruta)}: sin mailto`);
      assert.ok(!/tel:/i.test(texto), `${relative(RAIZ, ruta)}: sin teléfono`);
    }
  });
});

/* OT-Q001 — Solo OTERCO: sin recursos/CSS/config de Puerta Abierta. */
describe("OT-Q001 frontera de marca: sin restos de Puerta Abierta", () => {
  // Rutas/marcas conocidas de PA verificadas por inspección local del
  // repositorio hermano (solo lectura de árbol y estilos, sin edición):
  // config blocks/channels/coverage/features, estilos tokens/global con
  // Manrope + Source Sans 3, públicos coverage-interaction/hero-urban/icons.
  const MARCA_EFECTIVA = [/puerta abierta/i, /puerta-abierta/i, /puerta_abierta/i, /PUERTA_ABIERTA/];
  const RECURSOS_PA = [
    "Manrope",
    "Source Sans",
    "tokens.css",
    "global.css",
    "blocks.ts",
    "channels.ts",
    "coverage.ts",
    "features.ts",
    "coverage-interaction",
    "coverage-map",
    "hero-urban",
  ];

  it("código efectivo sin marca, fuentes, estilos ni módulos de PA", () => {
    // Nota: los .md de src son documentación, no código: la mención
    // nominativa en prosa ("distintas de las de la otra marca") es
    // diferenciación legítima, no dependencia. Aquí se barren ficheros
    // de código (.astro/.ts/.css/.js/.mjs), donde la marca no aparece
    // ni en comentarios (efectivo = sin comentarios).
    const codigo = [...caminar(SRC), ...caminar(PUBLICO)].filter((r) =>
      /\.(astro|ts|css|js|mjs)$/.test(r),
    );
    for (const ruta of codigo) {
      const ext = ruta.endsWith(".css") ? ".css" : ".astro";
      const efectivo = sinComentarios(leer(ruta), ext);
      const rel = relative(RAIZ, ruta);
      for (const patron of MARCA_EFECTIVA) {
        assert.ok(!patron.test(efectivo), `${rel}: sin marca ${patron}`);
      }
      for (const recurso of RECURSOS_PA) {
        assert.ok(!efectivo.includes(recurso), `${rel}: sin recurso PA «${recurso}»`);
      }
      assert.ok(!/from ["'][^"']*puerta[^"']*["']/i.test(efectivo), `${rel}: sin imports de PA`);
    }
  });

  it("documentación .md: mención nominativa sin rutas ni recursos de PA", () => {
    // La prosa puede nombrar la otra marca para diferenciarse (p. ej.
    // fonts/README.md); lo prohibido son rutas, imports y recursos.
    const docs = [...caminar(SRC), ...caminar(PUBLICO)].filter((r) => /\.md$/i.test(r));
    assert.ok(docs.length >= 1, "documentación local presente");
    for (const ruta of docs) {
      const texto = leer(ruta);
      const rel = relative(RAIZ, ruta);
      for (const recurso of RECURSOS_PA) {
        assert.ok(!texto.includes(recurso), `${rel}: sin recurso PA «${recurso}»`);
      }
      assert.ok(!/from ["'][^"']*puerta[^"']*["']/i.test(texto), `${rel}: sin imports de PA`);
      assert.ok(!/\]\(.*puerta.*\)/i.test(texto), `${rel}: sin enlaces a PA`);
    }
  });

  it("dist sin marca, fuentes, estilos ni recursos de PA", () => {
    for (const ruta of caminar(DIST)) {
      const texto = textoDist(ruta);
      if (texto === null) continue;
      const rel = relative(RAIZ, ruta);
      for (const patron of MARCA_EFECTIVA) {
        assert.ok(!patron.test(texto), `${rel}: sin marca ${patron}`);
      }
      for (const recurso of RECURSOS_PA) {
        assert.ok(!texto.includes(recurso), `${rel}: sin recurso PA «${recurso}»`);
      }
    }
  });

  it("una sola app y un solo lockfile: sin app ni cerrojos ajenos", () => {
    const apps = readdirSync(join(RAIZ_REPO, "apps"));
    assert.deepEqual(apps, ["oterco"], "una sola app OTERCO");
    assert.ok(existsSync(join(RAIZ_REPO, "pnpm-lock.yaml")), "lockfile único en la raíz");
    assert.ok(!existsSync(join(RAIZ, "pnpm-lock.yaml")), "sin lockfile propio en la app");
    assert.ok(!existsSync(join(RAIZ, "package-lock.json")), "sin lockfile npm en la app");
    const restos = caminar(RAIZ).filter((r) => /puerta.?abierta/i.test(r));
    assert.deepEqual(restos, [], "sin rutas de PA dentro de apps/oterco");
  });
});

/* OT-Q003 — Lockfile auténtico y versiones registradas (copia limpia: skip). */
describe("OT-Q003 reproducibilidad del lockfile", () => {
  it("pin de gestor y versiones del stack coherentes con lo registrado", () => {
    const raizPkg = JSON.parse(leer(join(RAIZ_REPO, "package.json")));
    assert.equal(raizPkg.packageManager, "pnpm@11.26.0", "packageManager fijado");
    const appPkg = JSON.parse(leer(join(RAIZ, "package.json")));
    assert.equal(appPkg.dependencies.astro, "5.15.9", "astro fijado en la app");
    assert.equal(appPkg.devDependencies["@astrojs/check"], "0.9.6", "@astrojs/check fijado");
    assert.equal(appPkg.devDependencies.typescript, "5.9.3", "typescript fijado");
    const lock = leer(join(RAIZ_REPO, "pnpm-lock.yaml"));
    assert.ok(lock.includes("astro@5.15.9"), "lockfile resuelve astro 5.15.9");
    assert.ok(lock.includes("apps/oterco:"), "lockfile cubre el importador apps/oterco");
    const versiones = leer(join(RAIZ_REPO, "docs", "implementacion", "VERSIONES.md"));
    for (const v of ["5.15.9", "0.9.6", "5.9.3"]) {
      assert.ok(versiones.includes(v), `VERSIONES.md registra ${v}`);
    }
  });

  it("gestor en ejecución coincide con el pin", () => {
    const version = execFileSync("pnpm", ["--version"], { encoding: "utf-8" }).trim();
    assert.equal(version, "11.26.0", "pnpm local = pin del repo");
  });

  it("reinstalación en copia totalmente limpia (borrado de node_modules)", {
    skip: "honesto: requiere borrar node_modules y red al registro; precedente OT-01: queda al operador/CI",
  }, () => {
    // `pnpm install --frozen-lockfile` en un clon sin node_modules debe
    // terminar con exit 0. No ejecutable aquí por política de red/operación.
  });
});

/* OT-Q004 — astro check integrado en el pipeline (cableado; el run vive en REPORTE). */
describe("OT-Q004 astro check cableado en el pipeline", () => {
  it("scripts de app y raíz exponen check con astro check", () => {
    const appPkg = JSON.parse(leer(join(RAIZ, "package.json")));
    assert.equal(appPkg.scripts.check, "astro check", "app: pnpm check → astro check");
    assert.equal(appPkg.scripts.test, "node --test tests/", "app: pnpm test → runner estándar");
    const raizPkg = JSON.parse(leer(join(RAIZ_REPO, "package.json")));
    assert.ok(/oterco check/.test(raizPkg.scripts.check), "raíz: check delega a la app");
  });

  it("TypeScript estricto heredado de Astro y activado", () => {
    const ts = JSON.parse(leer(join(RAIZ, "tsconfig.json")));
    assert.equal(ts.extends, "astro/tsconfigs/strict", "base estricta de Astro");
    assert.equal(ts.compilerOptions.strict, true, "strict activado");
  });
});

/* OT-Q009 — Un cambio de texto/foto/token se limita a su archivo. */
describe("OT-Q009 localización estructural del cambio", () => {
  // Espejos documentados con test de paridad (no son fugas):
  // - content/perfil.esperado.ts: estructurales para H1 confirmable;
  // - assets/resources.ts: huellas documentales (alt originales nunca publicados);
  // - tools/preparador/motor.ts: espejo del catálogo (CATALOGO ≡ crearCatalogo).
  const PERMITIDOS = new Set([
    "src/content/perfil.datos.ts",
    "src/content/perfil.esperado.ts",
    "src/assets/resources.ts",
    "src/tools/preparador/motor.ts",
  ]);
  const LITERALES = [
    "Hacienda Beraka",
    "Hacienda Puerta Roja",
    "Animales de ceba terminados",
    "Hembras de reemplazo",
    "Pastaje y levante por contrato",
    "Novillos y hembras de descarte",
    "Montes de María",
    "Ganadería de cría y ceba",
    "Departamentos de Sucre",
  ];

  it("los literales de contenido solo viven en datos y espejos declarados", () => {
    const archivos = caminar(SRC).filter((r) => /\.(astro|ts|css)$/.test(r));
    for (const literal of LITERALES) {
      const donde = archivos
        .filter((r) => leer(r).includes(literal))
        .map((r) => relative(RAIZ, r))
        .sort();
      assert.ok(donde.includes("src/content/perfil.datos.ts"), `«${literal}» nace en perfil.datos.ts`);
      for (const f of donde) {
        assert.ok(PERMITIDOS.has(f), `«${literal.slice(0, 32)}…» solo en espejo declarado, no en ${f}`);
      }
    }
  });

  it("la capa de render (páginas, componentes, layouts) no duplica contenido", () => {
    const render = caminar(SRC).filter((r) =>
      /\.(astro)$/.test(r) && /pages|components|layouts/.test(relative(RAIZ, r)),
    );
    assert.ok(render.length >= 5, "capa de render presente");
    for (const ruta of render) {
      const texto = leer(ruta);
      for (const literal of LITERALES) {
        assert.ok(!texto.includes(literal), `${relative(RAIZ, ruta)}: sin duplicar «${literal.slice(0, 32)}…»`);
      }
    }
  });

  it("el pipeline de validación existe para el archivo de datos", () => {
    const pagina = leer(join(SRC, "pages", "index.astro"));
    assert.ok(pagina.includes("proyeccionPublica(perfilBase)"), "la página consume la proyección, no literales");
    assert.ok(statSync(join(RAIZ, "tests", "perfil.test.mjs")).size > 0, "validación de perfil presente");
  });
});
