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