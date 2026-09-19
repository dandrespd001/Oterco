#!/usr/bin/env node
/** Ajuste incremental de OTERCO. Sin paquetes externos, red, login o despliegue.
 * Simular: node actualizar-oterco-glm.mjs
 * Aplicar: node actualizar-oterco-glm.mjs --aplicar
 * Restaurar: node actualizar-oterco-glm.mjs --restaurar /ruta/del/respaldo
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';

const MODELS = Object.freeze({
  'ot-coordinador': 'opencode-go/glm-5.3-flash',
  'ot-implementador': 'opencode-go/muse-spark-1.3-contributor',
  'ot-revisor': 'opencode-go/deepseek-v4.1-flash',
  'ot-explorador': 'opencode-go/minimax-m3'
});
const ROOT = await fs.realpath(process.cwd());
const digest = s => createHash('sha256').update(s).digest('hex');
const seen = new Map();
const plan = [];
const marker = '<!-- OTERCO_MODELOS_GLM_FLASH_2026_09_19 -->';
const adendaPath = '10_OPENCODE/ADENDA_COORDINADOR_GLM_FLASH.md';
const quote = s => '"' + s.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('$', '\\$') + '"';
function fail(message) { throw new Error(message); }
function inside(base, target) {
  const rel = path.relative(base, target);
  return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel));
}
async function readLocal(rel, optional = false) {
  if (path.isAbsolute(rel) || rel.split(/[\\/]/).includes('..')) fail('Ruta relativa no permitida.');
  const target = path.join(ROOT, rel);
  let current = ROOT;
  for (const part of rel.split('/')) {
    current = path.join(current, part);
    try {
      const st = await fs.lstat(current);
      if (st.isSymbolicLink()) fail(`No se modifican enlaces simbólicos: ${rel}`);
    } catch (e) {
      if (e.code === 'ENOENT' && optional) return null;
      throw e;
    }
  }
  const st = await fs.stat(target);
  if (!st.isFile()) fail(`No es un archivo regular: ${rel}`);
  if (st.size > 2_000_000) fail(`Archivo demasiado grande para este ajuste: ${rel}`);
  return { text: await fs.readFile(target, 'utf8'), mode: st.mode & 0o777 };
}
async function load(rel, optional = false) {
  if (!seen.has(rel)) seen.set(rel, await readLocal(rel, optional));
  return seen.get(rel);
}
async function add(rel, after, optional = false) {
  const before = await load(rel, optional);
  if ((before?.text ?? null) !== after) plan.push({ rel, before: before?.text ?? null, after, mode: before?.mode ?? 0o644 });
}
function parseJSON(text, label) {
  try { return JSON.parse(text.replace(/^\uFEFF/, '')); }
  catch { fail(`${label}: se necesita JSON válido sin comentarios. No se cambió nada; revisar localmente sin compartir credenciales.`); }
}
function setModel(old, value, label) {
  if (typeof old === 'string' || old === undefined) return value;
  if (old && typeof old === 'object' && !Array.isArray(old) &&
      Object.keys(old).every(k => ['providerID', 'model'].includes(k))) {
    return { ...old, providerID: 'opencode-go', model: value.slice('opencode-go/'.length) };
  }
  fail(`Formato de modelo no previsto en ${label}; integrar manualmente.`);
}
function adjustConfig(input, label) {
  const c = structuredClone(input);
  if (!c || Array.isArray(c) || typeof c !== 'object') fail(`${label}: estructura inesperada.`);
  if (c.default_agent !== 'ot-coordinador') fail(`${label}: default_agent no es ot-coordinador; no es el perfil esperado.`);
  for (const group of ['agent', 'agents']) {
    for (const id of Object.keys(MODELS)) if (c[group]?.[id] !== undefined)
      fail(`${label}: ${id} está definido también en JSON. Revisar duplicación antes de aplicar.`);
  }
  for (const group of ['command', 'commands']) {
    for (const id of Object.keys(c[group] ?? {})) if (id.startsWith('ot-'))
      fail(`${label}: comando ${id} está definido en JSON. Revisar su precedencia antes de aplicar.`);
  }
  c.model = setModel(c.model, MODELS['ot-coordinador'], label);
  if (c.enabled_providers && (!Array.isArray(c.enabled_providers) || !c.enabled_providers.includes('opencode-go')))
    fail(`${label}: Go está excluido; no se cambian las restricciones de proveedor.`);
  if (c.disabled_providers?.includes('opencode-go')) fail(`${label}: Go está deshabilitado.`);
  const ids = Object.values(MODELS).map(m => m.slice('opencode-go/'.length));
  for (const group of ['provider', 'providers']) {
    const p = c[group]?.['opencode-go'];
    if (!p) continue;
    if (p.blacklist?.some(x => ids.includes(x))) fail(`${label}: un modelo solicitado está bloqueado; revisión manual.`);
    if (p.whitelist !== undefined) {
      if (!Array.isArray(p.whitelist) || !p.whitelist.every(x => typeof x === 'string')) fail(`${label}: whitelist no reconocida.`);
      p.whitelist = [...new Set([...p.whitelist, ...ids])];
    }
  }
  // No tocar permission/permissions, providers ajenos, small_model, steps o agentes integrados.
  return c;
}
function frontmatter(text, label) {
  const match = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) fail(`Falta frontmatter reconocible: ${label}`);
  return { match, head: match[1], body: text.slice(match[0].length), nl: text.includes('\r\n') ? '\r\n' : '\n' };
}
function field(head, key, label) {
  const rows = [...head.matchAll(new RegExp(`^${key}:[ \\t]*([^\\r\\n]*)`, 'gm'))];
  if (rows.length > 1) fail(`Campo ${key} duplicado: ${label}`);
  if (!rows.length) return null;
  const value = rows[0][1].replace(/[ \t]+#.*$/, '').trim();
  if (!/^(?:[A-Za-z0-9_./#-]+|"[A-Za-z0-9_./#-]+"|'[A-Za-z0-9_./#-]+')$/.test(value))
    fail(`Campo ${key} complejo en ${label}; revisión manual.`);
  return value.replace(/^['"]|['"]$/g, '');
}
function setFrontModel(text, model, label, requireModel = true) {
  const f = frontmatter(text, label);
  const old = field(f.head, 'model', label);
  if (requireModel && !old) fail(`Falta model: en ${label}`);
  let head = f.head;
  if (old) head = head.replace(/^model:[^\r\n]*/m, `model: ${model}`);
  else head += f.nl + `model: ${model}`;
  const after = `---${f.nl}${head}${f.nl}---${f.nl}${f.body}`;
  // Todo salvo la línea model tiene que conservarse exactamente.
  const strip = s => s.replace(/^model:[^\r\n]*\r?\n/gm, '');
  if (strip(text) !== strip(after)) fail(`Cambiaría algo ajeno a model: ${label}`);
  return after;
}
function notice(text, rel) {
  if (text.includes(marker)) return text;
  const link = rel.startsWith('10_OPENCODE/') ? 'ADENDA_COORDINADOR_GLM_FLASH.md' : adendaPath;
  const block = `${marker}\n> **Decisión vigente:** GLM-5.3-Flash coordina; Muse Spark 1.3 Contributor implementa; DeepSeek V4.1 Flash revisa; MiniMax M3 explora. [Adenda](${link}). No reintroducir Kimi como coordinador. El cambio no autoriza publicación ni modifica criterios o estados.\n\n`;
  return text.replace(/^(# [^\r\n]*\r?\n)(?:\r?\n)?/, '$1\n' + block);
}
function docText(text) {
  return text
    .replaceAll('opencode models opencode-go --refresh', 'opencode models')
    .replaceAll('opencode agent list', 'opencode debug agents')
    .replaceAll('opencode --pure --agent ot-coordinador', 'opencode --auto')
    .replaceAll('Coordinador Kimi K2.7 Code, implementador/explorador MiniMax M3 y revisor GLM-5.2', 'Coordinador GLM-5.3-Flash, implementador Muse Spark 1.3 Contributor, explorador MiniMax M3 y revisor DeepSeek V4.1 Flash')
    .replaceAll('La whitelist contiene tres IDs de Go documentados', 'La whitelist conserva los IDs anteriores y añade los cuatro IDs del reparto vigente')
    .replaceAll('Confirmar los tres IDs previstos', 'Confirmar los cuatro IDs previstos')
    .replaceAll('la elección de GLM no garantiza que pueda ver imágenes', 'la elección de un modelo no garantiza que la integración entregue imágenes')
    .replaceAll('Config global se combina; --pure no aísla todo.', 'La configuración global se combina; revisar sus permisos, plugins y MCP efectivos.')
    .replaceAll('`--pure` excluye plugins externos según CLI, no todos los MCP, instrucciones heredadas o permisos.', 'El arranque se adapta a la CLI instalada; revisar plugins, MCP, instrucciones heredadas y permisos.')
    .replaceAll('`--pure` excluye plugins externos según la documentación, no todos los MCP/permisos heredados. No usar `--auto`.', '`--auto` corresponde al flujo autorizado por el propietario: autoaprueba permisos no denegados y no es una sandbox. No ampliar reglas ni añadir credenciales.')
    .replaceAll('--pure excluye plugins externos; no todos los MCP o permisos heredados. No usar --auto/accept-all para evitar prompts.', '`--auto` se usa por decisión del propietario y no es una sandbox; conserva las denegaciones y no aísla plugins/MCP heredados.');
}
async function atomicWrite(rel, text, mode) {
  const abs = path.join(ROOT, rel);
  const tmp = path.join(path.dirname(abs), `.ot-modelos-${randomUUID()}.tmp`);
  try {
    await fs.writeFile(tmp, text, { encoding: 'utf8', flag: 'wx', mode });
    await fs.chmod(tmp, mode);
    await fs.rename(tmp, abs);
  } finally { await fs.unlink(tmp).catch(() => {}); }
}
async function restore(folder) {
  const absolute = await fs.realpath(folder);
  if (inside(ROOT, absolute)) fail('El respaldo debe estar fuera del repositorio.');
  const m = parseJSON(await fs.readFile(path.join(absolute, 'manifest.json'), 'utf8'), 'manifiesto');
  if (m.kind !== 'oterco-glm-flash-1' || m.root !== ROOT || !Array.isArray(m.changes)) fail('Respaldo de otro proyecto o formato.');
  const originals = [];
  for (const [i, c] of m.changes.entries()) {
    const current = await readLocal(c.rel, true);
    if (!current || digest(current.text) !== c.afterHash) fail(`Cambios posteriores en ${c.rel}; no se restaura automáticamente.`);
    const original = c.existed ? await fs.readFile(path.join(absolute, `${i}.original`), 'utf8') : null;
    if (original !== null && digest(original) !== c.beforeHash) fail('Respaldo dañado.');
    originals.push({ ...c, original });
  }
  for (const c of originals) {
    if (c.original === null) await fs.unlink(path.join(ROOT, c.rel));
    else await atomicWrite(c.rel, c.original, c.mode);
  }
  console.log('Restaurados únicamente los archivos del ajuste. Sin modificar código, estados o autenticación.');
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--restaurar' && args.length === 2) return restore(args[1]);
  if (args.length && !(args.length === 1 && args[0] === '--aplicar')) fail('Uso: node actualizar-oterco-glm.mjs [--aplicar | --restaurar RUTA]');
  const apply = args[0] === '--aplicar';
  const ag = await load('AGENTS.md');
  if (!/OTERCO/i.test(ag.text.slice(0, 500))) fail('No se reconoce la raíz de OTERCO.');
  for (const rel of ['opencode.jsonc', '.opencode/opencode.json', '.opencode/opencode.jsonc'])
    if (await readLocal(rel, true)) fail(`Configuración adicional ${rel}; integrar su precedencia manualmente.`);
  const cfg = await load('opencode.json');
  await add('opencode.json', JSON.stringify(adjustConfig(parseJSON(cfg.text, 'opencode.json'), 'opencode.json'), null, 2) + '\n');
  for (const [id, model] of Object.entries(MODELS)) {
    if (await readLocal(`.opencode/agent/${id}.md`, true)) fail(`Agente duplicado en directorio legacy: ${id}`);
    const rel = `.opencode/agents/${id}.md`;
    const source = await load(rel);
    const f = frontmatter(source.text, rel);
    if (field(f.head, 'mode', rel) !== (id === 'ot-coordinador' ? 'primary' : 'subagent')) fail(`Modo inesperado en ${rel}; no se cambia.`);
    await add(rel, setFrontModel(source.text, model, rel));
  }
  const names = (await fs.readdir(path.join(ROOT, '.opencode/commands'))).filter(n => /^ot-[\w-]+\.md$/.test(n)).sort();
  for (const required of ['ot-iniciar.md', 'ot-estado.md', 'ot-guardar.md', 'ot-tarea.md', 'ot-revisar.md'])
    if (!names.includes(required)) fail(`Falta el comando ${required}.`);
  for (const name of names) {
    if (await readLocal(`.opencode/command/${name}`, true)) fail(`Comando duplicado: ${name}`);
    const rel = '.opencode/commands/' + name;
    const source = await load(rel);
    const f = frontmatter(source.text, rel);
    if (field(f.head, 'agent', rel) === 'ot-coordinador') await add(rel, setFrontModel(source.text, MODELS['ot-coordinador'], rel, false));
  }
  const docConfig = '10_OPENCODE/CONFIGURACION.md';
  const doc = await load(docConfig);
  const blocks = [...doc.text.matchAll(/^```json[^\S\r\n]*\r?\n([\s\S]*?)^```[^\S\r\n]*$/gm)];
  if (blocks.length !== 1) fail(`${docConfig}: bloque JSON ambiguo.`);
  const newDocConfig = adjustConfig(parseJSON(blocks[0][1], docConfig), docConfig);
  let s = doc.text.replace(blocks[0][0], '```json\n' + JSON.stringify(newDocConfig, null, 2) + '\n```');
  await add(docConfig, notice(docText(s), docConfig));
  for (const rel of ['AGENTS.md', 'INICIO.md', 'PROMPT_INICIO.md', '10_OPENCODE/README.md', '10_OPENCODE/BOOTSTRAP.md', '10_OPENCODE/PREFLIGHT.md', '10_OPENCODE/ORQUESTACION.md', '10_OPENCODE/MODELOS_Y_COSTOS.md']) {
    const source = await load(rel);
    let next = docText(source.text);
    if (rel.endsWith('MODELOS_Y_COSTOS.md')) {
      for (const [role, id] of [['Coordinador','ot-coordinador'],['Implementador','ot-implementador'],['Revisor','ot-revisor'],['Explorador opcional','ot-explorador']])
        next = next.replace(new RegExp(`^(\\| ${role} \\| )[^\\r\\n|]+( \\|)`, 'm'), '$1' + MODELS[id] + '$2');
      next = next.replace('Los IDs figuran en el catálogo oficial Go consultado el 17/09/2026. Se conserva la asignación anterior por continuidad, **no es un benchmark de estos repositorios**. La cuenta del usuario y acceso real siguen pendientes de preflight.', 'El reparto sigue la decisión vigente del propietario, no una clasificación de calidad. Los IDs se contrastan con el catálogo de la cuenta y una llamada real en el preflight; no se han probado desde este ajuste.');
    }
    await add(rel, notice(next, rel));
  }
  const adenda = `${marker}\n# OTERCO — reparto vigente y continuación después de materializar JSON\n\n**Corrección del propietario:** GLM-5.3-Flash coordina, no Kimi.\n\n| Agente | Modelo |\n|---|---|\n${Object.entries(MODELS).map(([k,v]) => `| ${k} | ${v} |`).join('\n')}\n\n## Precedencia y alcance\nEsta adenda sustituye exclusivamente las asignaciones anteriores de modelos y los comandos de arranque incompatibles. No modifica arquitectura, hosting gratuito, preparación local sin persistencia, identidad visual, permisos, pasos, pruebas, alcance o aprobaciones. PA-16 se considera terminada solo según reporte del propietario; no se cambia ningún registro de avance.\n\nEl JSON ya está creado: NO volver a ejecutar el materializador para sustituirlo. Este ajuste alinea el modelo global, los cuatro agentes, las listas permitidas existentes y el campo model de los comandos dirigidos al coordinador. Las entradas de modelos anteriores en una whitelist pueden permanecer sin estar asignadas a un rol. No es necesario borrarlas. El historial y las huellas del paquete inicial corresponden a aquella entrega; no acreditan esta modificación. Los respaldos y hashes de este ajuste quedan fuera del repositorio.\n\n## Inicio con la CLI del propietario\nEjecutar desde la raíz de OTERCO: opencode debug agents; validar los cuatro roles. El catálogo no demuestra autenticación. Abrir una sesión nueva con opencode --auto, sin -c al cambiar de negocio. Verificar GLM-5.3-Flash en ot-coordinador. Primero /ot-estado (solo lectura) y, cuando Go responda y el proyecto sea correcto, /ot-iniciar para OT-01 si sigue pendiente. No usar --refresh, agent list, --pure --agent ni --standalone con debug: esa combinación no está verificada en esta instalación. No crear o usar /ot-lote como si ya existiera.\n\n## Operación\nGLM delimita, Muse escribe y DeepSeek revisa. Un solo escritor. Hasta tres tareas secuenciales únicamente si el propietario lo solicita, con pruebas/registro entre ellas y parada ante aprobación visual, cuota, bloqueo u operación remota. No ejecutar ambos proyectos en una misma sesión, ni aplicar el parche de PA a OTERCO. Mantener Use balance apagado; no incluir secretos ni renovar automáticamente promociones o planes. --auto no es aislamiento del sistema operativo.\n\n## Validación pendiente\nEsta utilidad no ejecuta OpenCode ni modelos: debug agents y la primera llamada local comprobarán la configuración efectiva. Los permisos y pasos se conservan por construcción; no se ha verificado la cuenta o configuración global. Fuentes: documentación oficial de agentes, comandos y configuración de OpenCode V2 (consulta 19/09/2026):\n- https://opencode.ai/v2/docs/agents/\n- https://opencode.ai/v2/docs/commands/\n- https://opencode.ai/v2/docs/config/\n`;
  const existing = await load(adendaPath, true);
  if (existing && existing.text !== adenda) fail(`Ya existe una adenda diferente: ${adendaPath}; no sobrescribir.`);
  await add(adendaPath, adenda, true);
  console.log('Proyecto: ' + ROOT);
  for (const [id, model] of Object.entries(MODELS)) console.log(id + ' -> ' + model);
  for (const c of plan) console.log((c.before === null ? 'CREAR ' : 'ACTUALIZAR ') + c.rel);
  if (!plan.length) return console.log('Sin cambios: el reparto ya coincide. Falta comprobar la CLI/cuenta real.');
  if (!apply) return console.log('SIMULACION: no se ha escrito nada. Con agentes detenidos, repetir con --aplicar.');
  for (const c of plan) if ((await readLocal(c.rel, true))?.text !== (c.before ?? undefined)) fail(`Cambio concurrente en ${c.rel}; detener.`);
  const state = path.join(os.homedir(), '.local/state/oterco-glm-modelos', digest(ROOT).slice(0,12));
  if (inside(ROOT, state)) fail('El respaldo no puede quedar dentro del proyecto.');
  await fs.mkdir(state, { recursive: true, mode: 0o700 });
  await fs.chmod(state, 0o700);
  const backup = await fs.mkdtemp(path.join(state, new Date().toISOString().replace(/[:.]/g,'-') + '-'));
  await fs.chmod(backup, 0o700);
  const manifest = { kind: 'oterco-glm-flash-1', root: ROOT, changes: [] };
  for (const [i, c] of plan.entries()) {
    if (c.before !== null) await fs.writeFile(path.join(backup, `${i}.original`), c.before, { flag:'wx', mode:0o600 });
    manifest.changes.push({ rel:c.rel, existed:c.before !== null, mode:c.mode, beforeHash:c.before === null ? null : digest(c.before), afterHash:digest(c.after) });
  }
  await fs.writeFile(path.join(backup, 'manifest.json'), JSON.stringify(manifest,null,2)+'\n', { flag:'wx', mode:0o600 });
  const done=[];
  try {
    for (const c of plan) {
      const current = await readLocal(c.rel, true);
      if ((current?.text ?? null) !== c.before) fail(`Cambio concurrente: ${c.rel}`);
      await atomicWrite(c.rel, c.after, c.mode); done.push(c);
    }
  } catch(e) {
    let restored = true;
    for (const c of done.reverse()) {
      try {
        const current = await readLocal(c.rel, true);
        if (current?.text !== c.after) { restored = false; continue; }
        if (c.before === null) await fs.unlink(path.join(ROOT,c.rel));
        else await atomicWrite(c.rel,c.before,c.mode);
      } catch { restored = false; }
    }
    console.error('No terminó la aplicación. Reversión: ' + (restored ? 'realizada' : 'requiere revisión manual') + '. Respaldo: ' + backup);
    throw e;
  }
  console.log('Aplicado. Permisos, pasos, instrucciones de agentes/comandos, código y progreso conservados.');
  console.log('Respaldo privado: ' + backup);
  console.log('Restaurar (se detiene si hubo cambios posteriores):\nnode actualizar-oterco-glm.mjs --restaurar ' + quote(backup));
  console.log('Siguiente: opencode debug agents. Después sesión nueva y /ot-estado, sin reusar PA.');
}
try { await main(); }
catch (e) { console.error('ERROR: ' + (e.code ? `Fallo de archivo ${e.code}; revisar permisos/rutas locales.` : e.message)); process.exitCode = 1; }
