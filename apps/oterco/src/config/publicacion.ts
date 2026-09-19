/**
 * OT-02 — Puerta editorial única.
 *
 * `isPublicable()` devuelve "tecnica" o "comercial" según las aprobaciones
 * leídas de los datos (`Perfil.aprobaciones`); ningún token está hardcodeado.
 * Sin NIT/contacto aprobados (y buzón verificado) la salida es técnica:
 * bloquea la release comercial sin impedir la entrega técnica.
 * Todo perfil con errores de `validarPerfil` también es técnico, aunque sus
 * aprobaciones parezcan completas: la puerta no publica datos inválidos.
 * El bloque solar y la afirmación de fotos, si siguen pendientes, se omiten
 * de la proyección pública con sus metadatos (sin reemplazos ficticios).
 */
import { validarPerfil, type AlcanceAprobacion, type Perfil } from "../content/perfil.ts";

export type NivelPublicacion = "tecnica" | "comercial";

export interface FincaPublica {
  readonly id: string;
  readonly nombre: string;
  readonly municipio: string;
  readonly departamento: string;
  readonly funcion: string;
  readonly texto: string;
  readonly etiquetas: readonly string[];
}

export interface LineaPublica {
  readonly categoria: string;
  readonly titulo: string;
  readonly descripcion: string;
}

export interface ProyeccionPublica {
  readonly nivel: NivelPublicacion;
  readonly razonSocial: string;
  readonly perfil: string;
  readonly region: string;
  readonly enfoque: string;
  /** NIT completo solo si está aprobado; en otro caso null (ni transcrito). */
  readonly nit: string | null;
  readonly fincas: readonly FincaPublica[];
  readonly oferta: readonly LineaPublica[];
  readonly contactoEmail: string | null;
  readonly solar: { readonly potencia: string; readonly area: string } | null;
  readonly fotosAfirmacion: string | null;
  /** Qué se omitió y por qué: informe al operador, no nota al navegador. */
  readonly omitidos: readonly string[];
}

/** Alcances con revisión expresa registrada en los datos. */
export function alcancesAprobados(perfil: Perfil): AlcanceAprobacion[] {
  const vistos: AlcanceAprobacion[] = [];
  for (const entrada of perfil.aprobaciones) {
    for (const token of entrada.alcance) {
      if (!vistos.includes(token)) vistos.push(token);
    }
  }
  return vistos;
}

function campoAprobado(
  estado: string,
  token: AlcanceAprobacion,
  alcances: readonly AlcanceAprobacion[],
): boolean {
  return estado === "aprobado" && alcances.includes(token);
}

/** Motivos críticos que impiden la release comercial (no la técnica). */
export function motivosBloqueo(perfil: Perfil): string[] {
  const motivos: string[] = [];
  const errores = validarPerfil(perfil as unknown);
  if (errores.length > 0) {
    motivos.push(
      `validacion: perfil con ${errores.length} error(es) de validación; bloquea release comercial.`,
    );
  }
  const alcances = alcancesAprobados(perfil);
  if (!campoAprobado(perfil.identidad.nit.estado, "nit", alcances)) {
    motivos.push(
      "nit: NIT completo pendiente de confirmación con O-D03; bloquea release comercial.",
    );
  }
  const contacto = perfil.contacto;
  if (!(campoAprobado(contacto.estado, "contacto", alcances) && contacto.verificado)) {
    motivos.push(
      "contacto: email sin verificación humana ni aprobación registrada; bloquea release comercial.",
    );
  }
  return motivos;
}

/** Puerta editorial única: "tecnica" por defecto; "comercial" solo con críticos aprobados. */
export function isPublicable(perfil: Perfil): NivelPublicacion {
  return motivosBloqueo(perfil).length === 0 ? "comercial" : "tecnica";
}

const ETIQUETA_SOLAR = /solar|MW/i;

/**
 * Proyección apta para salida pública: excluye todo campo conflictivo sin
 * aprobación (NIT, contacto, solar, fotos). Lo omitido queda en `omitidos`
 * para informar al operador; nunca se sustituye por cifras ficticias.
 */
export function proyeccionPublica(perfil: Perfil): ProyeccionPublica {
  const alcances = alcancesAprobados(perfil);
  const omitidos: string[] = [];

  const nitOk = campoAprobado(perfil.identidad.nit.estado, "nit", alcances);
  if (!nitOk) omitidos.push("nit: omitido (pendiente de confirmación O-D03).");

  const contacto = perfil.contacto;
  const contactoOk = campoAprobado(contacto.estado, "contacto", alcances) && contacto.verificado;
  if (!contactoOk) omitidos.push("contacto: omitido (buzón sin verificar ni aprobar).");

  const solarOk = campoAprobado(perfil.solar.estado, "solar", alcances);
  if (!solarOk) {
    omitidos.push("solar: omitido (cifras en conflicto O-D04, pendientes de confirmar).");
    omitidos.push("finca.beraka: mención y etiqueta solares omitidas con el bloque.");
  }

  const fotosOk = campoAprobado(perfil.fotos.estado, "fotos", alcances);
  if (!fotosOk) omitidos.push("fotos: afirmación de origen omitida (sin licencias registradas).");

  return {
    nivel: isPublicable(perfil),
    razonSocial: perfil.identidad.razonSocial,
    perfil: perfil.identidad.perfil,
    region: perfil.identidad.region,
    enfoque: perfil.identidad.enfoque,
    nit: nitOk ? perfil.identidad.nit.valorCompletoPropuesto : null,
    fincas: perfil.fincas.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      municipio: f.municipio,
      departamento: f.departamento,
      funcion: f.funcion,
      texto: f.texto,
      etiquetas: solarOk ? f.etiquetas : f.etiquetas.filter((e) => !ETIQUETA_SOLAR.test(e)),
    })),
    oferta: perfil.oferta.map((l) => ({
      categoria: l.categoria,
      titulo: l.titulo,
      descripcion: l.descripcion,
    })),
    contactoEmail: contactoOk ? contacto.email : null,
    solar: solarOk ? { potencia: perfil.solar.potencia, area: perfil.solar.area } : null,
    fotosAfirmacion: fotosOk ? perfil.fotos.afirmacion : null,
    omitidos,
  };
}
