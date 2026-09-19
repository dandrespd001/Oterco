/**
 * OT-03 — Pruebas de recursos (OT-Q011, OT-Q020..OT-Q022, OT-Q024 + nota Q023).
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas.
 *
 * Las fotos originales NO están en el repo: la extracción pertenece al
 * operador (09_FUENTES/EXTRACCION_LOCAL.md). Estas pruebas verifican el
 * inventario tipado, el generador (solo rutas sin originales) y las puertas
 * que impiden publicar sin trazabilidad, permiso o alt revisado.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DERIVADOS,
  FUENTES_ORIGINALES,
  PATRONES_PROHIBIDOS_DIST,
  altParaPublicar,
  contenidoDistProhibido,
  derivadosDe,
  esPublicableDerivado,
  estrategiaCarga,
  fuenteOriginalDe,
  resolverRecurso,
  trazabilidadCompleta,
  validarAlt,
  validarDerivado,
} from "../src/assets/resources.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(RAIZ, "scripts", "generar-derivados.mjs");
const FONTS_CSS = join(RAIZ, "src", "styles", "fonts.css");
const DIST = join(RAIZ, "dist");
const WOFF2_ESPERADOS = [
  "libre-caslon-display-400.woff2",
  "work-sans-400.woff2",
  "work-sans-500.woff2",
  "work-sans-700.woff2",
];

/** Derivado sintético bien formado (fixture de prueba, no foto real). */
function derivadoEjemplo(ajustes = {}) {
  return {
    sourceId: "O-IMG02",
    hashPropio: "a".repeat(64),
    bytes: 42000,
    formato: "webp",
    width: 768,
    height: 512,
    crop: "ninguno",
    destino: "src/assets/derivados/o-img02-768.webp",
    src: "/assets/derivados/o-img02-768.webp",
    srcset:
      "/assets/derivados/o-img02-480.webp 480w, /assets/derivados/o-img02-768.webp 768w",
    sizes: "(max-width: 48rem) 100vw, 48rem",
    altRevisado: "Ganado pastando bajo cobertizo al atardecer",
    estadoPermiso: "aprobado",
    fechaDerivacion: "2026-09-19",
    carga: "lazy",
    ...ajustes,
  };
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

/* OT-Q020 — Trazabilidad, huellas y permisos de los derivados a publicar. */
describe("OT-Q020 trazabilidad por derivado", () => {
  it("las seis fuentes documentales traen sourceId, SHA-256, dimensiones y permiso", () => {
    assert.equal(FUENTES_ORIGINALES.length, 6);
    assert.deepEqual(
      FUENTES_ORIGINALES.map((f) => f.sourceId),
      ["O-IMG01", "O-IMG02", "O-IMG03", "O-IMG04", "O-IMG05", "O-IMG06"],
    );
    for (const f of FUENTES_ORIGINALES) {
      assert.match(f.sha256Original, /^[0-9a-f]{64}$/, f.sourceId);
      assert.ok(f.widthOriginal > 0 && f.heightOriginal > 0, f.sourceId);
      assert.ok(f.bytesOriginal > 0, f.sourceId);
      assert.equal(f.estadoPermiso, "pendiente", `${f.sourceId}: nace pendiente`);
      assert.ok(f.fechaRegistro.length > 0, f.sourceId);
      assert.equal(fuenteOriginalDe(f.sourceId).sha256Original, f.sha256Original);
    }
  });

  it("preprint vacío: sin derivados, todo resuelve a ausente, nunca roto", () => {
    assert.equal(DERIVADOS.length, 0);
    for (const f of FUENTES_ORIGINALES) {
      assert.deepEqual(derivadosDe(f.sourceId), []);
      const r = resolverRecurso(f.sourceId);
      assert.equal(r.estado, "ausente");
      assert.ok(r.motivo.includes("operador encargado"));
      assert.ok(!("src" in r), "ausente no expone src alguno");
    }
  });

  it("publicar exige trazabilidad completa y permiso aprobado", () => {
    const pendiente = derivadoEjemplo({ estadoPermiso: "pendiente" });
    assert.ok(trazabilidadCompleta(pendiente), "trazable aunque pendiente");
    assert.equal(esPublicableDerivado(pendiente), false, "pendiente no se publica");
    const aprobado = derivadoEjemplo();
    assert.ok(trazabilidadCompleta(aprobado));
    assert.equal(esPublicableDerivado(aprobado), true);
    const sinHash = derivadoEjemplo({ hashPropio: "corto" });
    assert.equal(esPublicableDerivado(sinHash), false, "sin hash no se publica");
  });

  it("el generador refleja las seis huellas documentales (espejo verificado)", () => {
    const texto = readFileSync(SCRIPT, "utf-8");
    for (const f of FUENTES_ORIGINALES) {
      assert.ok(
        texto.includes(f.sha256Original),
        `${f.sourceId}: su huella documental consta en el generador`,
      );
    }
  });
});

/* OT-Q021 — Ni base64 ni rutas privadas ni certificados en dist. */
describe("OT-Q021 dist limpio de base64, privados y certificados", () => {
  it("src/ y scripts/ no embeben base64 fotográfico", () => {
    const base64 = PATRONES_PROHIBIDOS_DIST.find((p) => p.nombre === "base64-embebido").patron;
    const dirs = [join(RAIZ, "src"), join(RAIZ, "scripts")];
    for (const dir of dirs) {
      for (const ruta of caminar(dir)) {
        if (/\.(woff2|png|jpe?g|webp|avif)$/i.test(ruta)) continue;
        const texto = readFileSync(ruta, "utf-8");
        assert.ok(!base64.test(texto), `${ruta}: sin data:image base64`);
      }
    }
  });

  it("dist/ sin base64, rutas privadas, inventory.json ni certificados", {
    skip: !existsSync(DIST) ? "sin dist compilado; ejecutar pnpm build" : false,
  }, () => {
    for (const ruta of caminar(DIST)) {
      let texto;
      try {
        texto = readFileSync(ruta, "utf-8");
      } catch {
        continue; // binario: no es texto inspeccionable ni certificado PEM
      }
      const hallados = contenidoDistProhibido(texto);
      assert.deepEqual(hallados, [], `${ruta}: patrones prohibidos ${hallados}`);
    }
  });
});

/* OT-Q022 — Esquema de derivados: width/height/srcset/sizes coherentes. */
describe("OT-Q022 esquema de derivados", () => {
  it("un derivado bien formado valida sin errores", () => {
    assert.deepEqual(validarDerivado(derivadoEjemplo()), []);
  });

  it("rechaza dimensiones ausentes y ampliación sobre el original", () => {
    const sinDims = derivadoEjemplo({ width: 0, height: 0 });
    assert.ok(validarDerivado(sinDims).some((e) => e.includes("width/height")));
    const ampliado = derivadoEjemplo({ width: 2000, height: 1333 });
    assert.ok(validarDerivado(ampliado).some((e) => e.includes("supera el original")));
  });

  it("rechaza srcset sin sizes, malformado o no ascendente", () => {
    const sinSizes = derivadoEjemplo({ sizes: "" });
    assert.ok(validarDerivado(sinSizes).some((e) => e.includes("sizes")));
    const mal = derivadoEjemplo({ srcset: "foto.webp" });
    assert.ok(validarDerivado(mal).some((e) => e.includes("malformada")));
    const desorden = derivadoEjemplo({
      srcset: "/a-768.webp 768w, /a-480.webp 480w",
    });
    assert.ok(validarDerivado(desorden).some((e) => e.includes("ascendente")));
  });

  it("rechaza src remoto, data: y destino fuera de src/assets", () => {
    assert.ok(validarDerivado(derivadoEjemplo({ src: "https://x/y.webp" })).length > 0);
    assert.ok(validarDerivado(derivadoEjemplo({ src: "data:image/webp;base64,AAA" })).length > 0);
    assert.ok(validarDerivado(derivadoEjemplo({ destino: "public/y.webp" })).length > 0);
  });
});

/* OT-Q024 — Alt/riesgo: el alt original no identifica raza ni propiedad. */
describe("OT-Q024 textos alternativos sin afirmaciones", () => {
  it("los alt de raza/propiedad de la fuente se rechazan como alt publicable", () => {
    for (const id of ["O-IMG01", "O-IMG02", "O-IMG03", "O-IMG06"]) {
      const original = fuenteOriginalDe(id).sourceAltOriginal;
      const errores = validarAlt(original);
      assert.ok(errores.length > 0, `${id}: «${original}» no sirve como alt`);
    }
  });

  it("ninguna foto expone alt publicable sin derivado aprobado", () => {
    for (const f of FUENTES_ORIGINALES) {
      assert.equal(altParaPublicar(f.sourceId), null, f.sourceId);
    }
  });

  it("un alt neutro y declarativo se acepta; el vacío y el excesivo no", () => {
    assert.deepEqual(validarAlt("Ganado pastando bajo cobertizo al atardecer"), []);
    assert.ok(validarAlt("").length > 0);
    assert.ok(validarAlt("x".repeat(181)).length > 0);
    assert.ok(
      validarAlt("Ejemplar Brahman de nuestra finca, genética garantizada").length >= 2,
    );
  });
});

/* Nota OT-Q023 — Bebedero contenido sin ampliación; solar lazy con opt-out hero. */
describe("nota OT-Q023 composición y carga", () => {
  it("el bebedero vertical se contiene y nunca se amplía ni es hero", () => {
    const e = estrategiaCarga("O-IMG04");
    assert.equal(e.ajuste, "contenido");
    assert.equal(e.permitirAmpliacion, false);
    assert.equal(e.optOutHeroPosible, false);
  });

  it("la solar es lazy fuera de pantalla, con opt-out documentado si fuera hero", () => {
    const e = estrategiaCarga("O-IMG06");
    assert.equal(e.loading, "lazy");
    assert.equal(e.optOutHeroPosible, true);
    assert.match(e.nota, /intersecci/);
  });
});

/* OT-Q011 — Fuentes distintas, autorizadas y realmente cargadas (sin CDN). */
describe("OT-Q011 tipografías locales", () => {
  it("fonts.css declara Libre Caslon Display y Work Sans con swap y sin remoto", () => {
    const css = readFileSync(FONTS_CSS, "utf-8");
    assert.match(css, /font-family:\s*"Libre Caslon Display"/);
    assert.match(css, /font-family:\s*"Work Sans"/);
    assert.equal((css.match(/@font-face\s*\{/g) || []).length, 4);
    assert.equal((css.match(/^\s*font-display:\s*swap;/gm) || []).length, 4);
    assert.ok(!/https?:\/\//.test(css), "sin URL remota en runtime");
    assert.ok(!/@import/.test(css), "sin @import remoto");
    assert.ok(!/googleapis|gstatic/.test(css), "sin CDN tipográfico");
    for (const w of WOFF2_ESPERADOS) {
      assert.ok(css.includes(w), `referencia local a ${w}`);
    }
  });

  it("binarios WOFF2 locales presentes", {
    skip: (() => {
      const faltan = WOFF2_ESPERADOS.filter(
        (w) => !existsSync(join(RAIZ, "src", "assets", "fonts", w)),
      );
      return faltan.length > 0 ? `pendiente operador: faltan ${faltan.join(", ")}` : false;
    })(),
  }, () => {
    for (const w of WOFF2_ESPERADOS) {
      assert.ok(statSync(join(RAIZ, "src", "assets", "fonts", w)).size > 0, w);
    }
  });
});

/* Generador: sin originales termina en exit no-cero sin tocar el build. */
describe("generador sin originales (bloqueo operador)", () => {
  function ejecutar(args, cwd) {
    try {
      execFileSync(process.execPath, [SCRIPT, ...args], {
        cwd: cwd ?? RAIZ,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      return { exit: 0, stderr: "" };
    } catch (err) {
      return { exit: err.status ?? 1, stderr: String(err.stderr ?? err.message) };
    }
  }

  it("carpeta inexistente → exit 2 con mensaje al operador", () => {
    const r = ejecutar([join(RAIZ, "carpeta-que-no-existe")]);
    assert.equal(r.exit, 2);
    assert.match(r.stderr, /originales ausentes — operador encargado/);
  });

  it("carpeta sin inventory.json → exit 2", () => {
    const dir = mkdtempSync(join(tmpdir(), "oterco-orig-"));
    try {
      const r = ejecutar([dir]);
      assert.equal(r.exit, 2);
      assert.match(r.stderr, /originales ausentes — operador encargado/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("recuento de inventario inesperado → exit 1 sin escribir derivados", () => {
    const dir = mkdtempSync(join(tmpdir(), "oterco-orig-"));
    try {
      writeFileSync(
        join(dir, "inventory.json"),
        JSON.stringify([{ file: "original-01.jpg", bytes: 3, sha256: "x" }]),
        "utf-8",
      );
      const r = ejecutar([dir, "--dest", join(dir, "salida")]);
      assert.equal(r.exit, 1);
      assert.ok(!existsSync(join(dir, "salida")));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("cruce de hash individual contra huella documental → exit 1", {
    skip: "pendiente de ejecutar con originales del operador (requiere las 6 fotos de extraer.py)",
  }, () => {
    // Con inventory.json de 6 entradas y un JPEG cuyo SHA-256 no coincide con
    // la huella documental, el generador debe salir con exit 1 sin escribir.
    // No ejecutable aquí: los originales pertenecen al operador (§5.1).
  });
});
