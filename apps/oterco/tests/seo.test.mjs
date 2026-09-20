/**
 * OT-08 — SEO y configuración pública (OT-Q035, OT-Q036, OT-Q040, OT-Q041, OT-Q043).
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 *
 * Consume el compilado (dist/), no solo las fuentes: E2E local. Requiere
 * `pnpm build` previo; si dist falta, falla con mensaje explícito.
 * La lógica de entornos se prueba como unidad pura sobre `src/config/publico.ts`
 * (type-stripping de Node 26, como en OT-07); el perfil comercial es un clon
 * sintético de test, no un dato aprobado.
 *
 * OT-Q040: título/descripción/robots/JSON-LD propios y coherentes, canonical
 *   placeholder bien marcado, robots/sitemap según entorno.
 * OT-Q041: 404.html estático real (sin fallback SPA) + emisión 404 local.
 * OT-Q043: dist sin secretos, sin opencode, sin sourcemaps ni internos.
 * OT-Q035: contacto deshabilitado (sin buzón/teléfono/mensajería publicados).
 * OT-Q036: privacidad fiel a canales/proveedores reales, sin banner decorativo.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import {
  BASE_RESERVADA,
  DESCRIPCION_TECNICA,
  MARCA_PENDIENTE_AP,
  ROBOTS_TECNICO,
  RUTAS_PUBLICAS,
  TITULO_TECNICO,
  construirJsonLd,
  descripcionComercial,
  generarHeaders,
  generarRobots,
  generarSitemap,
  jsonLdParaPagina,
  metadatosPara,
  resolverEntorno,
  tituloComercial,
} from "../src/config/publico.ts";
import { proyeccionPublica } from "../src/config/publicacion.ts";
import { perfilBase } from "../src/content/perfil.datos.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RAIZ, "dist");
const INDEX = join(DIST, "index.html");
const NOTFOUND = join(DIST, "404.html");
const ROBOTS = join(DIST, "robots.txt");
const SITEMAP = join(DIST, "sitemap.xml");
const HEADERS = join(DIST, "_headers");

assert.ok(existsSync(INDEX), "dist/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");
assert.ok(existsSync(NOTFOUND), "dist/404.html existe: ejecutar `pnpm build` antes de `pnpm test`");

const html = readFileSync(INDEX, "utf-8");
const notfound = readFileSync(NOTFOUND, "utf-8");
const robots = readFileSync(ROBOTS, "utf-8");
const sitemap = readFileSync(SITEMAP, "utf-8");
const headers = readFileSync(HEADERS, "utf-8");

/** dist/privacidad/index.html (formato directorio de Astro) o dist/privacidad.html. */
function rutaPrivacidad() {
  const porDirectorio = join(DIST, "privacidad", "index.html");
  if (existsSync(porDirectorio)) return porDirectorio;
  return join(DIST, "privacidad.html");
}

const RUTA_PRIV = rutaPrivacidad();
assert.ok(existsSync(RUTA_PRIV), "dist de privacidad existe: ejecutar `pnpm build` antes de `pnpm test`");
const privacidad = readFileSync(RUTA_PRIV, "utf-8");

/** Clon sintético con NIT+contacto aprobados: SOLO para probar la rama comercial. */
function perfilComercialSintetico() {
  const clon = structuredClone(perfilBase);
  clon.identidad.nit.estado = "aprobado";
  clon.contacto.estado = "aprobado";
  clon.contacto.verificado = true;
  clon.aprobaciones = [
    {
      responsable: "OT-08 fixture de prueba (no es aprobación real)",
      fecha: "2026-09-20",
      alcance: ["nit", "contacto"],
      documento: "tests/seo.test.mjs",
      observaciones: "",
    },
  ];
  return clon;
}

/** Ficheros de texto de dist (recursivo) para el barrido Q043. */
function textosDist(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) textosDist(p, acc);
    else if (/\.(html|txt|xml|css|js|json|webmanifest|svg)$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

/* OT-Q040 — Metadatos propios, coherentes y canonical pendienteAP. */
describe("OT-Q040 metadatos, canonical, robots y sitemap", () => {
  it("entorno técnico desde la puerta: perfilBase sin aprobaciones", () => {
    assert.equal(resolverEntorno(perfilBase), "tecnico");
  });

  it("head técnico: title/description/robots fixture y canonical pendiente sin URL real", () => {
    const meta = metadatosPara("tecnico", perfilBase);
    assert.equal(meta.titulo, TITULO_TECNICO);
    assert.equal(meta.descripcion, DESCRIPCION_TECNICA);
    assert.equal(meta.robots, ROBOTS_TECNICO);
    assert.equal(meta.canonical, null);
    assert.ok(meta.motivoCanonical.includes(MARCA_PENDIENTE_AP));
    assert.ok(html.includes(`<title>${TITULO_TECNICO}</title>`), "dist usa el título técnico único");
    assert.ok(html.includes(DESCRIPCION_TECNICA), "dist usa la descripción técnica única");
    assert.ok(/<meta[^>]*name="robots"[^>]*noindex, nofollow/.test(html), "noindex técnico");
    assert.ok(/canonical pendienteAP/.test(html), "canonical pendienteAP declarado");
    assert.ok(!/<link[^>]*rel="canonical"[^>]*href="https?:\/\//.test(html), "sin canonical con URL real");
  });

  it("head local: favicon propio + OpenGraph mínimo sin URL/imagen reales", () => {
    assert.ok(html.includes('<link rel="icon" href="/favicon.svg" type="image/svg+xml"'), "favicon local");
    assert.ok(existsSync(join(DIST, "favicon.svg")), "favicon emitido a dist");
    assert.ok(html.includes(`<meta property="og:title" content="${TITULO_TECNICO}"`), "og:title = título actual");
    assert.ok(html.includes(`<meta property="og:description" content="${DESCRIPCION_TECNICA}"`), "og:description = descripción actual");
    assert.ok(html.includes('<meta property="og:type" content="website"'), "og:type local");
    assert.ok(!/<meta[^>]*property="og:(url|image)"/.test(html), "sin og:url/og:image hasta dominio y fotos aprobados");
  });

  it("rama comercial sin dominio: titulo/descripción reales sin promesas, canonical sigue pendiente", () => {
    const sintetico = perfilComercialSintetico();
    assert.equal(resolverEntorno(sintetico), "comercial");
    const proyeccion = proyeccionPublica(sintetico);
    const titulo = tituloComercial(proyeccion);
    const descripcion = descripcionComercial(proyeccion);
    assert.ok(titulo.includes(proyeccion.razonSocial), "título con razón social real");
    assert.ok(titulo.includes(proyeccion.perfil), "título con perfil real");
    assert.ok(!/fixture/i.test(titulo), "título comercial sin marca fixture");
    assert.ok(descripcion.includes(proyeccion.region), "descripción con región real");
    assert.ok(!/(mejor|garant|certific|precio|disponib)/i.test(`${titulo} ${descripcion}`), "sin promesas");
    const meta = metadatosPara("comercial", sintetico);
    assert.equal(meta.canonical, null, "sin dominio aprobado no hay canonical real");
    assert.ok(meta.motivoCanonical.includes(MARCA_PENDIENTE_AP));
    assert.ok(meta.robots.includes("noindex"), "sin dominio aprobado se conserva noindex");
  });

  it("JSON-LD técnico: ausente en página; unidad solo con datos aprobados", () => {
    assert.equal(jsonLdParaPagina("tecnico", perfilBase), null, "técnico sin bloque en página");
    const grafo = construirJsonLd(proyeccionPublica(perfilBase));
    assert.equal(grafo["@type"], "Organization");
    assert.ok(!("email" in grafo), "sin email sin aprobar");
    assert.ok(!("identifier" in grafo), "sin NIT sin aprobar");
    assert.equal(grafo.location.length, 2, "dos fincas como Place en location");
    const texto = JSON.stringify(grafo);
    assert.ok(!texto.includes("11.6"), "sin solar en conflicto");
    assert.ok(!texto.includes("830"), "sin NIT sin confirmar");
    assert.ok(!texto.includes("contacto@"), "sin buzón sin verificar");
    assert.ok(!/Farm/i.test(texto), "sin tipo Farm inventado (schema.org no lo define)");
  });

  it("JSON-LD comercial sintético: email+NIT aprobados entran, solar sigue fuera", () => {
    const grafo = jsonLdParaPagina("comercial", perfilComercialSintetico());
    assert.ok(grafo !== null, "comercial con bloque");
    assert.equal(grafo.email, "contacto@oterco.com.co");
    assert.equal(grafo.identifier, "830.128.652-4");
    assert.ok(!JSON.stringify(grafo).includes("11.6"), "solar pendiente sigue fuera");
  });

  it("robots técnico generado: cierre total sobre base reservada marcada", () => {
    assert.equal(robots.trim(), generarRobots("tecnico").trim(), "dist coincide con la fuente única");
    assert.ok(/^User-agent: \*/m.test(robots), "directiva de agente");
    assert.ok(/^Disallow: \/$/m.test(robots), "cierre total coherente con noindex");
    assert.ok(robots.includes(BASE_RESERVADA), "base reservada referenciada");
    assert.ok(robots.includes(MARCA_PENDIENTE_AP), "pendienteAP marcado");
    assert.ok(!robots.includes("com.co"), "ningún dominio real inventado");
  });

  it("sitemap técnico: vacío (sin <url>) mientras noindex, fixture no vinculante", () => {
    assert.equal(sitemap.trim(), generarSitemap(RUTAS_PUBLICAS).trim(), "dist coincide con la fuente única");
    assert.ok(/<urlset[^>]*sitemap/.test(sitemap), "urlset válido");
    assert.ok(!/<url>/.test(sitemap), "sin <url> mientras noindex (no sugerir sitio rastreable)");
    assert.ok(sitemap.includes(BASE_RESERVADA), "base reservada declarada solo en el comentario");
    assert.ok(sitemap.includes(MARCA_PENDIENTE_AP), "pendienteAP marcado");
    assert.ok(!sitemap.includes("com.co"), "ningún dominio real inventado");
  });

  it("cabeceras generadas: CSP restrictiva, anti-mime y cache por destino", () => {
    assert.equal(headers.trim(), generarHeaders().trim(), "dist/_headers coincide con la fuente única");
    assert.ok(headers.includes("X-Content-Type-Options: nosniff"), "nosniff");
    assert.ok(headers.includes("Referrer-Policy:"), "referrer-policy");
    assert.ok(headers.includes("Permissions-Policy:"), "permissions-policy");
    assert.ok(headers.includes("script-src 'none'"), "CSP cero scripts");
    assert.ok(headers.includes("frame-ancestors"), "frame-ancestors");
    assert.ok(headers.includes("max-age=31536000, immutable"), "inmutable solo en /_astro/*");
    assert.ok(headers.includes("max-age=0, must-revalidate"), "HTML mutable con revalidación");
    assert.ok(!/unsafe-(inline|eval)/.test(headers), "sin aperturas inseguras");
  });

  it("privacidad con metadatos propios distintos de la portada", () => {
    const titulo = /<title>([^<]+)<\/title>/.exec(privacidad)?.[1] ?? "";
    assert.ok(titulo.includes("Privacidad"), "título propio");
    assert.ok(titulo !== TITULO_TECNICO, "distinto del de la portada");
    assert.ok(/<meta[^>]*name="robots"[^>]*noindex/.test(privacidad), "privacidad técnica noindex");
  });
});

/* OT-Q041 — 404 real, estático, sin fallback SPA. */
describe("OT-Q041 ruta inexistente con 404 real", () => {
  it("404.html estático: noindex, H1 propio, enlace útil, sin ejecutables ni refresco", () => {
    assert.ok(/<meta[^>]*name="robots"[^>]*noindex/.test(notfound), "404 noindex");
    assert.ok(/<h1[^>]*>Página no encontrada \(404\)<\/h1>/.test(notfound), "H1 propio");
    assert.ok(notfound.includes('<a href="/">Volver al inicio</a>'), "enlace útil al inicio");
    assert.ok(!/<script[\s>]/i.test(notfound), "sin elementos ejecutables");
    assert.ok(!/<meta[^>]*http-equiv="refresh"/i.test(notfound), "sin redirección por refresco");
    assert.ok(!/single-page|spa-fallback|history\.pushState/i.test(notfound), "sin fallback de SPA");
    assert.ok(/canonical pendienteAP/.test(notfound), "canonical pendienteAP declarado");
  });

  it("emisión local: ruta inexistente responde 404 y la raíz 200 (humo, 127.0.0.1)", async () => {
    const tipos = { ".html": "text/html", ".txt": "text/plain", ".xml": "application/xml" };
    const servir = (rutaFs, estado, res) => {
      const cuerpo = readFileSync(rutaFs);
      const ext = rutaFs.slice(rutaFs.lastIndexOf("."));
      res.writeHead(estado, { "content-type": `${tipos[ext] ?? "application/octet-stream"}; charset=utf-8` });
      res.end(cuerpo);
    };
    const servidor = http.createServer((req, res) => {
      const ruta = (req.url ?? "/").split("?")[0];
      if (ruta === "/" || ruta === "/index.html") return servir(INDEX, 200, res);
      const candidato = join(DIST, decodeURIComponent(ruta).replace(/^\/+/, ""));
      if (existsSync(candidato) && !ruta.endsWith("/")) return servir(candidato, 200, res);
      return servir(NOTFOUND, 404, res);
    });
    await new Promise((listo) => servidor.listen(0, "127.0.0.1", listo));
    try {
      const puerto = servidor.address().port;
      const pedir = (ruta) =>
        new Promise((resuelve, rechaza) => {
          http
            .get({ host: "127.0.0.1", port: puerto, path: ruta }, (res) => {
              let cuerpo = "";
              res.on("data", (c) => (cuerpo += c));
              res.on("end", () => resuelve({ estado: res.statusCode, cuerpo }));
            })
            .on("error", rechaza);
        });
      const raiz = await pedir("/");
      assert.equal(raiz.estado, 200, "raíz 200");
      assert.ok(raiz.cuerpo.includes(TITULO_TECNICO), "raíz sirve la portada");
      const inexistente = await pedir("/ruta-inexistente-ot08-xyz");
      assert.equal(inexistente.estado, 404, "ruta inexistente con 404 real");
      assert.ok(inexistente.cuerpo.includes("Página no encontrada (404)"), "cuerpo del 404 emitido");
    } finally {
      await new Promise((listo) => servidor.close(listo));
    }
  });
});

/* OT-Q043 — Sin secretos, opencode, sourcemaps ni documentos internos. */
describe("OT-Q043 dist sin secretos ni restos internos", () => {
  it("barrido de patrones prohibidos en todo dist textual", () => {
    const literales = [
      "09_FUENTES",
      "O-D0",
      "O-IMG0",
      "OT-Q",
      "11.6",
      "MW",
      "NIT",
      "contacto@",
      "data-fuente",
      "data-source",
      "830.128.652-4",
      "830.128",
      "BEGIN PRIVATE",
      ".pem",
      ".private-references",
      "inventory.json",
    ];
    const patrones = [/opencode/i, /\.map\b/, /sourcemap/i, /\.env\b/];
    for (const ruta of textosDist(DIST)) {
      const texto = readFileSync(ruta, "utf-8");
      for (const literal of literales) {
        assert.ok(!texto.includes(literal), `${ruta}: sin «${literal}»`);
      }
      for (const patron of patrones) {
        assert.ok(!patron.test(texto), `${ruta}: sin ${patron}`);
      }
    }
  });

  it("HTML sin URLs remotas reales (sitemap/robots usan solo la base reservada)", () => {
    for (const ruta of [INDEX, RUTA_PRIV, NOTFOUND]) {
      const texto = readFileSync(ruta, "utf-8");
      assert.ok(!/https?:\/\/(?!oterco-pendiente-ap\.invalid)/.test(texto), `${ruta}: sin URL remota real`);
      assert.ok(!/file:\/\//i.test(texto), `${ruta}: sin file://`);
    }
    assert.ok(sitemap.includes(BASE_RESERVADA), "sitemap sobre base reservada");
  });
});

/* OT-Q035 — Buzón por operación humana; teléfono/mensajería solo tras aprobación. */
describe("OT-Q035 contacto deshabilitado hasta aprobación", () => {
  it("portada sin canales publicados: pendienteAP, sin mailto/tel/mensajería", () => {
    assert.ok(html.includes("Contacto pendiente de aprobación"), "aviso pendienteAP");
    assert.ok(html.includes('data-estado="pendienteAP"'), "marca pendienteAP");
    assert.ok(!/mailto:/i.test(html), "sin mailto");
    assert.ok(!/tel:/i.test(html), "sin teléfono");
    assert.ok(!/whatsapp|telegram|signal/i.test(html), "sin mensajería");
  });

  it("privacidad declara canales pendientes sin publicar ninguno", () => {
    assert.ok(privacidad.includes("pendientes de aprobación"), "canales pendientes");
    assert.ok(!/mailto:/i.test(privacidad), "sin mailto");
    assert.ok(!/tel:/i.test(privacidad), "sin teléfono");
    assert.ok(privacidad.includes('href="/"'), "repliegue al inicio");
  });
});

/* OT-Q036 — Privacidad fiel a canales/proveedores reales, sin banner decorativo. */
describe("OT-Q036 privacidad sin banner y fiel al prototipo", () => {
  it("estructura propia: idioma, H1 único y secciones", () => {
    assert.ok(/<html[^>]*lang="es"/.test(privacidad), "lang es");
    assert.equal([...privacidad.matchAll(/<h1\b/gi)].length, 1, "un H1");
    assert.ok(privacidad.includes("<h1>Privacidad y datos</h1>"), "H1 propio");
    for (const seccion of ["Cookies y almacenamiento", "Canales de contacto", "Proveedores"]) {
      assert.ok(privacidad.includes(seccion), `sección «${seccion}»`);
    }
  });

  it("sin banner decorativo: declara ausencia de cookies y no monta aviso flotante", () => {
    assert.ok(/no utiliza cookies/i.test(privacidad), "declara cero cookies");
    assert.ok(/banner decorativo/.test(privacidad), "explica por qué no hay banner");
    assert.ok(!/<[^>]*\b(class|id)="[^"]*banner/i.test(privacidad), "ningún elemento banner");
    assert.ok(!/<[^>]*\b(class|id)="[^"]*consent/i.test(privacidad), "ningún elemento de consentimiento");
    assert.ok(!/<script[\s>]/i.test(privacidad), "sin elementos ejecutables");
  });

  it("proveedores reales del prototipo, sin terceros inventados", () => {
    assert.ok(/sin analítica/i.test(privacidad), "declara cero analítica");
    assert.ok(/sin servidor de aplicación/i.test(privacidad), "declara arquitectura estática");
    assert.ok(/OT-16/.test(privacidad), "humo del destino como pendiente del operador");
    assert.ok(!/google-analytics|gtag|facebook|pixel/i.test(privacidad), "sin terceros");
  });
});
