/**
 * OT-07 — Motor puro del preparador local de consulta.
 *
 * Sin dependencias, sin DOM, sin red, sin almacenamiento. Recibe entradas
 * normalizadas y devuelve asunto/cuerpo deterministas o un error tipificado.
 *
 * Contrato (04_FUNCIONES/PREPARADOR_DE_CONSULTA.md):
 * - `topic`: enum de 3 categorías; elegir antes de generar.
 * - `message`: texto libre opcional ≤800 caracteres (puntos de código Unicode);
 *   trim exterior, párrafos conservados, controles no imprimibles rechazados
 *   salvo salto de línea y tabulación.
 * - Resultado: asunto fijo por categoría + cuerpo en texto plano que comienza
 *   «Deseo consultar sobre [línea de portafolio]» y añade el mensaje;
 *   indica «Borrador de consulta, no cotización ni confirmación de disponibilidad».
 * - Sin precios, sin campos obligatorios no pedidos, sin persistencia.
 *
 * Catálogo: los literales de línea provienen de la transcripción O-D01
 * (perfil.datos.ts: oferta). `crearCatalogo()` los construye desde los
 * datos del perfil sin congelar títulos confirmables; el catálogo por
 * defecto se deriva de esa misma función desde un espejo transcrito
 * (fuente única: perfil.datos → etiqueta/asunto coherentes). `motor.ts`
 * no importa el perfil para seguir sin dependencias; un test fija la
 * igualdad entre el catálogo por defecto y `crearCatalogo(perfil.oferta)`.
 * Nada inventado: etiquetas y títulos ya publicados en OT-06.
 */

/** Límite exacto del contrato: 800 caracteres (puntos de código Unicode). */
export const MENSAJE_MAX = 800;

/** Identificadores estables de las tres categorías del contrato. */
export const TEMAS = ["ganado-en-pie", "hembras-reemplazo", "pastaje-levante"] as const;

export type TemaId = (typeof TEMAS)[number];

export interface EntradaCatalogo {
  readonly id: string;
  readonly categoria: string;
  readonly titulo: string;
}

export interface TemaCatalogo {
  readonly id: TemaId;
  /** Etiqueta corta para el selector y el asunto. */
  readonly etiqueta: string;
  /** Línea de portafolio citada en el cuerpo («Deseo consultar sobre …»). */
  readonly linea: string;
  readonly asunto: string;
}

export type CodigoErrorPreparador =
  | "TEMA_INVALIDO"
  | "MENSAJE_NO_TEXTO"
  | "MENSAJE_CONTROLES"
  | "MENSAJE_LIMITE";

export interface ErrorPreparador {
  readonly ok: false;
  readonly codigo: CodigoErrorPreparador;
  readonly detalle: string;
}

export interface BorradorPreparado {
  readonly ok: true;
  readonly tema: TemaId;
  readonly asunto: string;
  readonly cuerpo: string;
  /** Longitud del mensaje normalizado, en puntos de código. */
  readonly mensajeLongitud: number;
}

export type ResultadoPreparador = BorradorPreparado | ErrorPreparador;

/**
 * Correspondencia tema del preparador ↔ línea transcrita del perfil.
 * `cria` (título «Hembras de reemplazo») y `servicio` (título «Pastaje y
 * levante por contrato») conservan sus ids de transcripción en los datos;
 * aquí se exponen con los slugs estables del contrato del preparador.
 */
const TEMA_POR_LINEA: Readonly<Record<string, TemaId>> = {
  "ganado-en-pie": "ganado-en-pie",
  cria: "hembras-reemplazo",
  servicio: "pastaje-levante",
};

/**
 * Espejo transcrito de la oferta O-D01 (perfil.datos.ts): `motor.ts` no
 * importa el perfil para seguir sin dependencias; este espejo y el
 * catálogo por defecto quedan fijados por test contra
 * `crearCatalogo(perfilBase.oferta)` (fuente única, sin ruta divergente).
 */
const OFERTA_TRANSCRITA_O_D01: readonly EntradaCatalogo[] = [
  { id: "ganado-en-pie", categoria: "Ganado en pie", titulo: "Animales de ceba terminados" },
  { id: "cria", categoria: "Cría", titulo: "Hembras de reemplazo" },
  { id: "servicio", categoria: "Servicio", titulo: "Pastaje y levante por contrato" },
];

const AVISO_BORRADOR = "Borrador de consulta, no cotización ni confirmación de disponibilidad.";

/**
 * Construye el catálogo del preparador desde la oferta del perfil
 * (`perfil.oferta`), sin congelar títulos confirmables: el asunto usa la
 * categoría literal y la línea citada combina categoría + título vigente.
 * Las entradas desconocidas se ignoran; si alguna de las tres falta, el
 * catálogo resultante la omite y `preparar()` la rechaza como TEMA_INVALIDO.
 */
export function crearCatalogo(oferta: readonly EntradaCatalogo[]): readonly TemaCatalogo[] {
  const catalogo: TemaCatalogo[] = [];
  for (const linea of oferta) {
    const tema = TEMA_POR_LINEA[linea.id];
    if (tema === undefined) continue;
    if (catalogo.some((t) => t.id === tema)) continue;
    const categoria = linea.categoria.trim();
    const titulo = linea.titulo.trim();
    if (categoria.length === 0 || titulo.length === 0) continue;
    const etiqueta = tema === "ganado-en-pie" ? categoria : titulo;
    catalogo.push({
      id: tema,
      etiqueta,
      linea: `${categoria} — ${titulo}`,
      asunto: `Consulta OTERCO — ${tema === "ganado-en-pie" ? categoria : titulo}`,
    });
  }
  return catalogo.sort((a, b) => TEMAS.indexOf(a.id) - TEMAS.indexOf(b.id));
}

/**
 * Catálogo por defecto: derivado de `crearCatalogo()` sobre el espejo
 * transcrito O-D01 (coherente con `crearCatalogo(perfilBase.oferta)` por
 * test; sin literales paralelos que puedan divergir).
 */
export const CATALOGO_PREPARADOR: readonly TemaCatalogo[] =
  crearCatalogo(OFERTA_TRANSCRITA_O_D01);

/** ¿Es `tema` una de las tres categorías del contrato? */
export function esTemaValido(tema: unknown): tema is TemaId {
  return typeof tema === "string" && (TEMAS as readonly string[]).includes(tema);
}

/** Controles no imprimibles; se permiten \n (10) y \t (9). */
const CONTROLES_PROHIBIDOS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

export interface MensajeNormalizado {
  readonly texto: string;
  readonly longitud: number;
}

function normalizarMensaje(mensaje: unknown): MensajeNormalizado | ErrorPreparador {
  if (typeof mensaje !== "string") {
    return { ok: false, codigo: "MENSAJE_NO_TEXTO", detalle: "El mensaje debe ser texto." };
  }
  // Normalizar saltos CRLF/CR a LF y recortar solo el exterior (párrafos intactos).
  const texto = mensaje.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (CONTROLES_PROHIBIDOS.test(texto)) {
    return {
      ok: false,
      codigo: "MENSAJE_CONTROLES",
      detalle: "El mensaje contiene caracteres de control no permitidos.",
    };
  }
  // Longitud en puntos de código Unicode (emoji y tildes cuentan como lo ve el usuario).
  const longitud = Array.from(texto).length;
  if (longitud > MENSAJE_MAX) {
    return {
      ok: false,
      codigo: "MENSAJE_LIMITE",
      detalle: `El mensaje admite como máximo ${MENSAJE_MAX} caracteres (recibidos ${longitud}).`,
    };
  }
  return { texto, longitud };
}

/**
 * Genera asunto + cuerpo deterministas. El mensaje vacío está permitido.
 * El texto del usuario viaja como texto plano: esta función no escapa HTML
 * porque no emite HTML; la presentación debe usar textContent/value,
 * nunca innerHTML (OT-Q027 se cierra en la capa de presentación).
 */
export function preparar(
  tema: unknown,
  mensaje: unknown,
  catalogo: readonly TemaCatalogo[] = CATALOGO_PREPARADOR,
): ResultadoPreparador {
  if (!esTemaValido(tema)) {
    return {
      ok: false,
      codigo: "TEMA_INVALIDO",
      detalle: "Elija una de las tres categorías antes de generar.",
    };
  }
  const entrada = catalogo.find((t) => t.id === tema);
  if (entrada === undefined) {
    return {
      ok: false,
      codigo: "TEMA_INVALIDO",
      detalle: "Categoría no disponible en el catálogo vigente.",
    };
  }
  const normalizado = normalizarMensaje(mensaje);
  if (!("texto" in normalizado)) return normalizado;
  const cuerpo =
    normalizado.texto.length === 0
      ? `Deseo consultar sobre ${entrada.linea}.\n\n${AVISO_BORRADOR}`
      : `Deseo consultar sobre ${entrada.linea}.\n\n${normalizado.texto}\n\n${AVISO_BORRADOR}`;
  return {
    ok: true,
    tema,
    asunto: entrada.asunto,
    cuerpo,
    mensajeLongitud: normalizado.longitud,
  };
}
