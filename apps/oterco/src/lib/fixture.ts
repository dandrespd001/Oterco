/**
 * Lógica de presentación de la página técnica (OT-01).
 * Separa lógica de diseño y datos: no conoce CSS, DOM ni marca.
 * Los datos de entrada son fixture sintéticos, no hechos reales.
 */
export interface FixtureContent {
  readonly heading: string;
  readonly intro: string;
  readonly checks: readonly string[];
}

interface RawFixture {
  readonly heading?: unknown;
  readonly intro?: unknown;
  readonly checks?: unknown;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

/** Normaliza el fixture a tipos seguros; rechaza formas inválidas sin lanzar. */
export function parseFixture(raw: RawFixture): FixtureContent | null {
  if (!isString(raw.heading) || !isString(raw.intro)) return null;
  if (!Array.isArray(raw.checks) || !raw.checks.every(isString)) return null;
  return { heading: raw.heading, intro: raw.intro, checks: raw.checks };
}

/** Número de comprobaciones listadas. Función pura para prueba unitaria futura. */
export function countChecks(content: FixtureContent): number {
  return content.checks.length;
}
