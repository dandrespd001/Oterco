/**
 * OT-02 (corrección post-revisión) — Literales esperados en un único destino editable.
 *
 * `perfil.ts` (tipos + `validarPerfil`) importa estas constantes en lugar de
 * duplicar literales transcritos. Si un dato confirmado cambia, se edita
 * `perfil.datos.ts` y —solo cuando se mantiene igualdad literal— la constante
 * equivalente aquí. Nada más duplica el literal.
 *
 * Campos confirmables (formato/estructura, sin igualdad literal):
 * - `nit.valorCompletoPropuesto` → formato NNN.NNN.NNN-D (`NIT_PROPUESTO_FORMATO`).
 * - `solar.potencia` ............ → cifra + unidad (`SOLAR_POTENCIA_FORMATO`).
 * - `oferta[].titulo` ............ → texto no vacío (estructura, sin literal).
 */

export const ESPERADO_RAZON_SOCIAL = "OTERCO LTDA" as const;

export const ESPERADO_ENFOQUE = "mercado nacional" as const;

export const ESPERADO_NIT_TRANSCRITO = "830.128.652" as const;

/** NIT propuesto: tres grupos de tres dígitos + dígito verificador (formato, no literal). */
export const NIT_PROPUESTO_FORMATO = /^\d{3}\.\d{3}\.\d{3}-\d$/;

export const ESPERADO_EMAIL = "contacto@oterco.com.co" as const;

export const ESPERADO_SOLAR_AREA = "21 hectáreas" as const;

/**
 * Potencia solar: cifra (punto o coma decimal) + unidad MW/MWp
 * (formato/estructura, no igualdad literal: el conflicto O-D04 habla de
 * MWp y variantes sin reconciliar, así que no se congela "11.6 MW").
 */
export const SOLAR_POTENCIA_FORMATO = /^\d+(?:[.,]\d+)?\s*MWP?$/i;

export const ESPERADO_FOTOS_AFIRMACION = "Fotografias tomadas en las fincas de Oterco LTDA." as const;

export const FINCAS_ESPERADAS = [
  {
    id: "beraka",
    nombre: "Hacienda Beraka",
    municipio: "San Onofre",
    departamento: "Sucre",
    funcion: "cría",
  },
  {
    id: "puerta-roja",
    nombre: "Hacienda Puerta Roja",
    municipio: "Turbaco",
    departamento: "Bolívar",
    funcion: "ceba y levante",
  },
] as const;

/**
 * Oferta: solo identidad estructural (id + categoría) por igualdad literal.
 * El `titulo` es campo confirmable: se valida como texto no vacío, sin
 * congelar el literal, para que un cambio confirmado se edite solo en
 * `perfil.datos.ts`.
 */
export const OFERTA_ESPERADA = [
  { id: "ganado-en-pie", categoria: "Ganado en pie" },
  { id: "cria", categoria: "Cría" },
  { id: "servicio", categoria: "Servicio" },
] as const;
