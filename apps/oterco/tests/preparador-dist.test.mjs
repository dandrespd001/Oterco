/**
 * OT-07 — Proxies de arquitectura del preparador (OT-Q027, OT-Q029, OT-Q030,
 * OT-Q031, OT-Q032, OT-Q033, OT-Q034) + F1/F2/F5 post-revisión + estado en
 * dist compilado.
 *
 * Sin navegador real en esta unidad (E2E pendiente OT-10): se verifican
 * marcas estructurales del código fuente (sin almacenamiento, listeners
 * idempotentes, render seguro, fallback no-JS) y que dist —con el preparador
 * deshabilitado por configuración— no publique recursos exclusivos del módulo.
 * Requiere `pnpm build` previo; si dist falta, falla con mensaje explícito.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PREPARADOR_ENABLED, cargarPreparador } from "../src/tools/preparador/index.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RAIZ, "dist", "index.html");
const DIR = join(RAIZ, "src", "tools", "preparador");

const motor = readFileSync(join(DIR, "motor.ts"), "utf-8");
const destino = readFileSync(join(DIR, "destino.ts"), "utf-8");
const config = readFileSync(join(DIR, "config.ts"), "utf-8");
const ui = readFileSync(join(DIR, "Preparador.astro"), "utf-8");
const cliente = readFileSync(join(DIR, "cliente.ts"), "utf-8");
const indice = readFileSync(join(DIR, "index.ts"), "utf-8");
const activador = readFileSync(join(DIR, "activador.ts"), "utf-8");
const fuentes = [motor, destino, config, ui, cliente, indice, activador];

/** Código efectivo: quita comentarios para no confundir documentación con uso real. */
function sinComentarios(texto) {
  return texto
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1");
}
const efectivas = fuentes.map(sinComentarios);

assert.ok(existsSync(DIST), "dist/index.html existe: ejecutar `pnpm build` antes de `pnpm test`");
const html = readFileSync(DIST, "utf-8");

/* OT-Q027 — Render seguro: texto, nunca HTML ejecutable. */
describe("OT-Q027 presentación sin innerHTML (proxy de fuente)", () => {
  it("ninguna fuente del preparador usa innerHTML/outerHTML/eval/document.write", () => {
    for (const [i, f] of efectivas.entries()) {
      assert.ok(!/innerHTML|outerHTML|document\.write|eval\s*\(/.test(f), `fuente ${i} sin sinks`);
    }
  });

  it("el borrador se asigna con value/textContent", () => {
    assert.ok(/\.textContent\s*=/.test(cliente), "usa textContent");
    assert.ok(/\.value\s*=/.test(cliente), "usa value");
  });
});

/* OT-Q029 — Sin anuncio de envío confirmado (proxy de fuente). */
describe("OT-Q029 nunca anuncia envío (proxy de fuente)", () => {
  it("ninguna fuente afirma envío/entrega", () => {
    for (const f of efectivas) {
      assert.ok(!/enviado con éxito|mensaje enviado|envío confirmado|entrega confirmada/i.test(f));
    }
    assert.ok(
      /no confirma ningún envío/i.test(ui) || /no confirma ningún envío/i.test(cliente),
      "avisa que abrir no confirma envío",
    );
  });

  it("existe la ruta de URI largo con variante sin cuerpo", () => {
    assert.ok(/demasiadoLargo/.test(destino) && /uriSinCuerpo/.test(destino));
    assert.ok(/demasiadoLargo/.test(cliente), "el conector contempla el URI largo");
  });
});

/* OT-Q030 — Clipboard con fallback manual (proxy de fuente). */
describe("OT-Q030 copia con/sin Clipboard (proxy de fuente)", () => {
  it("intenta Clipboard y repliega a selección + copia manual", () => {
    assert.ok(/navigator\.clipboard/.test(cliente), "usa navigator.clipboard si existe");
    assert.ok(/\.select\(\)/.test(cliente), "selecciona el recuadro en el fallback");
    assert.ok(/execCommand/.test(cliente), "intenta execCommand como respaldo");
    assert.ok(/a mano/i.test(ui), "explica la copia manual");
  });

  it("el recuadro de salida permanece seleccionable (readonly, no disabled)", () => {
    assert.ok(/data-salida[^>]*readonly/.test(ui) || /readonly[^>]*data-salida/.test(ui));
    assert.ok(!/<textarea[^>]*data-salida[^>]*disabled/.test(ui));
  });
});

/* OT-Q031 — Reaperturas y dos instancias sin duplicar (proxy de fuente). */
describe("OT-Q031 instancias y listeners idempotentes (proxy de fuente)", () => {
  it("botón de activación <button type=button> con aria-expanded y cierre Escape", () => {
    assert.ok(/<button[^>]*type="button"[^>]*data-accion="abrir"/.test(ui));
    assert.ok(/aria-expanded/.test(ui));
    assert.ok(/"Escape"/.test(cliente), "manejador de Escape");
  });

  it("montaje con guarda, estado por instancia y limpieza", () => {
    assert.ok(/preparadorMontado/.test(cliente), "guarda anti-duplicado");
    assert.ok(/AbortController/.test(cliente), "listeners con señal abortable");
    assert.ok(/desmontar/.test(cliente), "expone desmontaje");
    assert.ok(/data-preparador/.test(ui), "raíz por instancia en el marcado");
    assert.ok(/raiz\.querySelector/.test(cliente), "el conector opera acotado a su raíz");
    assert.ok(/tema-\$\{uid\}|`tema-\$\{uid\}`|name=\{`tema-/.test(ui), "radios con nombre por uid");
  });

  it("la carga ocurre al abrir: import dinámico en el primer click (activador ligero)", () => {
    assert.ok(/import\("\.\/cliente\.ts"\)/.test(activador), "trozo pesado solo vía import dinámico");
    assert.ok(/once:\s*true/.test(activador), "solo el primer click dispara la carga");
    assert.ok(/from "\.\/activador"/.test(ui), "el componente importa el cliente ligero");
    assert.ok(!/from "\.\/cliente"/.test(ui), "el componente no importa el conector pesado");
  });
});

/* OT-Q032 — Deshabilitado: dist sin recursos exclusivos del módulo. */
describe("OT-Q032 módulo deshabilitado sin recursos exclusivos", () => {
  it("la configuración vigente lo deshabilita (contacto aún pendienteAP)", () => {
    assert.equal(PREPARADOR_ENABLED, false);
  });

  it("dist no publica recursos exclusivos del módulo: sin marcas, scripts ni mailto", () => {
    // La prosa editorial («el preparador local pertenecen a OT-07», cierre OT-06)
    // puede nombrar la herramienta; lo prohibido son sus recursos exclusivos.
    assert.ok(!/data-preparador/.test(html), "dist sin raíces del preparador");
    assert.ok(!/preparar-consulta/.test(html), "dist sin ancla del preparador");
    assert.ok(!/mailto:/i.test(html), "dist sin mailto (buzón sin aprobar)");
  });

  it("las fuentes no descargan código: sin fetch/XHR ni URLs remotas", () => {
    for (const f of efectivas) {
      assert.ok(!/fetch\s*\(|XMLHttpRequest|https?:\/\//.test(f), "sin red remota");
    }
  });
});

/* F1 — Entrada única condicionada por el flag (consume PREPARADOR_ENABLED). */
describe("F1 punto único de entrada con flag real", () => {
  it("index.ts ramifica por el flag y hoy resuelve null sin importar nada", async () => {
    assert.ok(/if\s*\(!PREPARADOR_ENABLED\)\s*return null/.test(indice), "rama apagada sin import");
    assert.ok(/return import\("\.\/cliente\.ts"\)/.test(indice), "único camino al conector");
    assert.equal(await cargarPreparador(), null);
  });
});

/* F5 — Motivo visible del correo deshabilitado asociado con aria-describedby. */
describe("F5 correo deshabilitado con motivo visible asociado", () => {
  it("el botón referencia el motivo visible por id", () => {
    assert.ok(/aria-describedby=\{id\("motivo-correo"\)\}/.test(ui), "botón con aria-describedby");
    assert.ok(/id=\{id\("motivo-correo"\)\}/.test(ui), "motivo visible con id");
  });
});

/* OT-Q033 — Sin almacenamiento del borrador (proxy de fuente). */
describe("OT-Q033 borrador solo en memoria (proxy de fuente)", () => {
  it("ninguna fuente toca almacenamiento, cookies o red", () => {
    for (const f of efectivas) {
      assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(f));
    }
  });

  it("motor y destino son puros: sin imports", () => {
    assert.ok(!/^\s*import\s/m.test(motor), "motor sin dependencias");
    assert.ok(!/^\s*import\s/m.test(destino), "destino sin dependencias");
  });
});

/* OT-Q034 — Sin JS el contacto/portafolio no se rompen; limpieza voluntaria. */
describe("OT-Q034 fallback no-JS y limpieza voluntaria (proxy de fuente)", () => {
  it("hay <noscript> con contacto disponible y modelo copiable a mano", () => {
    assert.ok(/<noscript>/.test(ui), "fallback no-JS presente");
    assert.ok(/Sin JavaScript/i.test(ui));
    assert.ok(/Copie a mano/i.test(ui));
  });

  it("el panel nace oculto y la limpieza solo ocurre en su botón", () => {
    assert.ok(/data-panel hidden/.test(ui), "panel oculto hasta apertura");
    const limpiezas = [...cliente.matchAll(/\.value\s*=\s*""/g)].length;
    assert.ok(limpiezas >= 2, "vacía campos");
    assert.ok(/data-accion="limpiar"/.test(ui), "botón de limpieza en el marcado");
    assert.ok(/alLimpiar/.test(cliente), "limpieza implementada en el conector");
  });

  it("el conector no se auto-monta al importar ni escribe fuera de su raíz", () => {
    assert.ok(!/document\.write/.test(cliente));
    assert.ok(!/document\.querySelectorAll/.test(cliente), "sin barrido global al importar");
    assert.ok(!/typeof document/.test(cliente), "sin guarda de auto-montaje");
    assert.ok(/raiz\.querySelector/.test(cliente), "consultas acotadas a su raíz");
  });
});
