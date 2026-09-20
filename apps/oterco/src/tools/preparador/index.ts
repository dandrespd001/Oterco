/**
 * OT-07 — Punto único de entrada del preparador local de consulta.
 *
 * Consume `PREPARADOR_ENABLED` de verdad: `cargarPreparador()` devuelve
 * `null` con el flag apagado y solo entonces evita traer el conector. La
 * página, al activarse en el futuro, importa el módulo exclusivamente por
 * aquí (único camino a dist); hoy el flag es `false` y dist publica cero
 * recursos del preparador (OT-Q032). Sin red, sin almacenamiento.
 */

import { PREPARADOR_ENABLED } from "./config.ts";

export { PREPARADOR_ANCLA, PREPARADOR_ENABLED } from "./config.ts";
export { UID_POR_DEFECTO, activarAperturaDiferida } from "./activador.ts";

/**
 * Entrada condicionada por el flag: con el preparador deshabilitado
 * resuelve `null` sin importar nada; habilitado, trae el conector pesado
 * (`cliente.ts`: `montarPreparador` / `desmontarPreparador`).
 */
export async function cargarPreparador(): Promise<null | typeof import("./cliente.ts")> {
  if (!PREPARADOR_ENABLED) return null;
  return import("./cliente.ts");
}
