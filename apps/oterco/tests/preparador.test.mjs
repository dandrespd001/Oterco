/**
 * OT-07 — Pruebas puras del preparador local (OT-Q025, OT-Q026, OT-Q027,
 * OT-Q028, OT-Q029). Runner estándar Node (`node --test tests/`), sin
 * dependencias nuevas. Lógica sin DOM: motor.ts + destino.ts.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CATALOGO_PREPARADOR,
  MENSAJE_MAX,
  crearCatalogo,
  esTemaValido,
  preparar,
} from "../src/tools/preparador/motor.ts";
import {
  MAILTO_URI_MAX,
  construirMailto,
  esEmailValido,
  resolverDestino,
} from "../src/tools/preparador/destino.ts";
import { perfilBase } from "../src/content/perfil.datos.ts";

const AVISO = "Borrador de consulta, no cotización ni confirmación de disponibilidad.";

/* OT-Q025 — Tres categorías generan asunto y cuerpo correctos; vacío permitido. */
describe("OT-Q025 categorías, asunto/cuerpo y mensaje vacío", () => {
  it("hay exactamente tres categorías estables", () => {
    assert.deepEqual(
      CATALOGO_PREPARADOR.map((t) => t.id),
      ["ganado-en-pie", "hembras-reemplazo", "pastaje-levante"],
    );
  });

  it("cada categoría genera asunto fijo y cuerpo con línea + aviso", () => {
    for (const tema of CATALOGO_PREPARADOR) {
      const r = preparar(tema.id, "Hola, deseo información.");
      assert.equal(r.ok, true);
      assert.equal(r.asunto, tema.asunto);
      assert.ok(r.cuerpo.startsWith(`Deseo consultar sobre ${tema.linea}.`));
      assert.ok(r.cuerpo.includes("Hola, deseo información."));
      assert.ok(r.cuerpo.endsWith(AVISO));
    }
  });

  it("el mensaje vacío está permitido", () => {
    const r = preparar("ganado-en-pie", "");
    assert.equal(r.ok, true);
    assert.ok(r.cuerpo.startsWith("Deseo consultar sobre "));
    assert.ok(r.cuerpo.endsWith(AVISO));
  });

  it("sin categoría o con categoría ajena se rechaza", () => {
    assert.equal(preparar(undefined, "").ok, false);
    assert.equal(preparar("precio", "").ok, false);
    assert.equal(esTemaValido("precio"), false);
    assert.equal(esTemaValido("ganado-en-pie"), true);
  });

  it("el catálogo se construye desde la oferta del perfil (3 líneas O-D01)", () => {
    const catalogo = crearCatalogo(perfilBase.oferta);
    assert.equal(catalogo.length, 3);
    assert.deepEqual(
      catalogo.map((t) => t.id),
      ["ganado-en-pie", "hembras-reemplazo", "pastaje-levante"],
    );
    for (const tema of catalogo) {
      const r = preparar(tema.id, "", catalogo);
      assert.equal(r.ok, true);
      assert.ok(r.cuerpo.includes(AVISO));
    }
  });

  it("el catálogo por defecto coincide con el derivado de la oferta (fuente única)", () => {
    assert.deepEqual(CATALOGO_PREPARADOR, crearCatalogo(perfilBase.oferta));
  });

  it("el cuerpo nunca incluye precios", () => {
    const r = preparar("pastaje-levante", "¿Cuánto cuesta?");
    assert.equal(r.ok, true);
    assert.ok(!/\$\s?\d|COP|precio total/i.test(r.cuerpo));
  });
});

/* OT-Q026 — 800 se acepta, 801 se rechaza; Unicode y saltos conservados. */
describe("OT-Q026 límites exactos y Unicode", () => {
  it("MENSAJE_MAX es 800", () => {
    assert.equal(MENSAJE_MAX, 800);
  });

  it("exactamente 800 caracteres se acepta", () => {
    const r = preparar("ganado-en-pie", "a".repeat(800));
    assert.equal(r.ok, true);
    assert.equal(r.mensajeLongitud, 800);
  });

  it("801 caracteres se rechaza", () => {
    const r = preparar("ganado-en-pie", "a".repeat(801));
    assert.equal(r.ok, false);
    assert.equal(r.codigo, "MENSAJE_LIMITE");
  });

  it("el conteo es en puntos de código: tildes y emoji cuentan como el usuario los ve", () => {
    assert.equal(preparar("ganado-en-pie", "ñ".repeat(800)).ok, true);
    assert.equal(preparar("ganado-en-pie", "ñ".repeat(801)).ok, false);
    // Cada emoji es 1 punto de código aunque ocupe 2 unidades UTF-16.
    assert.equal(preparar("ganado-en-pie", "🐄".repeat(800)).ok, true);
    assert.equal(preparar("ganado-en-pie", "🐄".repeat(801)).ok, false);
  });

  it("saltos de línea y párrafos se conservan; el trim es solo exterior", () => {
    const r = preparar("hembras-reemplazo", "  línea uno\n\nlínea dos\tcon tab  ");
    assert.equal(r.ok, true);
    assert.ok(r.cuerpo.includes("línea uno\n\nlínea dos\tcon tab"));
  });

  it("CRLF se normaliza a LF", () => {
    const r = preparar("hembras-reemplazo", "uno\r\n\rdos");
    assert.equal(r.ok, true);
    assert.ok(r.cuerpo.includes("uno\n\ndos"));
    assert.ok(!r.cuerpo.includes("\r"));
  });

  it("controles no imprimibles se rechazan; tab y salto se permiten", () => {
    assert.equal(preparar("ganado-en-pie", "hola\x00mundo").ok, false);
    assert.equal(preparar("ganado-en-pie", "hola\x00mundo").codigo, "MENSAJE_CONTROLES");
    assert.equal(preparar("ganado-en-pie", "hola\x07mundo").ok, false);
    assert.equal(preparar("ganado-en-pie", "a\tb\nc").ok, true);
  });

  it("no texto se rechaza sin lanzar", () => {
    assert.equal(preparar("ganado-en-pie", undefined).ok, false);
    assert.equal(preparar("ganado-en-pie", 42).ok, false);
  });
});

/* OT-Q027 — HTML como texto (capa pura: el texto viaja intacto, sin emitir HTML). */
describe("OT-Q027 entrada con HTML viaja como texto plano", () => {
  it("el payload se conserva literal en el cuerpo, sin ejecutar ni transformar", () => {
    const payload = '<script>alert(1)</script><img src="x" onerror="alert(2)">';
    const r = preparar("ganado-en-pie", payload);
    assert.equal(r.ok, true);
    assert.ok(r.cuerpo.includes(payload));
    assert.equal(typeof r.cuerpo, "string");
  });
});

/* OT-Q028 — Destinatario solo de configuración aprobada; anti-inyección. */
describe("OT-Q028 destino aprobado y sin inyección", () => {
  it("perfilBase (contacto SIN aprobar) → pendienteAP sin exponer el buzón", () => {
    const d = resolverDestino(perfilBase.contacto, perfilBase.aprobaciones);
    assert.equal(d.estado, "pendienteAP");
    assert.equal(d.destinoMostrado, "contacto pendiente de aprobación");
    assert.ok(d.razon.length > 0);
    assert.ok(!JSON.stringify(d).includes("contacto@"));
  });

  it("contacto aprobado + verificado + token → habilitado con el buzón", () => {
    const d = resolverDestino(
      { email: "contacto@oterco.com.co", estado: "aprobado", verificado: true },
      [{ alcance: ["nit", "contacto"] }],
    );
    assert.equal(d.estado, "aprobado");
    assert.equal(d.email, "contacto@oterco.com.co");
  });

  it("aprobado sin verificado, sin token o con formato inválido → pendienteAP", () => {
    const base = { email: "contacto@oterco.com.co", verificado: true };
    assert.equal(
      resolverDestino({ ...base, estado: "aprobado", verificado: false }, [{ alcance: ["contacto"] }])
        .estado,
      "pendienteAP",
    );
    assert.equal(
      resolverDestino({ ...base, estado: "aprobado" }, [{ alcance: ["nit"] }]).estado,
      "pendienteAP",
    );
    assert.equal(
      resolverDestino({ email: "no-es-buzon", estado: "aprobado", verificado: true }, [
        { alcance: ["contacto"] },
      ]).estado,
      "pendienteAP",
    );
  });

  it("el destino con saltos o cabeceras se rechaza (no llega al mailto)", () => {
    assert.equal(esEmailValido("a@b.com\r\nBcc: x@y.com"), false);
    assert.equal(esEmailValido("a@b.com\nCc: x@y.com"), false);
    assert.equal(esEmailValido("a@b.com%0ABcc:x"), false);
    const r = construirMailto("a@b.com\r\nBcc: x@y.com", "s", "c");
    assert.equal(r.ok, false);
    assert.equal(r.codigo, "DESTINO_INVALIDO");
  });

  it("el mailto lleva un único destino y solo subject/body, sin saltos crudos", () => {
    const r = construirMailto("contacto@oterco.com.co", "Consulta OTERCO — Cría", "línea 1\nlínea 2");
    assert.equal(r.ok, true);
    assert.ok(r.uri.startsWith("mailto:contacto@oterco.com.co?subject="));
    assert.ok(!r.uri.includes("\n") && !r.uri.includes("\r"));
    assert.ok(!/cc=|bcc=/i.test(r.uri));
    assert.equal((r.uri.match(/mailto:/g) ?? []).length, 1);
  });
});

/* OT-Q029 — mailto codificado; URI largo ofrece copia; nunca anuncia envío. */
describe("OT-Q029 codificación, URI largo y sin éxito de envío", () => {
  it("tildes, &, ?, saltos y emoji viajan codificados", () => {
    const r = construirMailto("contacto@oterco.com.co", "Consulta & precio?", "¿Hola?\n🐄 sí");
    assert.equal(r.ok, true);
    assert.ok(r.uri.includes(encodeURIComponent("Consulta & precio?")));
    assert.ok(r.uri.includes(encodeURIComponent("¿Hola?\n🐄 sí")));
    assert.ok(r.uri.includes("%C3%B1") || r.uri.includes("%C3%AD"));
    assert.ok(r.uri.includes("%26") && r.uri.includes("%3F"));
  });

  it("URI demasiado largo → sin cuerpo, con variante solo-asunto", () => {
    const largo = "a".repeat(800);
    const r = construirMailto("contacto@oterco.com.co", "s", largo, 100);
    assert.equal(r.ok, true);
    assert.equal(r.uri, null);
    assert.equal(r.demasiadoLargo, true);
    assert.ok(r.uriSinCuerpo.startsWith("mailto:contacto@oterco.com.co?subject="));
    assert.ok(!r.uriSinCuerpo.includes("body="));
  });

  it("el umbral por defecto admite el borrador máximo normal", () => {
    assert.equal(MAILTO_URI_MAX, 2000);
    const r = preparar("ganado-en-pie", "a".repeat(800));
    assert.equal(r.ok, true);
    const m = construirMailto("contacto@oterco.com.co", r.asunto, r.cuerpo);
    assert.equal(m.ok, true);
    assert.equal(m.demasiadoLargo, false);
  });
});
