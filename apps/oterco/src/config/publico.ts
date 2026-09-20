/**
 * OT-08 — Configuración pública única (SEO técnico, sin dominio aprobado).
 *
 * Fuente única de metadatos públicos, canonical, robots, sitemap, cabeceras
 * y datos estructurados LD+JSON. Reglas:
 *
 * - El hostname aprobado está pendienteAP (OT-15/OT-16): se usa una base
 *   reservada no vinculante (NO-BINDING, sufijo `.invalid` que nunca
 *   resuelve) marcada como pendienteAP en cada artefacto. No se inventa
 *   ningún dominio real.
 * - La salida NO depende de contacto/NIT: esos campos solo aparecen cuando
 *   `isPublicable(perfil) === "comercial"` (puerta OT-02) y, aun así, el
 *   canonical real exige dominio aprobado, que hoy no existe (OT-15/16).
 * - En modo técnico la página sigue `noindex` fixture y sin canonical real;
 *   el bloque LD+JSON solo se emite en modo comercial (el dist técnico
 *   conserva cero elementos ejecutables, OT-Q013 intacto).
 * - schema.org no define un tipo Granja/Finca: las fincas se expresan como
 *   `Place` en `location` de `Organization` (no en `department`, que
 *   espera `Organization`), con solo datos transcritos no conflictivos.
 *   Solar, NIT, contacto y afirmación de fotos solo entran si la proyección
 *   los trae aprobados (hoy: ausentes).
 */
import { isPublicable, proyeccionPublica } from "./publicacion.ts";
import type { ProyeccionPublica } from "./publicacion.ts";
import type { Perfil } from "../content/perfil.ts";

/** Entorno de salida: técnico (fixture, no publicable) o comercial. */
export type EntornoPublico = "tecnico" | "comercial";

/**
 * Host reservado no vinculante (NO-BINDING): sufijo `.invalid` (RFC 2606),
 * nunca resuelve. Marcador pendienteAP hasta que OT-15 apruebe el dominio.
 */
export const HOST_RESERVADO = "oterco-pendiente-ap.invalid";

/** Base URL reservada construida sobre el host no vinculante. */
export const BASE_RESERVADA = `https://${HOST_RESERVADO}`;

/** Marca textual que acompaña a todo valor pendiente de aprobación. */
export const MARCA_PENDIENTE_AP = "pendienteAP";

/** Rutas públicas del sitio estático (sin fallback de SPA). */
export const RUTAS_PUBLICAS: readonly string[] = ["/", "/privacidad/"];

/**
 * Metadatos técnicos: réplica exacta de los que emite BaseLayout (OT-05).
 * Se espejan aquí para verificar coherencia dist ↔ configuración sin
 * modificar el layout ni sus pruebas.
 */
export const TITULO_TECNICO = "OTERCO — Prototipo editorial (fixture, no publicable)";
export const DESCRIPCION_TECNICA = "FIXTURE OT-05 — prototipo editorial no publicable de OTERCO.";
export const ROBOTS_TECNICO = "noindex, nofollow";

/** El dominio real sigue sin aprobarse: ningún canonical apunta a la web. */
export const DOMINIO_APROBADO: string | null = null;

/** Resuelve el entorno desde la puerta editorial OT-02 (sin hardcodear). */
export function resolverEntorno(perfil: Perfil): EntornoPublico {
  return isPublicable(perfil) === "comercial" ? "comercial" : "tecnico";
}

export interface MetadatosPagina {
  readonly titulo: string;
  readonly descripcion: string;
  readonly robots: string;
  /** URL canónica real o null (pendienteAP: sin dominio aprobado). */
  readonly canonical: string | null;
  readonly motivoCanonical: string;
}

/**
 * Título comercial coherente con el contenido real, sin promesas
 * (sin superlativos, precios, certificaciones ni disponibilidad).
 */
export function tituloComercial(proyeccion: ProyeccionPublica): string {
  return `${proyeccion.razonSocial} — ${proyeccion.perfil}`;
}

/** Descripción comercial desde región, enfoque y categorías de oferta. */
export function descripcionComercial(proyeccion: ProyeccionPublica): string {
  const categorias = proyeccion.oferta.map((l) => l.categoria).join(", ");
  return `${proyeccion.razonSocial}: ${proyeccion.perfil}. ${proyeccion.region}. Oferta: ${categorias}.`;
}

/** Metadatos de una página según entorno; canonical solo con dominio aprobado. */
export function metadatosPara(entorno: EntornoPublico, perfil: Perfil): MetadatosPagina {
  if (entorno === "comercial" && DOMINIO_APROBADO !== null) {
    const proyeccion = proyeccionPublica(perfil);
    return {
      titulo: tituloComercial(proyeccion),
      descripcion: descripcionComercial(proyeccion),
      robots: "index, follow",
      canonical: `https://${DOMINIO_APROBADO}/`,
      motivoCanonical: "comercial con dominio aprobado.",
    };
  }
  if (entorno === "comercial") {
    const proyeccion = proyeccionPublica(perfil);
    return {
      titulo: tituloComercial(proyeccion),
      descripcion: descripcionComercial(proyeccion),
      robots: ROBOTS_TECNICO,
      canonical: null,
      motivoCanonical:
        "canonical pendienteAP: entorno comercial sin dominio aprobado; no se emite URL real (OT-15/OT-16).",
    };
  }
  return {
    titulo: TITULO_TECNICO,
    descripcion: DESCRIPCION_TECNICA,
    robots: ROBOTS_TECNICO,
    canonical: null,
    motivoCanonical:
      "canonical pendienteAP: prototipo técnico no publicable; no se emite URL real (OT-15/OT-16).",
  };
}

export interface GrafoJsonLd {
  readonly "@context": "https://schema.org";
  readonly "@type": "Organization";
  readonly name: string;
  readonly description: string;
  readonly areaServed: string;
  readonly knowsAbout: readonly string[];
  /** Fincas como Place (schema.org: location admite Place; department no). */
  readonly location: readonly unknown[];
  readonly email?: string;
  readonly identifier?: string;
}

/**
 * Grafo Organization con SOLO datos aprobados de la proyección: NIT e
 * email solo si existen (aprobados); solar/fotos conflictivos nunca entran
 * porque la proyección ya los filtra. Las fincas (transcripción no
 * conflictiva) se expresan como Place en `location`.
 */
export function construirJsonLd(proyeccion: ProyeccionPublica): GrafoJsonLd {
  const grafo: {
    "@context": "https://schema.org";
    "@type": "Organization";
    name: string;
    description: string;
    areaServed: string;
    knowsAbout: readonly string[];
    location: readonly unknown[];
    email?: string;
    identifier?: string;
  } = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: proyeccion.razonSocial,
    description: descripcionComercial(proyeccion),
    areaServed: proyeccion.region,
    knowsAbout: proyeccion.oferta.map((l) => l.titulo),
    location: proyeccion.fincas.map((f) => ({
      "@type": "Place",
      name: f.nombre,
      address: {
        "@type": "PostalAddress",
        addressLocality: f.municipio,
        addressRegion: f.departamento,
        addressCountry: "CO",
      },
    })),
  };
  if (proyeccion.contactoEmail !== null) grafo.email = proyeccion.contactoEmail;
  if (proyeccion.nit !== null) grafo.identifier = proyeccion.nit;
  return grafo;
}

/**
 * Bloque LD+JSON para la página: null en técnico (el dist conserva cero
 * elementos ejecutables) y objeto solo con datos aprobados en comercial.
 * Punto de cableado en BaseLayout cuando OT-15 apruebe el dominio.
 */
export function jsonLdParaPagina(
  entorno: EntornoPublico,
  perfil: Perfil,
): GrafoJsonLd | null {
  if (entorno !== "comercial") return null;
  return construirJsonLd(proyeccionPublica(perfil));
}

/**
 * robots.txt según entorno. Técnico: cierre total (coherente con noindex).
 * Comercial: permite y anuncia sitemap sobre la base reservada marcada
 * pendienteAP hasta que OT-15/OT-16 fijen el dominio real.
 */
export function generarRobots(entorno: EntornoPublico): string {
  const cabecera =
    "# OT-08 robots — base reservada NO-BINDING pendienteAP (OT-15/OT-16):\n" +
    `# ${BASE_RESERVADA} — este host nunca resuelve; no es un dominio real.\n`;
  if (entorno === "comercial") {
    return (
      `${cabecera}User-agent: *\nAllow: /\nSitemap: ${BASE_RESERVADA}/sitemap.xml\n`
    );
  }
  return `${cabecera}User-agent: *\nDisallow: /\n`;
}

/** Sitemap técnico: vacío (sin elementos url) mientras el sitio sea noindex.
 *
 * Fixture no vinculante pendienteAP (OT-15/OT-16): con `Disallow: /` y
 * `noindex` ningún rastreador debe usar este mapa; listar URLs sugeriría
 * un sitio rastreable que hoy no existe. El parámetro `rutas` documenta
 * las rutas reservadas para la release comercial (ver RUTAS_PUBLICAS) y
 * la base reservada NO-BINDING se declara solo en el comentario. Al
 * aprobarse dominio + indexación, esta función volverá a emitir un
 * elemento url por ruta sobre la base real.
 */
export function generarSitemap(_rutas: readonly string[]): string {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    "<!-- OT-08 sitemap — fixture NO-BINDING pendienteAP (OT-15/OT-16): sin elementos url mientras noindex; " +
    `base reservada ${BASE_RESERVADA} que nunca resuelve; rutas públicas reservadas para la release comercial. -->\n` +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n'
  );
}

/**
 * Cabeceras estáticas por destino (fichero `_headers`). CSP base
 * restrictiva y cero scripts; HTML mutable con revalidación y activos con
 * hash (`/_astro/`) con cache larga inmutable. Fuente única: el fichero
 * `public/_headers` checked-in debe coincidir con esta salida.
 */
export function generarHeaders(): string {
  const seguridad =
    "  X-Content-Type-Options: nosniff\n" +
    "  Referrer-Policy: strict-origin-when-cross-origin\n" +
    "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()\n" +
    "  Content-Security-Policy: default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'none'\n";
  return (
    "# OT-08 cabeceras estáticas por destino (sin servidor de aplicación).\n" +
    "# HTML y ficheros mutables: revalidación; activos con hash: inmutable.\n" +
    "/*:\n" +
    seguridad +
    "  Cache-Control: public, max-age=0, must-revalidate\n" +
    "/_astro/*:\n" +
    seguridad +
    "  Cache-Control: public, max-age=31536000, immutable\n"
  );
}
