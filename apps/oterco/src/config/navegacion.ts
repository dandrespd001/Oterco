/**
 * OT-05 — Fuente única de ruteo del shell OTERCO.
 *
 * Los 13 enlaces `file:///` de la referencia (AUDITORIA_HTML_BASE.md:
 * 14 anchors totales, 13 hacia una carpeta local) NO se copian: esas rutas
 * locales romperían fuera del equipo original y exponen rutas personales.
 * Se sustituyen por anclas del propio documento; lo que aún no existe
 * (contacto real, páginas futuras) queda `pendienteAP` con href a una
 * sección disponible del propio documento, nunca a file:// ni a URL
 * inventada (CONFIGURACION_Y_CONTRATOS.md: sin destinos apagados, sin
 * file://, sin javascript:, sin rutas absolutas personales).
 *
 * Secciones actuales: portafolio, fincas, manejo, infraestructura
 * (subanclas bebederos/feedlot/solar), cierre. Contacto futuro: OT-07/OT-15.
 */

export type EstadoDestino = "valido" | "pendienteAP";

export interface Destino {
  /** Identificador interno del destino. */
  readonly id: string;
  /** href emitido: siempre ancla del propio documento. */
  readonly href: string;
  /** Texto del enlace. */
  readonly etiqueta: string;
  /** "valido" = ancla existente; "pendienteAP" = ruta futura, ancla de repliegue. */
  readonly estado: EstadoDestino;
  /** Por qué este estado. */
  readonly nota: string;
}

/** Destinos válidos hoy: anclas existentes en la portada. */
export const DESTINOS_VALIDOS: readonly Destino[] = [
  { id: "portafolio", href: "#portafolio", etiqueta: "Portafolio", estado: "valido", nota: "Sección oferta al comprador." },
  { id: "fincas", href: "#fincas", etiqueta: "Fincas", estado: "valido", nota: "Capítulos Beraka y Puerta Roja." },
  { id: "manejo", href: "#manejo", etiqueta: "Manejo", estado: "valido", nota: "Estructura reservada de hato y manejo." },
  { id: "infraestructura", href: "#infraestructura", etiqueta: "Infraestructura", estado: "valido", nota: "Subapartados con ancla propia." },
  { id: "bebederos", href: "#bebederos", etiqueta: "Bebederos y agua", estado: "valido", nota: "Subancla de infraestructura." },
  { id: "feedlot", href: "#feedlot", etiqueta: "Feedlot y praderas", estado: "valido", nota: "Subancla de infraestructura." },
  { id: "solar", href: "#solar", etiqueta: "Solar en Beraka", estado: "valido", nota: "Ficha secundaria pendiente de cifras; la sección existe." },
  { id: "cierre", href: "#cierre", etiqueta: "Cierre", estado: "valido", nota: "Cierre editorial." },
  { id: "contenido", href: "#contenido", etiqueta: "Contenido", estado: "valido", nota: "Destino del skip-link y de la marca." },
];

/**
 * Destinos pendientes de aprobación: href de repliegue a una sección
 * disponible del propio documento + data-estado="pendienteAP" en el enlace.
 * Nada de file://, nada de dominios/buzones/teléfonos inventados.
 */
export const DESTINOS_PENDIENTES: readonly Destino[] = [
  {
    id: "contacto",
    href: "#cierre",
    etiqueta: "Contacto",
    estado: "pendienteAP",
    nota: "Buzón/dominio/teléfono sin verificar ni aprobar (OT-07/OT-15); repliega a #cierre.",
  },
];

/** Masthead en escritorio: cinco destinos (DISENO.md §Masthead), sin sticky. */
export const INDICE_MASTHEAD: readonly Destino[] = [
  DESTINOS_VALIDOS[0],
  DESTINOS_VALIDOS[1],
  DESTINOS_VALIDOS[2],
  DESTINOS_VALIDOS[3],
  DESTINOS_PENDIENTES[0],
];

/**
 * Mapa de correspondencia de los 13 enlaces file:/// de la referencia.
 * Las rutas originales no se transcriben (eran carpetas locales del equipo
 * anterior); se clasifican por categoría presunta y se asigna destino actual.
 */
export interface MapeoReferencia {
  readonly ref: string;
  readonly categoria: string;
  readonly destinoId: string;
}

export const MAPEO_REFERENCIA: readonly MapeoReferencia[] = [
  { ref: "file:///… (nav 1/5)", categoria: "navegación a portafolio/oferta", destinoId: "portafolio" },
  { ref: "file:///… (nav 2/5)", categoria: "navegación a fincas", destinoId: "fincas" },
  { ref: "file:///… (nav 3/5)", categoria: "navegación a ganado/manejo", destinoId: "manejo" },
  { ref: "file:///… (nav 4/5)", categoria: "navegación a infraestructura", destinoId: "infraestructura" },
  { ref: "file:///… (nav 5/5)", categoria: "navegación a contacto/cierre", destinoId: "contacto" },
  { ref: "file:///… (cta héroe)", categoria: "CTA consultar portafolio", destinoId: "portafolio" },
  { ref: "file:///… (cta secundario)", categoria: "CTA contacto/cierre", destinoId: "cierre" },
  { ref: "file:///… (capítulo finca 1)", categoria: "ancla capítulo de finca", destinoId: "fincas" },
  { ref: "file:///… (capítulo finca 2)", categoria: "ancla capítulo de finca", destinoId: "fincas" },
  { ref: "file:///… (infra bebederos)", categoria: "subancla bebederos/agua", destinoId: "bebederos" },
  { ref: "file:///… (infra feedlot)", categoria: "subancla feedlot/praderas", destinoId: "feedlot" },
  { ref: "file:///… (infra solar)", categoria: "subancla solar", destinoId: "solar" },
  { ref: "file:///… (pie/contacto)", categoria: "pie o contacto", destinoId: "contacto" },
];

/** Todos los destinos emitidos por el shell (válidos + pendientes). */
export const TODOS_LOS_DESTINOS: readonly Destino[] = [
  ...DESTINOS_VALIDOS,
  ...DESTINOS_PENDIENTES,
];

/** Resuelve un id de destino a su registro, si existe. */
export function destinoPorId(id: string): Destino | undefined {
  return TODOS_LOS_DESTINOS.find((d) => d.id === id);
}
