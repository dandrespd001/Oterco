/**
 * OT-07 — Configuración de carga del preparador local.
 *
 * `enabled` controla la importación en build y las anclas: con `false` la
 * página no importa el componente y dist no publica ningún recurso exclusivo
 * del preparador (OT-Q032). El operador/coordinador lo activa cuando el
 * contacto esté aprobado y la página lo ancle; hoy el contacto sigue
 * pendienteAP (OT-02/OT-15), así que el valor vigente es `false`.
 *
 * La decisión de mailto/copia NO vive aquí: `destino.ts:resolverDestino()`
 * la deriva en build y en cliente desde `perfilBase.contacto` + `aprobaciones`.
 */

export const PREPARADOR_ENABLED = false;

/** Ancla de la sección del preparador cuando se habilita en la página. */
export const PREPARADOR_ANCLA = "preparar-consulta";
