# Materializar configuración e iniciar OTERCO

<!-- OTERCO_MODELOS_GLM_FLASH_2026_09_19 -->
> **Decisión vigente:** GLM-5.3-Flash coordina; Muse Spark 1.3 Contributor implementa; DeepSeek V4.1 Flash revisa; MiniMax M3 explora. [Adenda](ADENDA_COORDINADOR_GLM_FLASH.md). No reintroducir Kimi como coordinador. El cambio no autoriza publicación ni modifica criterios o estados.

El ZIP contiene únicamente Markdown. OpenCode puede cargar los agentes/comandos Markdown nativos, pero su configuración global de proyecto exige `opencode.json`. Antes de comenzar, crea ese archivo a partir del bloque de [CONFIGURACION](CONFIGURACION.md). No es una limitación del hosting: es el formato de configuración de la herramienta.

## Procedimiento

En la raíz independiente de este flujo, con Node disponible, guarda el siguiente bloque en `materializar-config.mjs` y ejecuta `node materializar-config.mjs`. No requiere dependencias, no llama a la red y se niega a sobrescribir un archivo existente. No ejecutarlo desde la raíz paraguas del paquete. También se puede pedir a un agente genérico que copie exactamente el bloque JSON tras revisión humana; debe comprobar el archivo existente antes de hacerlo.

```javascript
import {readFile, writeFile, realpath, stat} from "node:fs/promises";
import path from "node:path";

const root = await realpath(process.cwd());
const marker = path.join(root, "10_OPENCODE", "CONFIGURACION.md");
try {
  if (!(await stat(path.join(root, "AGENTS.md"))).isFile()) throw new Error("Falta AGENTS");
  const text = await readFile(marker, "utf8");
  const blocks = [...text.matchAll(/^```json\s*\n([\s\S]*?)^```\s*$/gm)];
  if (blocks.length !== 1) throw new Error("Se esperaba exactamente un bloque JSON");
  const config = JSON.parse(blocks[0][1]);
  if (config.enabled_providers?.length !== 1 || config.enabled_providers[0] !== "opencode-go")
    throw new Error("Proveedor inesperado");
  if (config.share !== "disabled" || !config.default_agent?.endsWith("-coordinador"))
    throw new Error("Perfil inesperado");
  await writeFile(path.join(root, "opencode.json"), JSON.stringify(config, null, 2) + "\n",
                  {encoding: "utf8", flag: "wx"});
  console.log("opencode.json creado sin sobrescribir. Falta validar con la CLI instalada.");
} catch (error) {
  console.error(error?.code === "EEXIST" ? "Ya existe opencode.json: comparar e integrar manualmente; no sobrescrito." : String(error));
  process.exitCode = 1;
}
```

La utilidad crea un archivo necesario al desarrollo; por eso el resultado ya no será exclusivamente Markdown. Eso no altera el formato documental entregado. El script no valida un esquema remoto ni elimina configuración global. Después ejecutar el [preflight](PREFLIGHT.md) y abrir:

```bash
opencode --auto
```

En la TUI, `/ot-iniciar`. `--auto` corresponde al flujo autorizado por el propietario: autoaprueba permisos no denegados y no es una sandbox. No ampliar reglas ni añadir credenciales. Si una bandera no existe en la versión instalada, consultar ayuda y registrar la alternativa; no omitir verificaciones silenciosamente. En un repo existente integrar por diff, no reemplazar código/instrucciones/permisos.

## Control de salida

La utilidad no accede a red, no instala ni modifica cuentas. Ejecutar desde la carpeta del sitio, no desde su contenedor. Tras crear el JSON, comprueba la CLI/modelos y registra preflight; todavía no hay aplicación construida. No fuerces la creación cuando exista un archivo: integrar mediante diff.
