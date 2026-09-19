/**
 * OT-03 — Inventario de recursos fotográficos y derivados.
 *
 * Las seis fotos originales NO están en el repo (bytes fuera del paquete;
 * extracción con `extraer.py` pertenece al operador en carpeta privada,
 * ver 09_FUENTES/EXTRACCION_LOCAL.md). Este módulo registra la huella
 * documental de cada original (09_FUENTES/INVENTARIO_RECURSOS.md) y el
 * registro de derivados generados a partir de ellos.
 *
 * Preprint de entrada vacía: `DERIVADOS` está vacío hasta que el operador
 * aporte originales y el generador (`scripts/generar-derivados.mjs`) produzca
 * derivados. Ninguna función devuelve una referencia rota: si no existe
 * derivado, `resolverRecurso()` devuelve `{ estado: "ausente" }`, nunca un
 * `src` inexistente. Nada de este módulo rompe el build ni las pruebas.
 *
 * Sin base64 en `src`, sin rutas privadas, sin afirmaciones de raza o
 * propiedad a partir de una imagen (OT-Q024).
 */

export const SOURCE_IDS = [
  "O-IMG01",
  "O-IMG02",
  "O-IMG03",
  "O-IMG04",
  "O-IMG05",
  "O-IMG06",
] as const;

export type SourceId = (typeof SOURCE_IDS)[number];

/** Vocabulario editorial de permisos; todo nace `pendiente`. */
export type EstadoPermiso = "pendiente" | "aprobado" | "rechazado";

export type FormatoDerivado = "avif" | "webp" | "jpeg";

/** Cómo se encaja el derivado en su composición (OT-Q022/Q023). */
export type AjusteDerivado = "ninguno" | "contenido" | "manual";

export interface FuenteOriginal {
  readonly sourceId: SourceId;
  /** Alt tal como venía en el HTML fuente: NO es identificación de raza/propiedad. */
  readonly sourceAltOriginal: string;
  readonly widthOriginal: number;
  readonly heightOriginal: number;
  readonly bytesOriginal: number;
  readonly sha256Original: string;
  /** Uso propuesto, sin aprobación comercial. */
  readonly usoPropuesto: string;
  readonly estadoPermiso: EstadoPermiso;
  readonly fechaRegistro: string;
}

/**
 * Huellas documentales de 09_FUENTES/INVENTARIO_RECURSOS.md (corte 2026-09-17).
 * Los originales permanecen fuera del repo; esto es trazabilidad, no bytes.
 */
export const FUENTES_ORIGINALES: readonly FuenteOriginal[] = [
  {
    sourceId: "O-IMG01",
    sourceAltOriginal: "Bufalos de agua en un pozo dentro de la pradera",
    widthOriginal: 603,
    heightOriginal: 423,
    bytesOriginal: 90263,
    sha256Original:
      "dd4904ea9ee89b668ea546d93584a91ab89e6ca5015837d1b432c18dd43cb260",
    usoPropuesto: "Candidata a hero solo tras aprobación; sin recorte.",
    estadoPermiso: "pendiente",
    fechaRegistro: "2026-09-19",
  },
  {
    sourceId: "O-IMG02",
    sourceAltOriginal: "Toros Brahman rojo pastando",
    widthOriginal: 1100,
    heightOriginal: 733,
    bytesOriginal: 224442,
    sha256Original:
      "21df0731f84e2fef366a38c701f1eec42c24dcf99be6cce50b03158df1b2425c",
    usoPropuesto: "Galería de oferta (ceba), tras aprobación.",
    estadoPermiso: "pendiente",
    fechaRegistro: "2026-09-19",
  },
  {
    sourceId: "O-IMG03",
    sourceAltOriginal: "Toros Brahman blanco bajo cobertizo",
    widthOriginal: 1100,
    heightOriginal: 733,
    bytesOriginal: 164798,
    sha256Original:
      "113fd2b8ddadccc7b239b5c9aecee294cb2371c93bfbc42bf6844d6b6a770a07",
    usoPropuesto: "Galería de oferta (cría), tras aprobación.",
    estadoPermiso: "pendiente",
    fechaRegistro: "2026-09-19",
  },
  {
    sourceId: "O-IMG04",
    sourceAltOriginal: "Bebedero de concreto techado en la finca",
    widthOriginal: 485,
    heightOriginal: 650,
    bytesOriginal: 94924,
    sha256Original:
      "0ce8ddf915d1b780ffca46cdc085099e09e451ce808d3c320719f44650074bb0",
    usoPropuesto:
      "Composición contenida proporcional a su resolución; sin ampliación (OT-Q023).",
    estadoPermiso: "pendiente",
    fechaRegistro: "2026-09-19",
  },
  {
    sourceId: "O-IMG05",
    sourceAltOriginal:
      "Feedlot cubierto con comederos de concreto para terminacion de ganado",
    widthOriginal: 1208,
    heightOriginal: 605,
    bytesOriginal: 245580,
    sha256Original:
      "a8c7809d434e6cddbc1dd594ee9af4a42fd8f7d76f41620fccde635f2c56c1f5",
    usoPropuesto: "Galería de infraestructura, tras aprobación.",
    estadoPermiso: "pendiente",
    fechaRegistro: "2026-09-19",
  },
  {
    sourceId: "O-IMG06",
    sourceAltOriginal:
      "Vista aerea de la planta solar dentro de la Hacienda Beraka, en San Onofre, Sucre",
    widthOriginal: 986,
    heightOriginal: 638,
    bytesOriginal: 190592,
    sha256Original:
      "6fb920ddf7c3bc1d77958ade202e84b58fe045bd4db6886b7706daddf696f0d8",
    usoPropuesto:
      "Bloque solar (pendiente OT-02); lazy por defecto, fuera del primer viewport.",
    estadoPermiso: "pendiente",
    fechaRegistro: "2026-09-19",
  },
];

export interface Derivado {
  readonly sourceId: SourceId;
  /** SHA-256 propio del archivo derivado (no del original). */
  readonly hashPropio: string;
  readonly bytes: number;
  readonly formato: FormatoDerivado;
  readonly width: number;
  readonly height: number;
  readonly crop: AjusteDerivado;
  /** Destino dentro del repo (p. ej. `src/assets/derivados/o-img01-768.webp`). */
  readonly destino: string;
  /** URL local de publicación; nunca remota, nunca base64, nunca rota. */
  readonly src: string;
  readonly srcset: string;
  readonly sizes: string;
  /** Alt revisado por humano; declarativo, sin certificar raza/propiedad. */
  readonly altRevisado: string;
  readonly estadoPermiso: EstadoPermiso;
  readonly fechaDerivacion: string;
  readonly carga: "eager" | "lazy";
}

/**
 * Registro de derivados publicados por la app. Vacío en el preprint:
 * sin originales no hay derivados y ninguna foto se publica.
 */
export const DERIVADOS: readonly Derivado[] = [];

export function esSourceId(valor: unknown): valor is SourceId {
  return (
    typeof valor === "string" &&
    (SOURCE_IDS as readonly string[]).includes(valor)
  );
}

export function fuenteOriginalDe(sourceId: SourceId): FuenteOriginal {
  const encontrada = FUENTES_ORIGINALES.find((f) => f.sourceId === sourceId);
  if (!encontrada) throw new Error(`Fuente desconocida: ${sourceId}`);
  return encontrada;
}

export function derivadosDe(sourceId: SourceId): Derivado[] {
  return DERIVADOS.filter((d) => d.sourceId === sourceId);
}

export type ResolucionRecurso =
  | { readonly estado: "ausente"; readonly sourceId: SourceId; readonly motivo: string }
  | { readonly estado: "disponible"; readonly sourceId: SourceId; readonly derivado: Derivado };

/**
 * Reembolso por `sourceId`: devuelve el primer derivado o `ausente` con
 * motivo explícito. Nunca devuelve un `src` inexistente (sin broken).
 */
export function resolverRecurso(sourceId: SourceId): ResolucionRecurso {
  const primero = derivadosDe(sourceId)[0];
  if (!primero) {
    return {
      estado: "ausente",
      sourceId,
      motivo:
        "Sin derivado generado: originales ausentes — operador encargado de la extracción (09_FUENTES/EXTRACCION_LOCAL.md).",
    };
  }
  return { estado: "disponible", sourceId, derivado: primero };
}

/**
 * Alt apto para publicar. Hoy siempre `null`: el `sourceAltOriginal` del
 * HTML NO se usa como identificación de raza/propiedad (OT-Q024) y no hay
 * derivados aprobados con `altRevisado`. Solo un derivado con
 * `estadoPermiso: "aprobado"` y alt validado podría exponerse.
 */
export function altParaPublicar(sourceId: SourceId): string | null {
  const resolucion = resolverRecurso(sourceId);
  if (resolucion.estado === "ausente") return null;
  const d = resolucion.derivado;
  if (d.estadoPermiso !== "aprobado") return null;
  if (validarAlt(d.altRevisado).length > 0) return null;
  return d.altRevisado;
}

/* OT-Q024 — El alt describe la escena; no certifica raza ni propiedad. */
const PATRONES_ALT_PROHIBIDOS: readonly { patron: RegExp; motivo: string }[] = [
  { patron: /brahman/i, motivo: "menciona raza (Brahman) sin identificación independiente" },
  { patron: /b[uú]falo/i, motivo: "menciona especie/raza sin identificación independiente" },
  { patron: /nelore|guzer[aá]|cebu/i, motivo: "menciona raza sin identificación independiente" },
  {
    patron: /hacienda beraka|puerta roja/i,
    motivo: "atribuye propiedad/ubicación a partir de la imagen",
  },
  {
    patron: /propiedad de|de nuestra (finca|hacienda)|nuestro ganado/i,
    motivo: "afirma propiedad a partir de la imagen",
  },
  { patron: /\braza\b/i, motivo: "certifica raza a partir de la imagen" },
  {
    patron: /certific|garantiz|gen[eé]tica pure/i,
    motivo: "certifica calidad/genética a partir de la imagen",
  },
];

/** Devuelve errores declarativos; lista vacía = alt aceptable. */
export function validarAlt(alt: unknown): string[] {
  if (typeof alt !== "string" || alt.trim().length === 0) {
    return ["alt: vacío o ausente; toda imagen publicada exige texto alternativo."];
  }
  const errores: string[] = [];
  if (alt.length > 180) errores.push("alt: supera 180 caracteres; resumir la escena.");
  for (const { patron, motivo } of PATRONES_ALT_PROHIBIDOS) {
    if (patron.test(alt)) errores.push(`alt: ${motivo} (OT-Q024).`);
  }
  return errores;
}

const FORMATOS: readonly string[] = ["avif", "webp", "jpeg"];
const AJUSTES: readonly string[] = ["ninguno", "contenido", "manual"];
const SHA256 = /^[0-9a-f]{64}$/;

/** OT-Q022 — Esquema de derivados: width/height/srcset/sizes coherentes. */
export function validarDerivado(candidato: unknown): string[] {
  const errores: string[] = [];
  if (typeof candidato !== "object" || candidato === null) {
    return ["derivado: no es un objeto."];
  }
  const d = candidato as Record<string, unknown>;

  if (!esSourceId(d["sourceId"])) {
    errores.push("derivado.sourceId: debe ser O-IMG01..O-IMG06.");
    return errores;
  }
  const fuente = fuenteOriginalDe(d["sourceId"]);

  if (typeof d["hashPropio"] !== "string" || !SHA256.test(d["hashPropio"])) {
    errores.push("derivado.hashPropio: SHA-256 propio de 64 hex requerido (OT-Q020).");
  }
  if (typeof d["bytes"] !== "number" || !Number.isInteger(d["bytes"]) || d["bytes"] <= 0) {
    errores.push("derivado.bytes: entero positivo requerido.");
  }
  if (typeof d["formato"] !== "string" || !FORMATOS.includes(d["formato"])) {
    errores.push("derivado.formato: avif|webp|jpeg requerido.");
  }
  if (
    typeof d["width"] !== "number" ||
    !Number.isInteger(d["width"]) ||
    d["width"] <= 0 ||
    typeof d["height"] !== "number" ||
    !Number.isInteger(d["height"]) ||
    d["height"] <= 0
  ) {
    errores.push("derivado: width/height enteros positivos requeridos (reserva de dimensiones).");
  } else {
    if (d["width"] > fuente.widthOriginal || d["height"] > fuente.heightOriginal) {
      errores.push(
        `derivado: ${d["width"]}×${d["height"]} supera el original ${fuente.widthOriginal}×${fuente.heightOriginal}; prohibido simular calidad (OT-Q023).`,
      );
    }
  }

  if (typeof d["destino"] !== "string" || !d["destino"].startsWith("src/assets/")) {
    errores.push("derivado.destino: debe vivir bajo src/assets/.");
  }
  if (
    typeof d["src"] !== "string" ||
    d["src"].length === 0 ||
    /^(https?:|data:|file:)/i.test(d["src"])
  ) {
    errores.push("derivado.src: URL local requerida; prohibido remoto, data: y file:.");
  }
  if (typeof d["srcset"] !== "string" || d["srcset"].trim().length === 0) {
    errores.push("derivado.srcset: requerido y no vacío.");
  } else {
    const entradas = d["srcset"].split(",").map((e) => e.trim()).filter(Boolean);
    const anchos: number[] = [];
    for (const entrada of entradas) {
      const m = /^(\S+)\s+(\d+)w$/.exec(entrada);
      if (!m) {
        errores.push(`derivado.srcset: entrada malformada «${entrada}» (se espera «url NNNw»).`);
        continue;
      }
      const w = Number(m[2]);
      anchos.push(w);
      if (
        typeof d["width"] === "number" &&
        (w <= 0 || w > (d["width"] as number))
      ) {
        errores.push(`derivado.srcset: descriptor ${w}w fuera del rango del derivado.`);
      }
      if (/^(https?:|data:|file:)/i.test(m[1])) {
        errores.push(`derivado.srcset: URL no local en «${entrada}».`);
      }
    }
    for (let i = 1; i < anchos.length; i++) {
      if (anchos[i] <= anchos[i - 1]) {
        errores.push("derivado.srcset: descriptores w en orden ascendente.");
        break;
      }
    }
  }
  if (typeof d["sizes"] !== "string" || d["sizes"].trim().length === 0) {
    errores.push("derivado.sizes: requerido junto a srcset.");
  }

  errores.push(...validarAlt(d["altRevisado"]).map((e) => `derivado.${e}`));

  if (typeof d["crop"] !== "string" || !AJUSTES.includes(d["crop"])) {
    errores.push("derivado.crop: ninguno|contenido|manual requerido.");
  }
  if (d["estadoPermiso"] !== "pendiente" && d["estadoPermiso"] !== "aprobado" && d["estadoPermiso"] !== "rechazado") {
    errores.push("derivado.estadoPermiso: pendiente|aprobado|rechazado requerido (OT-Q020).");
  }
  if (typeof d["fechaDerivacion"] !== "string" || d["fechaDerivacion"].length === 0) {
    errores.push("derivado.fechaDerivacion: requerida.");
  }
  if (d["carga"] !== "eager" && d["carga"] !== "lazy") {
    errores.push("derivado.carga: eager|lazy requerido.");
  }
  return errores;
}

/**
 * OT-Q020 — Trazabilidad exigible a todo derivado que se vaya a publicar:
 * sourceId + hash propio + permiso siempre presentes y válidos.
 */
export function trazabilidadCompleta(d: Derivado): boolean {
  return (
    esSourceId(d.sourceId) &&
    typeof d.hashPropio === "string" &&
    SHA256.test(d.hashPropio) &&
    (d.estadoPermiso === "pendiente" ||
      d.estadoPermiso === "aprobado" ||
      d.estadoPermiso === "rechazado") &&
    typeof d.fechaDerivacion === "string" &&
    d.fechaDerivacion.length > 0
  );
}

/** Un derivado solo es publicable aprobado, válido y con alt aceptable. */
export function esPublicableDerivado(d: Derivado): boolean {
  return (
    d.estadoPermiso === "aprobado" &&
    trazabilidadCompleta(d) &&
    validarDerivado(d).length === 0
  );
}

export interface EstrategiaCarga {
  readonly loading: "eager" | "lazy";
  readonly decoding?: "async" | "sync";
  readonly ajuste: AjusteDerivado;
  /** `false` = prohibido ampliar por encima de la resolución natural. */
  readonly permitirAmpliacion: boolean;
  /** Si se usa como hero/LCP puede optar por eager (opt-out explícito). */
  readonly optOutHeroPosible: boolean;
  readonly nota: string;
}

/**
 * Estrategia por foto (OT-Q023 + nota del inventario sobre la solar).
 * Sin derivados aún: orienta al generador y a la composición futura.
 */
export function estrategiaCarga(sourceId: SourceId): EstrategiaCarga {
  if (sourceId === "O-IMG04") {
    return {
      loading: "lazy",
      decoding: "async",
      ajuste: "contenido",
      permitirAmpliacion: false,
      optOutHeroPosible: false,
      nota:
        "OT-Q023: foto vertical 485×650; contenida en su composición " +
        "y nunca ampliada por encima de su resolución natural.",
    };
  }
  if (sourceId === "O-IMG06") {
    return {
      loading: "lazy",
      decoding: "async",
      ajuste: "ninguno",
      permitirAmpliacion: false,
      optOutHeroPosible: true,
      nota:
        "Solar fuera del primer viewport: lazy por defecto (puede no " +
        "renderizarse en capturas sin intersección); solo como hero/LCP " +
        "opta a eager con fetchpriority alta.",
    };
  }
  return {
    loading: "lazy",
    decoding: "async",
    ajuste: "ninguno",
    permitirAmpliacion: false,
    optOutHeroPosible: true,
    nota: "Bajo el primer viewport: lazy y decoding asíncrono; hero/LCP sin lazy.",
  };
}

/* OT-Q021 — Patrones que nunca deben aparecer en `dist/`. */
export const UMBRAL_BASE64 = 512;

export const PATRONES_PROHIBIDOS_DIST: readonly { nombre: string; patron: RegExp }[] = [
  { nombre: "base64-embebido", patron: /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]{512,}/ },
  { nombre: "ruta-privada", patron: /\.private-references/ },
  { nombre: "inventario-privado", patron: /inventory\.json/ },
  { nombre: "certificado", patron: /BEGIN (?:RSA PRIVATE KEY|PRIVATE KEY|CERTIFICATE)/ },
  { nombre: "clave", patron: /\.(?:pem|key)\b/ },
  { nombre: "entorno-local", patron: /\.env\b/ },
];

/** Nombres de patrones prohibidos hallados en un texto (vacío = limpio). */
export function contenidoDistProhibido(texto: string): string[] {
  return PATRONES_PROHIBIDOS_DIST.filter((p) => p.patron.test(texto)).map(
    (p) => p.nombre,
  );
}
