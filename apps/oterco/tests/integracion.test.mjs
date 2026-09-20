/**
 * OT-09 — Integración funcional sobre el sitio COMPILADO (OT-Q040/Q041/Q035
 * coherence, anclas, emisión 404, con/sin JavaScript, preparador deshabilitado).
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 *
 * Consume dist/ (no las fuentes ni `astro dev`): E2E local. Requiere
 * `pnpm build` previo; si dist falta, falla con mensaje explícito.
 *
 * Ángulo de integración (no repite el unitario de cada unidad):
 * - las páginas compiladas existen y son coherentes entre sí (anclas,
 *   enlaces de repliegue, títulos distintos, mismo idioma);
 * - robots/sitemap/noindex/CSP son coherentes entre artefactos;
 * - la emisión HTTP local da 200 en rutas conocidas y 404 real en
 *   desconocidas, incluida `/privacidad/` con y sin barra final;
 * - sin JavaScript la navegación es completa (0 scripts en todo dist);
 * - con JavaScript no hay divergencia posible (dist sin scripts: el
 *   "con JS" es idéntico al "sin JS"; E2E con navegador real → OT-10);
 * - el preparador deshabilitado no deja recursos en ninguna página.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import { PREPARADOR_ENABLED } from "../src/tools/preparador/index.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RAIZ, "dist");
const INDEX = join(DIST, "index.html");
const PRIV = join(DIST, "privacidad", "index.html");
const NOTFOUND = join(DIST, "404.html");
const ROBOTS = join(DIST, "robots.txt");
const SITEMAP = join(DIST, "sitemap.xml");
const HEADERS = join(DIST, "_headers");
const FAVICON = join(DIST, "favicon.svg");

assert.ok(existsSync(INDEX), "dist/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");
assert.ok(existsSync(PRIV), "dist/privacidad/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");
assert.ok(existsSync(NOTFOUND), "dist/404.html existe: ejecutar `pnpm build` antes de `pnpm test`");

const index = readFileSync(INDEX, "utf-8");
const privacidad = readFileSync(PRIV, "utf-8");
const notfound = readFileSync(NOTFOUND, "utf-8");
const robots = readFileSync(ROBOTS, "utf-8");
const sitemap = readFileSync(SITEMAP, "utf-8");
const headers = readFileSync(HEADERS, "utf-8");

const PAGINAS = [
  { nombre: "portada", html: index },
  { nombre: "privacidad", html: privacidad },
  { nombre: "404", html: notfound },
];

/** id → ocurrencias en un documento. */
function idsDe(html) {
  const mapa = new Map();
  for (const m of html.matchAll(/\sid="([^"]+)"/gi)) {
    mapa.set(m[1], (mapa.get(m[1]) ?? 0) + 1);
  }
  return mapa;
}

/** Enlaces <a href> de un documento. */
function enlacesDe(html) {
  const enlaces = [];
  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = m[1];
    enlaces.push({
      href: /href="([^"]*)"/i.exec(attrs)?.[1] ?? null,
      pendiente: /data-estado="pendienteAP"/.test(attrs),
    });
  }
  return enlaces;
}

const tituloDe = (html) => /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? "";

/* Páginas compiladas disponibles y diferenciadas. */
describe("OT-09 páginas compiladas disponibles", () => {
  it("index, privacidad y 404 existen con html lang=es y títulos propios", () => {
    for (const p of PAGINAS) {
      assert.ok(/<html[^>]*lang="es"/.test(p.html), `${p.nombre}: lang es`);
      assert.ok(tituloDe(p.html).length > 0, `${p.nombre}: título no vacío`);
    }
    const titulos = new Set(PAGINAS.map((p) => tituloDe(p.html)));
    assert.equal(titulos.size, 3, "tres títulos distintos (portada, privacidad, 404)");
  });

  it("artefactos públicos emitidos: robots, sitemap, _headers y favicon", () => {
    for (const [ruta, nombre] of [[ROBOTS, "robots"], [SITEMAP, "sitemap"], [HEADERS, "_headers"], [FAVICON, "favicon"]]) {
      assert.ok(existsSync(ruta), `dist emite ${nombre}`);
    }
    assert.ok(robots.includes("Disallow: /"), "robots cierra el rastreo");
    assert.ok(sitemap.includes("<urlset"), "sitemap con urlset");
    assert.ok(headers.includes("Content-Security-Policy:"), "_headers con CSP");
  });
});

/* Anclas y enlaces: resolución intra-documento y repliegues entre páginas. */
describe("OT-09 anclas internas y repliegues entre páginas", () => {
  it("toda ancla #id resuelve a un id único del mismo documento (3 páginas)", () => {
    for (const p of PAGINAS) {
      const ids = idsDe(p.html);
      for (const e of enlacesDe(p.html)) {
        assert.ok(e.href, `${p.nombre}: enlace con href`);
        if (e.href.startsWith("#")) {
          assert.ok(e.href.length > 1, `${p.nombre}: sin href="#" vacío`);
          const id = e.href.slice(1);
          assert.ok(ids.has(id), `${p.nombre}: destino existente ${e.href}`);
          assert.equal(ids.get(id), 1, `${p.nombre}: id único ${id}`);
        }
      }
    }
  });

  it("la portada enlaza sus capítulos y el índice coincide con las secciones", () => {
    const ids = idsDe(index);
    for (const seccion of ["portafolio", "fincas", "manejo", "infraestructura", "cierre", "contenido"]) {
      assert.ok(ids.has(seccion), `sección/ancla #${seccion} presente`);
      assert.ok(index.includes(`href="#${seccion}"`), `enlace a #${seccion} presente`);
    }
    const nav = /<nav[^>]*aria-label="Índice editorial"[\s\S]*?<\/nav>/.exec(index)?.[0] ?? "";
    assert.ok(nav.length > 0, "índice editorial presente");
    for (const destino of ["#portafolio", "#fincas", "#manejo", "#infraestructura", "#cierre"]) {
      assert.ok(nav.includes(`href="${destino}"`), `índice enlaza ${destino}`);
    }
  });

  it("privacidad y 404 repliegan al inicio con href=/ y el skip-link resuelve", () => {
    assert.ok(privacidad.includes('href="/"'), "privacidad repliega a /");
    assert.ok(notfound.includes('<a href="/">Volver al inicio</a>'), "404 con enlace útil a /");
    for (const [p, nombre] of [[index, "portada"], [privacidad, "privacidad"]]) {
      assert.ok(/class="skip-link"[^>]*href="#contenido"/.test(p), `${nombre}: skip-link a #contenido`);
      assert.ok(/<main[^>]*id="contenido"/.test(p), `${nombre}: main#contenido destino del salto`);
    }
  });

  it("sin destinos remotos ni vacíos en las tres páginas", () => {
    for (const p of PAGINAS) {
      for (const e of enlacesDe(p.html)) {
        assert.ok(!/^https?:\/\//.test(e.href ?? ""), `${p.nombre}: sin href remoto ${e.href}`);
        assert.ok(e.href !== "#", `${p.nombre}: sin ancla vacía`);
        assert.ok(!/^javascript:/i.test(e.href ?? ""), `${p.nombre}: sin javascript:`);
      }
    }
  });
});

/* Coherencia entre artefactos: noindex ⟺ robots ⟺ sitemap ⟺ CSP. */
describe("OT-09 coherencia noindex/robots/sitemap/CSP", () => {
  it("las tres páginas son noindex mientras robots cierra y sitemap va vacío", () => {
    for (const p of PAGINAS) {
      assert.ok(/<meta[^>]*name="robots"[^>]*noindex, nofollow/.test(p.html), `${p.nombre}: noindex técnico`);
    }
    assert.ok(/^Disallow: \/$/m.test(robots), "robots: cierre total coherente con noindex");
    assert.ok(!/<url>/.test(sitemap), "sitemap: sin <url> mientras noindex");
  });

  it("CSP cero-scripts coherente con 0 scripts en todo el dist emitido", () => {
    assert.ok(headers.includes("script-src 'none'"), "CSP declara cero scripts");
    for (const p of PAGINAS) {
      assert.ok(!/<script[\s>]/i.test(p.html), `${p.nombre}: sin <script>`);
    }
  });
});

/* Emisión HTTP local: 200 en conocidas, 404 real en desconocidas. */
describe("OT-09 emisión local con códigos reales (127.0.0.1)", () => {
  const TIPOS = {
    ".html": "text/html",
    ".txt": "text/plain",
    ".xml": "application/xml",
    ".svg": "image/svg+xml",
    ".css": "text/css",
  };

  function crearServidor() {
    const servir = (rutaFs, estado, res) => {
      const cuerpo = readFileSync(rutaFs);
      const ext = rutaFs.slice(rutaFs.lastIndexOf("."));
      res.writeHead(estado, { "content-type": `${TIPOS[ext] ?? "application/octet-stream"}; charset=utf-8` });
      res.end(cuerpo);
    };
    return http.createServer((req, res) => {
      const ruta = (req.url ?? "/").split("?")[0];
      const limpio = decodeURIComponent(ruta);
      if (limpio === "/" || limpio === "/index.html") return servir(INDEX, 200, res);
      if (limpio === "/privacidad" || limpio === "/privacidad/") return servir(PRIV, 200, res);
      const candidato = join(DIST, limpio.replace(/^\/+/, ""));
      if (existsSync(candidato) && !limpio.endsWith("/")) return servir(candidato, 200, res);
      return servir(NOTFOUND, 404, res);
    });
  }

  async function conServidor(fn) {
    const servidor = crearServidor();
    await new Promise((listo) => servidor.listen(0, "127.0.0.1", listo));
    try {
      const puerto = servidor.address().port;
      const pedir = (ruta) =>
        new Promise((resuelve, rechaza) => {
          http
            .get({ host: "127.0.0.1", port: puerto, path: ruta }, (res) => {
              let cuerpo = "";
              res.on("data", (c) => (cuerpo += c));
              res.on("end", () =>
                resuelve({ estado: res.statusCode, cuerpo, tipo: res.headers["content-type"] ?? "" }),
              );
            })
            .on("error", rechaza);
        });
      await fn(pedir);
    } finally {
      await new Promise((listo) => servidor.close(listo));
    }
  }

  it("raíz y privacidad responden 200 con su contenido", async () => {
    await conServidor(async (pedir) => {
      const raiz = await pedir("/");
      assert.equal(raiz.estado, 200, "/ → 200");
      assert.ok(raiz.tipo.includes("text/html"), "raíz como HTML");
      assert.ok(raiz.cuerpo.includes("<h1"), "raíz con H1");
      for (const ruta of ["/privacidad", "/privacidad/"]) {
        const pag = await pedir(ruta);
        assert.equal(pag.estado, 200, `${ruta} → 200`);
        assert.ok(pag.cuerpo.includes("<h1>Privacidad y datos</h1>"), `${ruta} sirve privacidad`);
      }
      const txt = await pedir("/robots.txt");
      assert.equal(txt.estado, 200, "robots → 200");
      assert.ok(txt.cuerpo.includes("Disallow: /"), "robots servido");
    });
  });

  it("rutas inexistentes responden 404 con el cuerpo del 404", async () => {
    await conServidor(async (pedir) => {
      for (const ruta of ["/ruta-inexistente-ot09-xyz", "/privacidad/no-existe", "/portafolio"]) {
        const r = await pedir(ruta);
        assert.equal(r.estado, 404, `${ruta} → 404 real`);
        assert.ok(r.cuerpo.includes("Página no encontrada (404)"), `${ruta} con cuerpo del 404`);
      }
    });
  });
});

/* Sin JavaScript: navegación completa con 0 scripts. */
describe("OT-09 sin JavaScript: navegación completa", () => {
  it("cero scripts y cero manejadores en línea en las tres páginas", () => {
    for (const p of PAGINAS) {
      assert.ok(!/<script[\s>]/i.test(p.html), `${p.nombre}: sin <script>`);
      assert.ok(!/\son(click|load|error|submit|keydown|keyup|change|input)=/i.test(p.html), `${p.nombre}: sin manejadores en línea`);
      assert.ok(!/<meta[^>]*http-equiv="refresh"/i.test(p.html), `${p.nombre}: sin refresco`);
    }
  });

  it("índice plegable nativo y contenido de contacto/portafolio en estático", () => {
    assert.ok(/<details>[\s\S]*?<summary[^>]*>Índice<\/summary>/.test(index), "índice <details> sin JS");
    for (const id of ["portafolio", "cierre"]) {
      assert.ok(new RegExp(`id="${id}"`).test(index), `#${id} en el HTML estático`);
    }
    assert.ok(index.includes("Contacto pendiente de aprobación"), "cierre visible sin JS");
    assert.ok(index.includes("Sin JavaScript: esta página no incluye ningún script."), "aviso no-JS declarado");
  });
});

/* Con JavaScript: registro honesto — dist sin scripts, sin divergencia posible. */
describe("OT-09 con JavaScript: sin divergencia (registro honesto)", () => {
  it("dist sin puntos de montaje: no hay divergencia posible (E2E → OT-10)", () => {
    for (const p of PAGINAS) {
      assert.ok(!/type="module"/.test(p.html), `${p.nombre}: sin módulos`);
      assert.ok(!/data-preparador/.test(p.html), `${p.nombre}: sin raíces de montaje`);
      assert.ok(!/<noscript>/.test(p.html), `${p.nombre}: sin <noscript> huérfano (el del módulo no se emite apagado)`);
    }
    // E2E con navegador real (nodo con JS habilitado, teclado, foco visible)
    // no es ejecutable en esta unidad: pendiente OT-10/OT-12. Este test deja
    // constancia de que hoy no hay nada que el JS pueda cambiar en dist.
  });
});

/* Preparador deshabilitado: ninguna página publica sus recursos. */
describe("OT-09 preparador deshabilitado en toda la emisión", () => {
  it("flag apagado y dist sin ancla, marcas, mailto ni teléfono", () => {
    assert.equal(PREPARADOR_ENABLED, false, "PREPARADOR_ENABLED === false");
    for (const p of PAGINAS) {
      assert.ok(!/preparar-consulta/.test(p.html), `${p.nombre}: sin ancla del preparador`);
      assert.ok(!/data-preparador/.test(p.html), `${p.nombre}: sin marcas del módulo`);
      assert.ok(!/mailto:/i.test(p.html), `${p.nombre}: sin mailto`);
      assert.ok(!/tel:/i.test(p.html), `${p.nombre}: sin teléfono`);
      assert.ok(!/whatsapp|telegram|signal/i.test(p.html), `${p.nombre}: sin mensajería`);
    }
  });
});
