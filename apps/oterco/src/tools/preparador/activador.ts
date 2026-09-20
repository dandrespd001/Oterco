/**
 * OT-07 — Activador ligero del preparador local (carga al abrir).
 *
 * Cliente mínimo que `Preparador.astro` importa en exclusiva: este módulo
 * NO importa `./cliente.ts` en carga. En el primer click del botón
 * `[data-accion="abrir"]` trae el conector pesado con `import()` dinámico,
 * lo monta sobre su raíz y reabre el panel (criterio «carga al abrir»:
 * apertura por primer click, nunca carga de página, OT-Q031/Q032).
 * Reaperturas y doble instancia no duplican: el conector monta cada raíz
 * una sola vez y este activador marca su botón una sola vez.
 * Sin almacenamiento, sin red, sin HTML ejecutable.
 */

/** Identificador de instancia por defecto (el componente lo usa en build). */
export const UID_POR_DEFECTO = "a";

/**
 * Arma la apertura diferida de una raíz `[data-preparador]`. Idempotente:
 * un botón ya activado no duplica su oyente. Devuelve false si la raíz
 * está incompleta. No monta nada al llamarse: el montaje ocurre tras el
 * primer click, cuando el `import()` dinámico resuelve el conector.
 */
export function activarAperturaDiferida(raiz: Element): boolean {
  if (!(raiz instanceof HTMLElement)) return false;
  const abrir = raiz.querySelector('[data-accion="abrir"]');
  if (!(abrir instanceof HTMLButtonElement)) return false;
  if (abrir.dataset.aperturaDiferida === "1") return false;
  abrir.dataset.aperturaDiferida = "1";
  const alPrimerClick = (): void => {
    // El conector viaja en un trozo aparte: la página no lo descarga
    // hasta que el usuario abre la herramienta (primer click).
    void import("./cliente.ts").then(
      (modulo) => {
        if (modulo.montarPreparador(raiz)) abrir.click();
      },
      () => {
        delete abrir.dataset.aperturaDiferida;
      },
    );
  };
  abrir.addEventListener("click", alPrimerClick, { once: true });
  return true;
}
