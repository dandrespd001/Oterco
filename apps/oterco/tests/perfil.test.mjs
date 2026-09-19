/**
 * OT-02 — Pruebas de contenido y puerta editorial (OT-Q005..OT-Q009).
 * Runner estándar Node (`node --test tests/`), sin dependencias nuevas:
 * la red remota no está autorizada para instalar Vitest en esta unidad.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validarPerfil } from "../src/content/perfil.ts";
import { perfilBase } from "../src/content/perfil.datos.ts";
import {
  ESPERADO_EMAIL,
  ESPERADO_ENFOQUE,
  ESPERADO_FOTOS_AFIRMACION,
  ESPERADO_NIT_TRANSCRITO,
  ESPERADO_RAZON_SOCIAL,
  ESPERADO_SOLAR_AREA,
  FINCAS_ESPERADAS,
  OFERTA_ESPERADA,
} from "../src/content/perfil.esperado.ts";
import { isPublicable, motivosBloqueo, proyeccionPublica } from "../src/config/publicacion.ts";

function clonarBase() {
  return JSON.parse(JSON.stringify(perfilBase));
}

/* OT-Q005 — Fuentes clasificadas; el perfil ganadero no afirma CIIU actual. */
describe("OT-Q005 transcripción como fuente, sin inferencia registral", () => {
  it("el modelo no contiene afirmación de actividad registral", () => {
    assert.ok(!("ciiu" in perfilBase.identidad));
    const serializado = JSON.stringify(perfilBase);
    assert.match(serializado, /830\.128\.652/);
    assert.ok(!/CIIU|4321|4620/i.test(serializado));
  });

  it("un campo registral inventado se rechaza como error", () => {
    const inventado = clonarBase();
    inventado.identidad.ciiu = "4321";
    const errores = validarPerfil(inventado);
    assert.ok(errores.some((e) => e.includes("identidad.ciiu")));
  });

  it("la base transcribe sin errores de validación", () => {
    assert.deepEqual(validarPerfil(perfilBase), []);
  });
});

/* OT-Q006 — Conflictivos ausentes de la salida pública sin aprobación. */
describe("OT-Q006 salida pública sin datos conflictivos", () => {
  it("proyección base: sin solar, contacto, NIT ni fotos en ningún rastro", () => {
    const publica = proyeccionPublica(perfilBase);
    assert.equal(publica.nivel, "tecnica");
    assert.equal(publica.contactoEmail, null);
    assert.equal(publica.solar, null);
    assert.equal(publica.nit, null);
    assert.equal(publica.fotosAfirmacion, null);
    const serializado = JSON.stringify(publica);
    assert.ok(!serializado.includes("11.6"));
    assert.ok(!serializado.includes("21 hectáreas"));
    assert.ok(!serializado.includes("contacto@"));
    assert.ok(!serializado.includes("830.128"));
    assert.ok(!serializado.includes("Fotografias tomadas"));
  });

  it("la etiqueta solar de Beraka se filtra mientras el bloque siga pendiente", () => {
    const publica = proyeccionPublica(perfilBase);
    const beraka = publica.fincas.find((f) => f.id === "beraka");
    assert.ok(beraka);
    assert.ok(beraka.etiquetas.every((e) => !/solar|MW/i.test(e)));
    assert.ok(publica.omitidos.length >= 4);
  });
});

/* OT-Q007 — Dos fincas y tres líneas coincidentes con la transcripción. */
describe("OT-Q007 fincas y oferta según transcripción", () => {
  it("dos fincas con nombres, municipios y funciones literales", () => {
    assert.equal(perfilBase.fincas.length, 2);
    const [beraka, puertaRoja] = perfilBase.fincas;
    assert.equal(beraka.nombre, "Hacienda Beraka");
    assert.equal(beraka.municipio, "San Onofre");
    assert.equal(beraka.departamento, "Sucre");
    assert.equal(beraka.funcion, "cría");
    assert.match(beraka.texto, /Montes de María/);
    assert.equal(puertaRoja.nombre, "Hacienda Puerta Roja");
    assert.equal(puertaRoja.municipio, "Turbaco");
    assert.equal(puertaRoja.departamento, "Bolívar");
    assert.equal(puertaRoja.funcion, "ceba y levante");
    assert.match(puertaRoja.texto, /Cartagena/);
  });

  it("tres líneas de oferta con categorías y títulos literales", () => {
    assert.equal(perfilBase.oferta.length, 3);
    assert.deepEqual(
      perfilBase.oferta.map((l) => l.categoria),
      ["Ganado en pie", "Cría", "Servicio"],
    );
    assert.deepEqual(
      perfilBase.oferta.map((l) => l.titulo),
      ["Animales de ceba terminados", "Hembras de reemplazo", "Pastaje y levante por contrato"],
    );
    assert.match(perfilBase.oferta[0].descripcion, /historial sanitario documentado/);
    assert.match(perfilBase.oferta[1].descripcion, /Hacienda Beraka/);
    assert.match(perfilBase.oferta[2].descripcion, /mismos protocolos de Oterco/);
  });
});

/* OT-Q008 — Sin aprobación: bloqueo comercial, no técnico. */
describe("OT-Q008 puerta editorial por aprobaciones en datos", () => {
  it("base sin aprobaciones → técnica con motivos de NIT y contacto", () => {
    assert.equal(isPublicable(perfilBase), "tecnica");
    const motivos = motivosBloqueo(perfilBase);
    assert.ok(motivos.some((m) => m.startsWith("nit:")));
    assert.ok(motivos.some((m) => m.startsWith("contacto:")));
  });

  it("aprobaciones en datos (NIT+contacto verificado) → comercial; solar sigue omitido", () => {
    const aprobado = clonarBase();
    aprobado.identidad.nit.estado = "aprobado";
    aprobado.contacto.estado = "aprobado";
    aprobado.contacto.verificado = true;
    aprobado.aprobaciones = [
      {
        responsable: "Operador (fixture de prueba)",
        fecha: "2026-09-19",
        alcance: ["nit", "contacto"],
        documento: "prueba local, sin valor comercial",
        observaciones: "",
      },
    ];
    assert.deepEqual(validarPerfil(aprobado), []);
    assert.equal(isPublicable(aprobado), "comercial");
    const publica = proyeccionPublica(aprobado);
    assert.equal(publica.nit, "830.128.652-4");
    assert.equal(publica.contactoEmail, "contacto@oterco.com.co");
    assert.equal(publica.solar, null);
    assert.ok(JSON.stringify(publica).includes("830.128.652-4"));
    assert.ok(!JSON.stringify(publica).includes("11.6"));
  });

  it("estado aprobado sin entrada en el registro se rechaza", () => {
    const incoherente = clonarBase();
    incoherente.contacto.estado = "aprobado";
    incoherente.contacto.verificado = true;
    const errores = validarPerfil(incoherente);
    assert.ok(errores.some((e) => e.includes("aprobaciones") && e.includes("contacto")));
    assert.equal(isPublicable(incoherente), "tecnica");
  });
});

/* OT-Q009 — Cambio localizado en un solo archivo + rechazo de inválidos. */
describe("OT-Q009 edición localizada y validación estricta", () => {
  it("un cambio de texto en los datos sigue validando", () => {
    const editado = clonarBase();
    editado.oferta[2].descripcion = editado.oferta[2].descripcion.replace(
      "Alternativa para terceros",
      "Opción para terceros",
    );
    assert.deepEqual(validarPerfil(editado), []);
    assert.equal(editado.schemaVersion, 1);
  });

  it("estado editorial inválido produce error explícito", () => {
    const roto = clonarBase();
    roto.solar.estado = "borrador";
    const errores = validarPerfil(roto);
    assert.ok(errores.some((e) => e.includes("solar.estado") && e.includes("fixture|pendiente|aprobado")));
  });

  it("tercera finca o campo desconocido producen error", () => {
    const extra = clonarBase();
    extra.fincas.push({
      id: "tercera",
      nombre: "Otra",
      municipio: "X",
      departamento: "Y",
      funcion: "cría",
      texto: "t",
      etiquetas: ["t"],
      anexoSolarLiteral: "",
      fuente: { fuente: "O-D01", localizador: "ninguno" },
    });
    assert.ok(validarPerfil(extra).some((e) => e.includes("fincas")));

    const raro = clonarBase();
    raro.recursoDesconocido = "x";
    assert.ok(validarPerfil(raro).some((e) => e.includes("recursoDesconocido")));
  });

  it("spellings alterados (municipio, categoría) se rechazan", () => {
    const falta = clonarBase();
    falta.fincas[0].municipio = "San Onofre ";
    assert.ok(validarPerfil(falta).some((e) => e.includes("municipio")));
    const categoria = clonarBase();
    categoria.oferta[1].categoria = "Cria";
    assert.ok(validarPerfil(categoria).some((e) => e.includes("categoria")));
  });
});

/* Corrección H1 — literales en lugar único; confirmables por formato. */
describe("H1 literales centralizados y confirmables por formato", () => {
  it("el lugar único refleja los datos base (una sola fuente de igualdad)", () => {
    assert.equal(ESPERADO_RAZON_SOCIAL, perfilBase.identidad.razonSocial);
    assert.equal(ESPERADO_ENFOQUE, perfilBase.identidad.enfoque);
    assert.equal(ESPERADO_NIT_TRANSCRITO, perfilBase.identidad.nit.valorTranscrito);
    assert.equal(ESPERADO_EMAIL, perfilBase.contacto.email);
    assert.equal(ESPERADO_SOLAR_AREA, perfilBase.solar.area);
    assert.equal(ESPERADO_FOTOS_AFIRMACION, perfilBase.fotos.afirmacion);
    assert.deepEqual(
      perfilBase.fincas.map((f) => f.id),
      FINCAS_ESPERADAS.map((f) => f.id),
    );
    assert.deepEqual(
      perfilBase.oferta.map((l) => [l.id, l.categoria]),
      OFERTA_ESPERADA.map((l) => [l.id, l.categoria]),
    );
  });

  it("un dato confirmado con formato válido se edita solo en los datos", () => {
    const editado = clonarBase();
    editado.oferta[0].titulo = "Título confirmado nuevo";
    editado.solar.potencia = "11,65 MWp";
    editado.identidad.nit.valorCompletoPropuesto = "830.128.652-5";
    assert.deepEqual(validarPerfil(editado), []);
  });

  it("formatos inválidos en confirmables se rechazan sin lanzar", () => {
    const malaPotencia = clonarBase();
    malaPotencia.solar.potencia = "once megas";
    assert.ok(validarPerfil(malaPotencia).some((e) => e.includes("solar.potencia")));

    const malNit = clonarBase();
    malNit.identidad.nit.valorCompletoPropuesto = "ABC";
    assert.ok(
      validarPerfil(malNit).some((e) => e.includes("valorCompletoPropuesto")),
    );

    const sinTitulo = clonarBase();
    sinTitulo.oferta[1].titulo = "";
    assert.ok(validarPerfil(sinTitulo).some((e) => e.includes("oferta[1].titulo")));

    assert.ok(Array.isArray(validarPerfil(undefined)));
    assert.ok(validarPerfil(undefined).length > 0);
  });
});

/* Corrección H2 — perfil inválido nunca es comercial. */
describe("H2 puerta editorial ante perfil inválido", () => {
  function comercialAprobado() {
    const aprobado = clonarBase();
    aprobado.identidad.nit.estado = "aprobado";
    aprobado.contacto.estado = "aprobado";
    aprobado.contacto.verificado = true;
    aprobado.aprobaciones = [
      {
        responsable: "Operador (fixture de prueba)",
        fecha: "2026-09-19",
        alcance: ["nit", "contacto"],
        documento: "prueba local, sin valor comercial",
        observaciones: "",
      },
    ];
    return aprobado;
  }

  it("clave desconocida con aprobaciones completas → técnica", () => {
    const roto = comercialAprobado();
    assert.equal(isPublicable(roto), "comercial");
    roto.recursoDesconocido = "x";
    assert.ok(validarPerfil(roto).some((e) => e.includes("recursoDesconocido")));
    assert.equal(isPublicable(roto), "tecnica");
    assert.ok(motivosBloqueo(roto).some((m) => m.startsWith("validacion:")));
    assert.equal(proyeccionPublica(roto).nivel, "tecnica");
  });

  it("título vacío invalida y bloquea la vía comercial", () => {
    const roto = comercialAprobado();
    roto.oferta[0].titulo = "";
    assert.ok(validarPerfil(roto).some((e) => e.includes("oferta[0].titulo")));
    assert.equal(isPublicable(roto), "tecnica");
    assert.equal(proyeccionPublica(roto).nivel, "tecnica");
  });
});
