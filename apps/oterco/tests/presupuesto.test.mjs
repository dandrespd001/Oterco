/**
 * OT-11 — Presupuestos de transferencia y auditoría estática de seguridad
 * (OT-Q021, OT-Q022, OT-Q037, OT-Q038, OT-Q042, OT-Q043, OT-Q050).
 *
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 * Consume `scripts/medir.mjs` (método gzip registrado) y valida dist
 * compilado. Requiere `pnpm build` previo; si dist falta, falla explícito.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRESUPUESTOS,
  evaluarPresupuestos,
  medirDist,
  metodoMedicion,
} from "../scripts/medir.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RAIZ, "dist");

assert.ok(existsSync(join(DIST, "index.html")), "dist/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");

const MED = medirDist(DIST);
const EVAL = evaluarPresupuestos(MED);

function leerDist(rel) {
  return readFileSync(join(DIST, rel), "utf-8");
}

function caminar(dir, acc = []) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      if (nombre === "node_modules" || nombre === ".astro") continue;
      caminar(ruta, acc);
    } else {
      acc.push(ruta);
    }
  }
  return acc;
}

/* OT-Q037 — Transferencia inicial ≤1 000 000 B y JS inicial ≤15 000 B gzip, con método registrado. */
describe("OT-Q037 presupuestos de transferencia inicial", () => {
  it("publica el método de medición registrado", () => {
    const m = metodoMedicion();
    assert.match(m.algoritmo, /gzip/i);
    assert.match(m.herramienta, /node v\d+/);
    assert.ok(m.brotli.length > 0, "registra que no se usa Brotli");
    console.log(`    método: ${m.algoritmo} (${m.herramienta})`);
    console.log(`    portada: ${MED.portada.transferenciaInicial.crudo} B crudo / ${MED.portada.transferenciaInicial.gzip} B gzip`);
    console.log(`    JS inicial: ${MED.portada.jsInicialGzip} B gzip`);
  });

  it("transferencia inicial y JS inicial dentro de presupuesto", () => {
    for (const e of EVAL.filter((x) => x.medida.includes("inicial") && !x.medida.includes("CSS"))) {
      console.log(`    ${e.medida}: ${e.valor} ≤ ${e.limite}`);
      assert.ok(e.cumple, `${e.medida}: ${e.valor} excede ${e.limite}`);
    }
  });
});

/* OT-Q038 — Incremental del preparador ≤10 000 B gzip y CSS inicial ≤40 000; fuentes y foto medidas. */
describe("OT-Q038 incremental del preparador, CSS, fuentes y foto", () => {
  it("incremental del preparador y CSS inicial dentro de presupuesto", () => {
    for (const e of EVAL.filter((x) => x.medida.includes("preparador") || x.medida.includes("CSS"))) {
      console.log(`    ${e.medida}: ${e.valor} ≤ ${e.limite}`);
      assert.ok(e.cumple, `${e.medida}: ${e.valor} excede ${e.limite}`);
    }
    assert.equal(MED.preparador.habilitado, false, "preparador deshabilitado: 0 bytes incrementales");
  });

  it("fuentes y fotografía medidas (hoy: cero servidas, objetivos registrados)", () => {
    console.log(`    fuentes en dist: ${MED.fuentes.length ? MED.fuentes.join(", ") : "ninguna"}`);
    console.log(`    fotos en dist: ${MED.fotos.length ? MED.fotos.join(", ") : "ninguna"}`);
    assert.deepEqual(MED.fuentes, [], "tipografías aún no cableadas: 0 bytes");
    assert.deepEqual(MED.fotos, [], "sin derivados aprobados: 0 bytes");
    assert.equal(PRESUPUESTOS.fuentesObjetivoBytes, 160000);
    assert.equal(PRESUPUESTOS.fotoPrincipalObjetivoBytes, 250000);
  });
});

/* OT-Q042 — CSP/caché coherentes con los artefactos; HTML mutable sin immutable. */
describe("OT-Q042 CSP, caché y cabeceras efectivas", () => {
  const headers = leerDist("_headers");

  it("script-src 'none' sin scripts en dist", () => {
    assert.match(headers, /script-src 'none'/);
    for (const ruta of caminar(DIST)) {
      let texto;
      try {
        texto = readFileSync(ruta, "utf-8");
      } catch {
        continue;
      }
      assert.ok(!/<script[\s>]/i.test(texto), `${ruta}: sin <script>`);
    }
  });

  it("style-src implícito estricto: R1 resuelto por vía (c), sin 'unsafe-inline'", () => {
    // Sin directiva style-src, rige default-src 'self'. OT-11 resolvió la
    // tensión R1 por vía (c): los aspect-ratio ×6 viven en clases
    // .slot--WxH de base.css y la 404 perdió su <style> autónomo
    // (revertido por decisión de la coordinadora, Q042). No se abre
    // 'unsafe-inline': el criterio OT-08 lo prohíbe
    // (seo.test.mjs: «sin aperturas inseguras», intacto) y cambiarlo es
    // decisión del coordinador. Riesgo R1 cerrado en
    // docs/implementacion/OT-11/EVIDENCIA.md.
    assert.ok(!/style-src/.test(headers), "sin style-src: rige default-src 'self'");
    assert.ok(!/unsafe-(inline|eval)/.test(headers), "sin aperturas inseguras (criterio OT-08)");
    assert.ok(!/\sstyle\s*=/.test(leerDist("index.html")), "index sin style attributes (vía (c))");
    assert.ok(!/<style[\s>]/i.test(leerDist("404.html")), "404 sin <style> embebido (revertido OT-10.F4)");
  });

  it("0 style= inline en dist/*.html (Q042/CSP, vía (c))", () => {
    for (const pagina of ["index.html", "404.html", "privacidad/index.html"]) {
      const texto = leerDist(pagina);
      assert.ok(!/\sstyle\s*=/i.test(texto), `${pagina}: sin style attributes`);
      assert.ok(!/<style[\s>]/i.test(texto), `${pagina}: sin <style> embebido`);
    }
  });

  it("imágenes solo 'self' implícito y sin data: (base64 fotográfico prohibido)", () => {
    assert.ok(!/img-src/.test(headers), "sin img-src: rige default-src 'self'");
    assert.ok(!/data:image\/[a-zA-Z0-9.+-]+;base64/.test(leerDist("index.html")), "sin data: en portada");
  });

  it("HTML mutable revalida; immutable solo para hashed en _astro", () => {
    const bloques = headers.split(/^\//m).map((b) => b.trim()).filter(Boolean);
    const general = bloques.find((b) => b.startsWith("*:") || b.includes("max-age=0"));
    const astro = bloques.find((b) => b.includes("_astro"));
    assert.ok(general && /max-age=0, must-revalidate/.test(general), "HTML/mutables revalidan");
    assert.ok(!/immutable/.test(general), "bloque general sin immutable");
    assert.ok(astro && /max-age=31536000, immutable/.test(astro), "_astro/* immutable");
    for (const html of ["index.html", "404.html", "privacidad/index.html"]) {
      assert.ok(!/immutable/.test(leerDist(html)), `${html}: sin cache immutable`);
    }
  });

  it("la 404 es efectiva: existe, sin fallback SPA ni redirección", () => {
    const notFound = leerDist("404.html");
    assert.match(notFound, /Página no encontrada/);
    assert.ok(!/<script[\s>]/i.test(notFound), "404 sin scripts");
    assert.ok(!/http-equiv:\s*refresh/i.test(notFound), "404 sin redirección");
  });
});

/* OT-Q043 — Sin secretos, documentos internos, config OpenCode ni sourcemaps. */
describe("OT-Q043 dist sin secretos ni internos", () => {
  it("sin sourcemaps, .env, .pem/.key ni inventory en dist", () => {
    for (const ruta of caminar(DIST)) {
      assert.ok(!/\.map$/i.test(ruta), `${ruta}: sin sourcemap`);
      assert.ok(!/\.env(\.|$)/.test(ruta), `${ruta}: sin .env`);
      assert.ok(!/\.(pem|key)$/i.test(ruta), `${ruta}: sin certificados`);
      assert.ok(!/inventory\.json/i.test(ruta), `${ruta}: sin inventory`);
    }
  });

  it("sin documentos internos ni config OpenCode en el texto servido", () => {
    const prohibidos = [
      /\.private-references/,
      /BEGIN (?:RSA PRIVATE KEY|PRIVATE KEY|CERTIFICATE)/,
      /api[_-]?key|apikey|client[_-]?secret|D1_|CLOUDFLARE_|GOOGLE_|OPENAI_|ANTHROPIC_/i,
      /\.opencode|opencode\.json/,
    ];
    for (const ruta of caminar(DIST)) {
      let texto;
      try {
        texto = readFileSync(ruta, "utf-8");
      } catch {
        continue;
      }
      for (const p of prohibidos) {
        assert.ok(!p.test(texto), `${ruta}: patrón prohibido ${p}`);
      }
    }
  });
});

/* OT-Q050 — Nada fuera del alcance aprobado: sin API/D1/IA/CRM/autoguardado. */
describe("OT-Q050 sin API, D1, IA, CRM ni persistencia", () => {
  it("dist sin red, almacenamiento ni servicios de terceros", () => {
    const html = leerDist("index.html");
    const prohibidos = [
      /fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/i,
      /localStorage|sessionStorage|indexedDB|document\.cookie/i,
      /https?:\/\/(api|d1|.*\.workers\.dev|.*\.pages\.dev)/i,
      /gtag|google.*analytics|plausible|posthog|cloudflare.*beacon/i,
      /turnstile|recaptcha|hcaptcha/i,
      /hubspot|salesforce|mailchimp|sendgrid|openai|anthropic|gemini|groq/i,
      /dark-?mode|data-theme|autoplay/i,
    ];
    for (const p of prohibidos) {
      assert.ok(!p.test(html), `index sin ${p}`);
    }
  });

  it("preparador deshabilitado: sin mailto ni ancla en dist", () => {
    const html = leerDist("index.html");
    assert.ok(!/mailto:/i.test(html), "sin mailto (buzón sin aprobar)");
    assert.ok(!/data-preparador/.test(html), "sin raíces del preparador");
  });
});

/* OT-Q021/Q022 — Puertas de recursos ya cubiertas en recursos.test.mjs; aquí el estado dist. */
describe("OT-Q021/Q022 estado dist (complemento OT-11)", () => {
  it("dist sin base64 fotográfico y con dimensiones reservadas donde hay slots", () => {
    for (const ruta of caminar(DIST)) {
      let texto;
      try {
        texto = readFileSync(ruta, "utf-8");
      } catch {
        continue;
      }
      assert.ok(!/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]{512,}/.test(texto), `${ruta}: sin base64`);
    }
    const html = leerDist("index.html");
    assert.ok(/data-dims="\d+x\d+"/.test(html), "los slots reservan dimensiones");
    assert.ok(!/\sstyle\s*=/i.test(html), "index sin style attributes (vía (c), OT-11)");
    const cssEmitido = readdirSync(join(DIST, "_astro"))
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(join(DIST, "_astro", f), "utf-8"))
      .join("\n");
    assert.ok(/aspect-ratio/.test(cssEmitido), "reserva de espacio anti-CLS en el CSS emitido");
  });
});
