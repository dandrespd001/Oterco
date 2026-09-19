/**
 * OT-02 — Esquema y validación del perfil OTERCO transcrito.
 *
 * Clasificación editorial (vocabulario de la unidad):
 * - `fixture` .... dato sintético de andamiaje, nunca publicable.
 * - `pendiente` .. transcrito de fuente aportada, sin aprobación registrada
 *                  (cubre `draft`/`blocked` de la especificación: NIT sin DV
 *                  confirmado, contacto sin verificar, solar en conflicto,
 *                  fotos sin licencias).
 * - `aprobado` ... revisión expresa registrada en `Perfil.aprobaciones`.
 *
 * Reglas: nada inventado. No existe campo CIIU/actividad registral: el perfil
 * ganadero (O-D01/O-D02) no se usa para afirmar un CIIU actualizado (OT-Q005).
 * Cualquier campo desconocido (p. ej. `ciiu`) se rechaza como error.
 *
 * Literales esperados: importados de `./perfil.esperado` (único destino
 * editable). Campos confirmables (`nit.valorCompletoPropuesto`,
 * `solar.potencia`, `oferta[].titulo`) se validan por formato/estructura,
 * sin igualdad literal, para que un dato confirmado se edite solo en
 * `perfil.datos.ts`.
 */
import {
  ESPERADO_EMAIL,
  ESPERADO_ENFOQUE,
  ESPERADO_FOTOS_AFIRMACION,
  ESPERADO_NIT_TRANSCRITO,
  ESPERADO_RAZON_SOCIAL,
  ESPERADO_SOLAR_AREA,
  FINCAS_ESPERADAS,
  NIT_PROPUESTO_FORMATO,
  OFERTA_ESPERADA,
  SOLAR_POTENCIA_FORMATO,
} from "./perfil.esperado.ts";

export const ESTADOS_EDITORIALES = ["fixture", "pendiente", "aprobado"] as const;
export type EstadoEditorial = (typeof ESTADOS_EDITORIALES)[number];

export const FUENTES = ["O-D01", "O-D02", "O-D03", "O-D04"] as const;
export type FuenteId = (typeof FUENTES)[number];

export const ALCANCES_APROBACION = ["nit", "contacto", "solar", "fotos"] as const;
export type AlcanceAprobacion = (typeof ALCANCES_APROBACION)[number];

export interface RegistroFuente {
  readonly fuente: FuenteId;
  readonly localizador: string;
}

/** NIT: transcrito tal cual (sin DV) + propuesta con procedencia, sin afirmar. */
export interface NitRegistro extends RegistroFuente {
  readonly valorTranscrito: typeof ESPERADO_NIT_TRANSCRITO;
  /** Campo confirmable: formato NNN.NNN.NNN-D, sin igualdad literal. */
  readonly valorCompletoPropuesto: string;
  readonly procedenciaDigito: string;
  readonly estado: EstadoEditorial;
}

export interface Identidad {
  readonly razonSocial: typeof ESPERADO_RAZON_SOCIAL;
  readonly perfil: string;
  readonly region: string;
  readonly enfoque: typeof ESPERADO_ENFOQUE;
  readonly nit: NitRegistro;
}

export interface Finca {
  readonly id: (typeof FINCAS_ESPERADAS)[number]["id"];
  readonly nombre: (typeof FINCAS_ESPERADAS)[number]["nombre"];
  readonly municipio: (typeof FINCAS_ESPERADAS)[number]["municipio"];
  readonly departamento: (typeof FINCAS_ESPERADAS)[number]["departamento"];
  /** Función literal de la fuente por finca (ver FINCAS_ESPERADAS). */
  readonly funcion: (typeof FINCAS_ESPERADAS)[number]["funcion"];
  /** Texto literal no conflictivo (sin la mención solar, clasificada aparte). */
  readonly texto: string;
  /** Etiquetas literales de la fuente; incluyen mención solar solo en Beraka. */
  readonly etiquetas: readonly string[];
  /** Oración solar literal separada por ser dato conflictivo (O-D04). */
  readonly anexoSolarLiteral: string;
  readonly fuente: RegistroFuente;
}

export interface LineaOferta {
  readonly id: (typeof OFERTA_ESPERADA)[number]["id"];
  readonly categoria: (typeof OFERTA_ESPERADA)[number]["categoria"];
  /** Campo confirmable: texto no vacío, sin igualdad literal. */
  readonly titulo: string;
  readonly descripcion: string;
  readonly fuente: RegistroFuente;
}

export interface Contacto {
  readonly email: typeof ESPERADO_EMAIL;
  readonly verificado: boolean;
  readonly estado: EstadoEditorial;
  readonly fuente: RegistroFuente;
  readonly nota: string;
}

export interface DatoSolar {
  /** Campo confirmable: cifra + unidad (formato, sin igualdad literal). */
  readonly potencia: string;
  readonly area: typeof ESPERADO_SOLAR_AREA;
  readonly estado: EstadoEditorial;
  readonly fuente: RegistroFuente;
  /** Conflicto O-D04 registrado sin reconciliar: no elegir cifra por redondeo. */
  readonly conflicto: string;
}

export interface Fotos {
  readonly afirmacion: typeof ESPERADO_FOTOS_AFIRMACION;
  readonly estado: EstadoEditorial;
  readonly fuente: RegistroFuente;
  readonly nota: string;
}

export interface Aprobacion {
  readonly responsable: string;
  /** Fecha ISO YYYY-MM-DD de la revisión expresa. */
  readonly fecha: string;
  readonly alcance: readonly AlcanceAprobacion[];
  readonly documento: string;
  readonly observaciones: string;
}

export interface Perfil {
  readonly schemaVersion: 1;
  readonly identidad: Identidad;
  readonly fincas: readonly Finca[];
  readonly oferta: readonly LineaOferta[];
  readonly contacto: Contacto;
  readonly solar: DatoSolar;
  readonly fotos: Fotos;
  /** Único registro de aprobaciones: la puerta editorial lo lee de aquí. */
  readonly aprobaciones: readonly Aprobacion[];
}

/* ------------------------------------------------------------------ */
/* Validador: devuelve lista de errores; [] = válido                    */
/* (los literales viven en ./perfil.esperado; aquí solo se comparan).   */
/* ------------------------------------------------------------------ */

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function esCadenaNoVacia(valor: unknown): valor is string {
  return typeof valor === "string" && valor.length > 0;
}

function exigirClaves(
  errores: string[],
  ruta: string,
  obj: Record<string, unknown>,
  permitidas: readonly string[],
): void {
  for (const clave of Object.keys(obj)) {
    if (!permitidas.includes(clave)) {
      errores.push(`${ruta}.${clave}: campo no permitido (posible inferencia; solo transcripción).`);
    }
  }
}

function exigirEstado(errores: string[], ruta: string, valor: unknown): void {
  if (typeof valor !== "string" || !ESTADOS_EDITORIALES.includes(valor as EstadoEditorial)) {
    errores.push(`${ruta}: estado ${JSON.stringify(valor)} inválido; use fixture|pendiente|aprobado.`);
  }
}

function exigirFuente(errores: string[], ruta: string, valor: unknown): void {
  if (!esRegistro(valor)) {
    errores.push(`${ruta}: fuente ausente o con forma inválida.`);
    return;
  }
  exigirClaves(errores, ruta, valor, ["fuente", "localizador"]);
  if (typeof valor["fuente"] !== "string" || !FUENTES.includes(valor["fuente"] as FuenteId)) {
    errores.push(`${ruta}.fuente: debe ser uno de O-D01|O-D02|O-D03|O-D04.`);
  }
  if (!esCadenaNoVacia(valor["localizador"])) {
    errores.push(`${ruta}.localizador: texto localizador requerido.`);
  }
}

/**
 * Valida un perfil completo. No lanza: acumula todos los errores para que el
 * operador vea qué corregir en el único archivo de datos (`perfil.datos.ts`).
 */
export function validarPerfil(dato: unknown): string[] {
  const errores: string[] = [];
  if (!esRegistro(dato)) return ["perfil: debe ser un objeto."];
  exigirClaves(errores, "perfil", dato, [
    "schemaVersion",
    "identidad",
    "fincas",
    "oferta",
    "contacto",
    "solar",
    "fotos",
    "aprobaciones",
  ]);
  if (dato["schemaVersion"] !== 1) errores.push("perfil.schemaVersion: debe ser 1.");

  /* Identidad (sin CIIU: su presencia se rechaza como clave desconocida). */
  const id = dato["identidad"];
  if (!esRegistro(id)) {
    errores.push("perfil.identidad: objeto requerido.");
  } else {
    exigirClaves(errores, "perfil.identidad", id, [
      "razonSocial",
      "perfil",
      "region",
      "enfoque",
      "nit",
    ]);
    if (id["razonSocial"] !== ESPERADO_RAZON_SOCIAL) {
      errores.push(`perfil.identidad.razonSocial: literal esperado "${ESPERADO_RAZON_SOCIAL}".`);
    }
    if (!esCadenaNoVacia(id["perfil"])) errores.push("perfil.identidad.perfil: texto requerido.");
    if (!esCadenaNoVacia(id["region"])) errores.push("perfil.identidad.region: texto requerido.");
    if (id["enfoque"] !== ESPERADO_ENFOQUE) {
      errores.push(`perfil.identidad.enfoque: literal esperado "${ESPERADO_ENFOQUE}".`);
    }
    const nit = id["nit"];
    if (!esRegistro(nit)) {
      errores.push("perfil.identidad.nit: objeto requerido.");
    } else {
      exigirClaves(errores, "perfil.identidad.nit", nit, [
        "fuente",
        "localizador",
        "valorTranscrito",
        "valorCompletoPropuesto",
        "procedenciaDigito",
        "estado",
      ]);
      exigirFuente(errores, "perfil.identidad.nit", {
        fuente: nit["fuente"],
        localizador: nit["localizador"],
      });
      if (nit["valorTranscrito"] !== ESPERADO_NIT_TRANSCRITO) {
        errores.push(
          `perfil.identidad.nit.valorTranscrito: literal esperado "${ESPERADO_NIT_TRANSCRITO}".`,
        );
      }
      if (
        typeof nit["valorCompletoPropuesto"] !== "string" ||
        !NIT_PROPUESTO_FORMATO.test(nit["valorCompletoPropuesto"])
      ) {
        errores.push(
          "perfil.identidad.nit.valorCompletoPropuesto: formato NNN.NNN.NNN-D requerido (campo confirmable).",
        );
      }
      if (!esCadenaNoVacia(nit["procedenciaDigito"])) {
        errores.push("perfil.identidad.nit.procedenciaDigito: procedencia del DV requerida.");
      }
      exigirEstado(errores, "perfil.identidad.nit.estado", nit["estado"]);
    }
  }

  /* Fincas: exactamente dos, en orden, con spellings literales. */
  const fincas = dato["fincas"];
  if (!Array.isArray(fincas)) {
    errores.push("perfil.fincas: arreglo de dos fincas requerido.");
  } else {
    if (fincas.length !== 2) {
      errores.push(`perfil.fincas: se esperan 2 fincas (transcripción), hay ${fincas.length}.`);
    }
    FINCAS_ESPERADAS.forEach((esperada, i) => {
      const ruta = `perfil.fincas[${i}]`;
      const f = fincas[i];
      if (!esRegistro(f)) {
        errores.push(`${ruta}: objeto requerido.`);
        return;
      }
      exigirClaves(errores, ruta, f, [
        "id",
        "nombre",
        "municipio",
        "departamento",
        "funcion",
        "texto",
        "etiquetas",
        "anexoSolarLiteral",
        "fuente",
      ]);
      if (f["id"] !== esperada.id) errores.push(`${ruta}.id: esperado "${esperada.id}".`);
      if (f["nombre"] !== esperada.nombre) {
        errores.push(`${ruta}.nombre: spelling esperado "${esperada.nombre}".`);
      }
      if (f["municipio"] !== esperada.municipio) {
        errores.push(`${ruta}.municipio: spelling esperado "${esperada.municipio}".`);
      }
      if (f["departamento"] !== esperada.departamento) {
        errores.push(`${ruta}.departamento: spelling esperado "${esperada.departamento}".`);
      }
      if (f["funcion"] !== esperada.funcion) {
        errores.push(`${ruta}.funcion: literal esperado "${esperada.funcion}".`);
      }
      if (!esCadenaNoVacia(f["texto"])) errores.push(`${ruta}.texto: texto literal requerido.`);
      if (
        !Array.isArray(f["etiquetas"]) ||
        f["etiquetas"].length === 0 ||
        !f["etiquetas"].every((e: unknown) => typeof e === "string" && e.length > 0)
      ) {
        errores.push(`${ruta}.etiquetas: lista no vacía de etiquetas literales requerida.`);
      }
      if (!esCadenaNoVacia(f["anexoSolarLiteral"]) && i === 0) {
        errores.push(`${ruta}.anexoSolarLiteral: la mención solar de Beraka debe conservarse literal.`);
      }
      exigirFuente(errores, `${ruta}.fuente`, f["fuente"]);
    });
  }

  /* Oferta: exactamente tres líneas coincidentes con la transcripción. */
  const oferta = dato["oferta"];
  if (!Array.isArray(oferta)) {
    errores.push("perfil.oferta: arreglo de tres líneas requerido.");
  } else {
    if (oferta.length !== 3) {
      errores.push(`perfil.oferta: se esperan 3 líneas (transcripción), hay ${oferta.length}.`);
    }
    OFERTA_ESPERADA.forEach((esperada, i) => {
      const ruta = `perfil.oferta[${i}]`;
      const l = oferta[i];
      if (!esRegistro(l)) {
        errores.push(`${ruta}: objeto requerido.`);
        return;
      }
      exigirClaves(errores, ruta, l, ["id", "categoria", "titulo", "descripcion", "fuente"]);
      if (l["id"] !== esperada.id) errores.push(`${ruta}.id: esperado "${esperada.id}".`);
      if (l["categoria"] !== esperada.categoria) {
        errores.push(`${ruta}.categoria: spelling esperado "${esperada.categoria}".`);
      }
      if (!esCadenaNoVacia(l["titulo"])) {
        errores.push(`${ruta}.titulo: título no vacío requerido (campo confirmable, sin literal).`);
      }
      if (!esCadenaNoVacia(l["descripcion"])) {
        errores.push(`${ruta}.descripcion: descripción literal requerida.`);
      }
      exigirFuente(errores, `${ruta}.fuente`, l["fuente"]);
    });
  }

  /* Contacto: email literal, sin verificar por defecto. */
  const contacto = dato["contacto"];
  if (!esRegistro(contacto)) {
    errores.push("perfil.contacto: objeto requerido.");
  } else {
    exigirClaves(errores, "perfil.contacto", contacto, [
      "email",
      "verificado",
      "estado",
      "fuente",
      "nota",
    ]);
    if (contacto["email"] !== ESPERADO_EMAIL) {
      errores.push(`perfil.contacto.email: literal esperado "${ESPERADO_EMAIL}".`);
    }
    if (typeof contacto["verificado"] !== "boolean") {
      errores.push("perfil.contacto.verificado: booleano requerido.");
    }
    exigirEstado(errores, "perfil.contacto.estado", contacto["estado"]);
    exigirFuente(errores, "perfil.contacto.fuente", contacto["fuente"]);
    if (!esCadenaNoVacia(contacto["nota"])) {
      errores.push("perfil.contacto.nota: nota de verificación pendiente requerida.");
    }
  }

  /* Solar: cifras literales en conflicto, nunca reconciliadas aquí. */
  const solar = dato["solar"];
  if (!esRegistro(solar)) {
    errores.push("perfil.solar: objeto requerido.");
  } else {
    exigirClaves(errores, "perfil.solar", solar, [
      "potencia",
      "area",
      "estado",
      "fuente",
      "conflicto",
    ]);
    if (typeof solar["potencia"] !== "string" || !SOLAR_POTENCIA_FORMATO.test(solar["potencia"])) {
      errores.push(
        "perfil.solar.potencia: formato de cifra + unidad MW/MWp requerido (campo confirmable, sin literal).",
      );
    }
    if (solar["area"] !== ESPERADO_SOLAR_AREA) {
      errores.push(`perfil.solar.area: literal esperado "${ESPERADO_SOLAR_AREA}".`);
    }
    exigirEstado(errores, "perfil.solar.estado", solar["estado"]);
    exigirFuente(errores, "perfil.solar.fuente", solar["fuente"]);
    if (!esCadenaNoVacia(solar["conflicto"])) {
      errores.push("perfil.solar.conflicto: el conflicto O-D04 debe quedar registrado.");
    }
  }

  /* Fotos: afirmación conservada como fuente, no como validación. */
  const fotos = dato["fotos"];
  if (!esRegistro(fotos)) {
    errores.push("perfil.fotos: objeto requerido.");
  } else {
    exigirClaves(errores, "perfil.fotos", fotos, ["afirmacion", "estado", "fuente", "nota"]);
    if (fotos["afirmacion"] !== ESPERADO_FOTOS_AFIRMACION) {
      errores.push("perfil.fotos.afirmacion: literal esperado de O-D02.");
    }
    exigirEstado(errores, "perfil.fotos.estado", fotos["estado"]);
    exigirFuente(errores, "perfil.fotos.fuente", fotos["fuente"]);
    if (!esCadenaNoVacia(fotos["nota"])) {
      errores.push("perfil.fotos.nota: nota de licencias pendientes requerida.");
    }
  }

  /* Aprobaciones: registro estructurado; un "aprobado" exige entrada aquí. */
  const aprobaciones = dato["aprobaciones"];
  if (!Array.isArray(aprobaciones)) {
    errores.push("perfil.aprobaciones: arreglo requerido (vacío si nada aprobado).");
  } else {
    aprobaciones.forEach((a: unknown, i: number) => {
      const ruta = `perfil.aprobaciones[${i}]`;
      if (!esRegistro(a)) {
        errores.push(`${ruta}: objeto requerido.`);
        return;
      }
      exigirClaves(errores, ruta, a, [
        "responsable",
        "fecha",
        "alcance",
        "documento",
        "observaciones",
      ]);
      if (!esCadenaNoVacia(a["responsable"])) {
        errores.push(`${ruta}.responsable: responsable requerido.`);
      }
      if (typeof a["fecha"] !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(a["fecha"])) {
        errores.push(`${ruta}.fecha: formato YYYY-MM-DD requerido.`);
      }
      if (
        !Array.isArray(a["alcance"]) ||
        a["alcance"].length === 0 ||
        !a["alcance"].every((t: unknown) =>
          ALCANCES_APROBACION.includes(t as AlcanceAprobacion),
        )
      ) {
        errores.push(`${ruta}.alcance: use tokens nit|contacto|solar|fotos.`);
      }
      if (!esCadenaNoVacia(a["documento"])) {
        errores.push(`${ruta}.documento: documento/recurso de aprobación requerido.`);
      }
      if (typeof a["observaciones"] !== "string") {
        errores.push(`${ruta}.observaciones: texto requerido (vacío permitido).`);
      }
    });
    /* Coherencia: estado "aprobado" sin entrada de alcance = error. */
    const alcances: string[] = [];
    for (const a of aprobaciones) {
      if (esRegistro(a) && Array.isArray(a["alcance"])) {
        for (const t of a["alcance"]) if (typeof t === "string") alcances.push(t);
      }
    }
    const exige: Array<[string, unknown, string]> = [
      ["perfil.identidad.nit.estado", esRegistro(id) && esRegistro(id["nit"]) ? id["nit"]["estado"] : undefined, "nit"],
      ["perfil.contacto.estado", esRegistro(contacto) ? contacto["estado"] : undefined, "contacto"],
      ["perfil.solar.estado", esRegistro(solar) ? solar["estado"] : undefined, "solar"],
      ["perfil.fotos.estado", esRegistro(fotos) ? fotos["estado"] : undefined, "fotos"],
    ];
    for (const [ruta, estado, token] of exige) {
      if (estado === "aprobado" && !alcances.includes(token)) {
        errores.push(`${ruta}: "aprobado" exige una entrada en aprobaciones con alcance "${token}".`);
      }
    }
    if (esRegistro(contacto) && contacto["estado"] === "aprobado" && contacto["verificado"] !== true) {
      errores.push('perfil.contacto: "aprobado" exige verificado:true (prueba humana del buzón).');
    }
  }

  return errores;
}
