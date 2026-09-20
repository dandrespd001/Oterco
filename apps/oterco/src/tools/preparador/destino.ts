/**
 * OT-07 — Destino de correo del preparador local.
 *
 * Sin dependencias, sin DOM, sin red, sin almacenamiento. Decide si el
 * `mailto:` puede ofrecerse y lo construye de forma segura.
 *
 * Reglas (04_FUNCIONES/PREPARADOR_DE_CONSULTA.md + CONTACTO_Y_PRIVACIDAD.md):
 * - El destinatario procede SOLO de la configuración aprobada: contacto con
 *   `estado === "aprobado"`, `verificado === true` y token `"contacto"` en el
 *   registro `aprobaciones`. Cualquier otro estado → modo copia con el
 *   segmento «contacto pendiente de aprobación» y mailto deshabilitado.
 * - El destino de los datos se revalida aquí (formato + sin controles): un
 *   fixture no confiable nunca llega crudo al URI.
 * - Asunto/cuerpo se codifican con `encodeURIComponent`; no hay destinatario
 *   arbitrario ni nuevas cabeceras: el URI solo lleva `subject` y `body`.
 * - Si el URI queda demasiado largo, se ofrece copiar y abrir el correo sin
 *   cuerpo. Nunca se anuncia envío confirmado: abrir el cliente externo no
 *   acredita entrega.
 */

/** Texto mostrado cuando el contacto aún no está aprobado. */
export const DESTINO_PENDIENTE_TEXTO = "contacto pendiente de aprobación";

/** Longitud máxima orientativa del URI antes de ofrecer el modo copia. */
export const MAILTO_URI_MAX = 2000;

export interface ContactoDato {
  readonly email: string;
  readonly estado: string;
  readonly verificado: boolean;
}

export interface AprobacionDato {
  readonly alcance: readonly string[];
}

/** Formato estricto de buzón: sin espacios, sin controles, con dominio. */
const EMAIL_FORMATO = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const CONTROLES = /[\x00-\x1F\x7F]/;

export function esEmailValido(email: unknown): email is string {
  return typeof email === "string" && !CONTROLES.test(email) && EMAIL_FORMATO.test(email);
}

export type EstadoDestino = "aprobado" | "pendienteAP";

export interface DestinoAprobado {
  readonly estado: "aprobado";
  readonly email: string;
}

export interface DestinoPendiente {
  readonly estado: "pendienteAP";
  /** Segmento visible y copiable en lugar del buzón (nunca el email sin aprobar). */
  readonly destinoMostrado: string;
  /** Motivo para el `title` del control deshabilitado y el informe. */
  readonly razon: string;
}

export type DecisionDestino = DestinoAprobado | DestinoPendiente;

/**
 * Resuelve el destino desde los datos del perfil. Solo `estado==="aprobado"`
 * + verificado + token en `aprobaciones` habilita el mailto; en dist (OT-02:
 * contacto SIN aprobar) devuelve el segmento pendienteAP. El email de los
 * datos se revalida aunque venga del único fixture permitido.
 */
export function resolverDestino(
  contacto: ContactoDato,
  aprobaciones: readonly AprobacionDato[],
): DecisionDestino {
  const alcances: string[] = [];
  for (const entrada of aprobaciones) {
    if (Array.isArray(entrada.alcance)) {
      for (const token of entrada.alcance) {
        if (typeof token === "string" && !alcances.includes(token)) alcances.push(token);
      }
    }
  }
  const aprobado =
    contacto.estado === "aprobado" &&
    contacto.verificado === true &&
    alcances.includes("contacto") &&
    esEmailValido(contacto.email);
  if (aprobado) return { estado: "aprobado", email: contacto.email };
  const razon =
    contacto.estado !== "aprobado"
      ? "Buzón sin aprobación registrada (OT-07/OT-15); solo copia manual."
      : contacto.verificado !== true
        ? "Buzón sin verificación humana; solo copia manual."
        : !alcances.includes("contacto")
          ? "Sin token «contacto» en aprobaciones; solo copia manual."
          : "Buzón con formato no válido; solo copia manual.";
  return { estado: "pendienteAP", destinoMostrado: DESTINO_PENDIENTE_TEXTO, razon };
}

export interface MailtoConstruido {
  /** URI completo listo para usar, o null si excede el máximo. */
  readonly uri: string | null;
  /** Variante sin cuerpo para abrir el cliente cuando el URI es largo. */
  readonly uriSinCuerpo: string;
  readonly demasiadoLargo: boolean;
}

export interface ErrorMailto {
  readonly ok: false;
  readonly codigo: "DESTINO_INVALIDO";
  readonly detalle: string;
}

export type ResultadoMailto = { readonly ok: true } & MailtoConstruido | ErrorMailto;

/**
 * Construye el `mailto:` solo con `subject` y `body` codificados. Rechaza el
 * destino con controles o formato inválido (anti-inyección Q028: ni saltos
 * ni cabeceras llegan al URI porque el email validado no los admite y el
 * resto viaja con encodeURIComponent).
 */
export function construirMailto(
  email: unknown,
  asunto: string,
  cuerpo: string,
  maxLongitud: number = MAILTO_URI_MAX,
): ResultadoMailto {
  if (!esEmailValido(email)) {
    return {
      ok: false,
      codigo: "DESTINO_INVALIDO",
      detalle: "Destino no válido: el correo procede solo de configuración aprobada.",
    };
  }
  const uriSinCuerpo = `mailto:${email}?subject=${encodeURIComponent(asunto)}`;
  const uri = `${uriSinCuerpo}&body=${encodeURIComponent(cuerpo)}`;
  if (uri.length > maxLongitud) {
    return { ok: true, uri: null, uriSinCuerpo, demasiadoLargo: true };
  }
  return { ok: true, uri, uriSinCuerpo, demasiadoLargo: false };
}
