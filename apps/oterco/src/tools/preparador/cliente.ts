/**
 * OT-07 — Conector DOM local del preparador de consulta (módulo pesado).
 *
 * Conecta el marcado de `Preparador.astro` con `motor.ts`/`destino.ts`.
 * Este módulo NO se monta al importar: solo exporta `montarPreparador` /
 * `desmontarPreparador`. La carga la dispara el botón de apertura mediante
 * `activador.ts`, que trae este módulo con `import()` dinámico en el primer
 * click (criterio «carga al abrir»: apertura, no carga de página).
 * Controlado por `config.ts:PREPARADOR_ENABLED` vía `index.ts` (hoy `false`:
 * dist no publica este módulo).
 *
 * Sin envío automático, sin almacenamiento (solo memoria de la instancia),
 * sin red, sin `innerHTML`/`eval`: el borrador se asigna con
 * `value`/`textContent`. Clipboard con repliegue a selección + copia manual.
 */
import { construirMailto } from "./destino.ts";
import { MENSAJE_MAX, preparar } from "./motor.ts";

interface EstadoInstancia {
  asunto: string;
  cuerpo: string;
}

interface RegistroMontaje {
  desmontar: () => void;
}

const montadas = new WeakMap<Element, RegistroMontaje>();

/**
 * Monta una raíz `[data-preparador]`. Idempotente: una raíz ya montada no
 * duplica listeners (OT-Q031). Devuelve false si la raíz está incompleta.
 */
export function montarPreparador(raiz: Element): boolean {
  if (!(raiz instanceof HTMLElement)) return false;
  if (raiz.dataset.preparadorMontado === "1" || montadas.has(raiz)) return false;
  const abrir = raiz.querySelector('[data-accion="abrir"]');
  const panel = raiz.querySelector("[data-panel]");
  const salida = raiz.querySelector("[data-salida]");
  const mensaje = raiz.querySelector("[data-mensaje]");
  const error = raiz.querySelector("[data-error]");
  const nota = raiz.querySelector("[data-nota]");
  const botonCorreo = raiz.querySelector('[data-accion="correo"]');
  if (
    !(abrir instanceof HTMLButtonElement) ||
    !(panel instanceof HTMLElement) ||
    !(salida instanceof HTMLTextAreaElement) ||
    !(mensaje instanceof HTMLTextAreaElement) ||
    !(error instanceof HTMLElement) ||
    !(nota instanceof HTMLElement)
  ) {
    return false;
  }
  const estado: EstadoInstancia = { asunto: "", cuerpo: "" };
  const control = new AbortController();
  const senal = control.signal;

  const informar = (texto: string): void => {
    error.textContent = texto;
  };
  const anotar = (texto: string): void => {
    nota.textContent = texto;
  };

  const estaAbierto = (): boolean => !panel.hasAttribute("hidden");

  const alAbrir = (): void => {
    if (estaAbierto()) {
      panel.setAttribute("hidden", "");
      abrir.setAttribute("aria-expanded", "false");
    } else {
      panel.removeAttribute("hidden");
      abrir.setAttribute("aria-expanded", "true");
      mensaje.focus();
    }
  };

  const alTeclado = (evento: KeyboardEvent): void => {
    if (evento.key === "Escape" && estaAbierto()) {
      panel.setAttribute("hidden", "");
      abrir.setAttribute("aria-expanded", "false");
      abrir.focus();
    }
  };

  const temaElegido = (): unknown => {
    const marcado = raiz.querySelector('input[type="radio"]:checked');
    return marcado instanceof HTMLInputElement ? marcado.value : undefined;
  };

  const alPreparar = (): void => {
    const resultado = preparar(temaElegido(), mensaje.value);
    if (!resultado.ok) {
      informar(resultado.detalle);
      return;
    }
    informar("");
    estado.asunto = resultado.asunto;
    estado.cuerpo = resultado.cuerpo;
    // Render seguro: value/textContent, nunca HTML ejecutable (OT-Q027).
    salida.value = resultado.cuerpo;
    anotar(
      `Borrador generado (${resultado.mensajeLongitud}/${MENSAJE_MAX} caracteres de mensaje). ` +
        "Revise el texto antes de copiarlo o abrir su correo.",
    );
  };

  const copiarManual = (): void => {
    salida.focus();
    salida.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    anotar(
      ok
        ? "Texto copiado al portapapeles."
        : "Copie el texto a mano: selecciónelo en el recuadro y use Copiar de su sistema.",
    );
  };

  const alCopiar = (): void => {
    if (estado.cuerpo.length === 0) {
      informar("Genere primero el borrador.");
      return;
    }
    informar("");
    const portapapeles = navigator.clipboard;
    if (portapapeles && typeof portapapeles.writeText === "function") {
      portapapeles.writeText(estado.cuerpo).then(
        () => {
          anotar("Texto copiado al portapapeles.");
        },
        () => {
          copiarManual();
        },
      );
    } else {
      copiarManual();
    }
  };

  const alCorreo = (evento: Event): void => {
    if (botonCorreo instanceof HTMLButtonElement && botonCorreo.disabled) return;
    if (estado.cuerpo.length === 0) {
      informar("Genere primero el borrador.");
      evento.preventDefault();
      return;
    }
    informar("");
    const dest = raiz.dataset.correo ?? "";
    const resultado = construirMailto(dest, estado.asunto, estado.cuerpo);
    if (!resultado.ok) {
      informar("Correo no disponible: " + resultado.detalle);
      evento.preventDefault();
      return;
    }
    if (!(botonCorreo instanceof HTMLAnchorElement)) {
      evento.preventDefault();
      return;
    }
    if (resultado.demasiadoLargo || resultado.uri === null) {
      botonCorreo.href = resultado.uriSinCuerpo;
      anotar(
        "El texto es largo para un enlace de correo: se abrirá solo con el asunto. " +
          "Copie el borrador y péguelo en su aplicación de correo.",
      );
    } else {
      botonCorreo.href = resultado.uri;
      anotar(
        "Al abrir el correo, la información pasa a esa aplicación y usted decide enviarla. " +
          "Abrir el correo no confirma ningún envío.",
      );
    }
  };

  const alLimpiar = (): void => {
    // Limpieza solo voluntaria: este botón vacía el estado local (OT-Q034).
    mensaje.value = "";
    salida.value = "";
    estado.asunto = "";
    estado.cuerpo = "";
    const marcados = raiz.querySelectorAll('input[type="radio"]:checked');
    marcados.forEach((nodo) => {
      if (nodo instanceof HTMLInputElement) nodo.checked = false;
    });
    informar("");
    anotar("Borrador limpiado.");
  };

  abrir.addEventListener("click", alAbrir, { signal: senal });
  panel.addEventListener("keydown", alTeclado as EventListener, { signal: senal });
  raiz
    .querySelector('[data-accion="preparar"]')
    ?.addEventListener("click", alPreparar, { signal: senal });
  raiz
    .querySelector('[data-accion="copiar"]')
    ?.addEventListener("click", alCopiar, { signal: senal });
  botonCorreo?.addEventListener("click", alCorreo as EventListener, { signal: senal });
  raiz
    .querySelector('[data-accion="limpiar"]')
    ?.addEventListener("click", alLimpiar, { signal: senal });

  raiz.dataset.preparadorMontado = "1";
  montadas.set(raiz, {
    desmontar: () => {
      // Desmontaje: corta listeners y marca; no quedan recursos exclusivos
      // (sin temporizadores, sin URLs de objeto, sin almacenamiento).
      control.abort();
      montadas.delete(raiz);
      delete raiz.dataset.preparadorMontado;
    },
  });
  return true;
}

/** Desmonta una raíz: limpia listeners y solo sus recursos (OT-Q034). */
export function desmontarPreparador(raiz: Element): boolean {
  const registro = montadas.get(raiz);
  if (!registro) return false;
  registro.desmontar();
  return true;
}
