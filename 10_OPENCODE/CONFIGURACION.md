# Configuración del proyecto OTERCO

<!-- OTERCO_MODELOS_GLM_FLASH_2026_09_19 -->
> **Decisión vigente:** GLM-5.3-Flash coordina; Muse Spark 1.3 Contributor implementa; DeepSeek V4.1 Flash revisa; MiniMax M3 explora. [Adenda](ADENDA_COORDINADOR_GLM_FLASH.md). No reintroducir Kimi como coordinador. El cambio no autoriza publicación ni modifica criterios o estados.

Entrega solo Markdown: el bloque siguiente se materializa como `opencode.json` en la raíz propia. No redefine agentes que ya existen en `.opencode/agents`. [BOOTSTRAP](BOOTSTRAP.md) evita sobrescritura; nunca requiere claves dentro del JSON.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode-go/glm-5.3-flash",
  "small_model": "opencode-go/minimax-m3",
  "default_agent": "ot-coordinador",
  "enabled_providers": [
    "opencode-go"
  ],
  "provider": {
    "opencode-go": {
      "whitelist": [
        "kimi-k2.7-code",
        "minimax-m3",
        "glm-5.2",
        "glm-5.3-flash",
        "muse-spark-1.3-contributor",
        "deepseek-v4.1-flash"
      ]
    }
  },
  "autoupdate": false,
  "share": "disabled",
  "subagent_depth": 1,
  "compaction": {
    "auto": true,
    "prune": true,
    "reserved": 16000
  },
  "watcher": {
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/.wrangler/**",
      "**/test-results/**",
      "**/playwright-report/**",
      ".git/**",
      "**/releases/**",
      "**/.private-references/**"
    ]
  },
  "permission": {
    "*": "ask",
    "read": {
      "*": "allow",
      "*.env*": "deny",
      "*.dev.vars*": "deny",
      "*auth.json": "deny",
      "*.pem": "deny",
      "*.key": "deny",
      "*private-data/*": "deny",
      "*.private-references/*": "deny",
      "*.env.example": "allow",
      "*.dev.vars.example": "allow",
      "*releases/*": "ask"
    },
    "glob": "allow",
    "grep": "allow",
    "list": "allow",
    "lsp": "ask",
    "edit": "deny",
    "bash": {
      "*": "ask",
      "pwd": "allow",
      "git status": "allow",
      "git status --short": "allow",
      "git diff --stat": "allow",
      "git diff --check": "allow",
      "node --version": "allow",
      "pnpm --version": "allow",
      "opencode --version": "allow",
      "*git push*": "deny",
      "*git reset --hard*": "deny",
      "*git clean*": "deny",
      "*rm -rf*": "deny",
      "sudo *": "deny",
      "*printenv*": "deny",
      "env": "deny",
      "*wrangler*deploy*": "deny",
      "*wrangler*publish*": "deny",
      "*wrangler*--remote*": "deny",
      "*wrangler*secret*": "deny",
      "*release:publish*": "deny",
      "*release:rollback*": "deny",
      "*wrangler*d1*": "deny"
    },
    "task": "deny",
    "skill": "deny",
    "webfetch": "ask",
    "websearch": "ask",
    "external_directory": "deny",
    "doom_loop": "ask",
    "question": "allow",
    "todowrite": "deny"
  },
  "agent": {
    "build": {
      "disable": true
    },
    "plan": {
      "disable": true
    },
    "general": {
      "disable": true
    },
    "explore": {
      "disable": true
    },
    "scout": {
      "disable": true
    }
  }
}
```

## Alcance verificado

Se han contrastado las claves con la documentación/esquema públicos de OpenCode consultados el 17/09/2026; el JSON se parsea localmente. Esto no acredita una ejecución con tu CLI o cuenta. El preflight verifica los agentes y permisos efectivos antes de escribir.

Modelos por rol están fijados en frontmatter; defaults/model/small_model no los sustituyen. La whitelist conserva los IDs anteriores y añade los cuatro IDs del reparto vigente; si uno no existe en tu cuenta, detener y aprobar un reemplazo dentro de Go, no usar Zen silenciosamente. Use balance se desactiva en la cuenta, no en este JSON.

Las configuraciones de usuario/proyecto se combinan. El arranque se adapta a la CLI instalada; revisar plugins, MCP, instrucciones heredadas y permisos. `subagent_depth:1` evita anidamiento, no concurrencia. `steps` y compaction no son un presupuesto económico garantizado. watcher.ignore no controla acceso.

El coordinador edita registros, no contratos ni código. El implementador no cambia configuración de agentes ni criterios para aprobar. Terminal ask y denegaciones son controles de herramienta, **no una sandbox**; una ejecución indirecta puede tener más alcance que su nombre. No introducir credenciales o datos privados en el entorno y no conceder permisos globales para “hacerlo funcionar”.

Fuentes: OpenCode [config](https://opencode.ai/docs/config/), [schema](https://opencode.ai/config.json), [agents](https://opencode.ai/docs/agents/), [permissions](https://opencode.ai/docs/permissions/), [CLI](https://opencode.ai/docs/cli/) y [Go](https://opencode.ai/docs/go/).
