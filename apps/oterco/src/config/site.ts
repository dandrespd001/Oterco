/**
 * Configuración local del sitio (OT-01).
 * Valores técnicos de andamiaje: NO son dominio, contacto ni marca aprobados.
 * El dominio/contacto reales quedan pendientes de aprobación (fixtures no publicables).
 */
export interface SiteConfig {
  /** Nombre interno de trabajo. No es marca aprobada. */
  readonly internalName: "OTERCO-TECH";
  /** Idioma del documento técnico. */
  readonly lang: "es";
  /** robots técnico: la página de prueba no debe indexarse. */
  readonly robots: "noindex, nofollow";
}

export const siteConfig: SiteConfig = {
  internalName: "OTERCO-TECH",
  lang: "es",
  robots: "noindex, nofollow",
};
