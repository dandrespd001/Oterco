# Comprobación inicial del entorno

<!-- OTERCO_MODELOS_GLM_FLASH_2026_09_19 -->
> **Decisión vigente:** GLM-5.3-Flash coordina; Muse Spark 1.3 Contributor implementa; DeepSeek V4.1 Flash revisa; MiniMax M3 explora. [Adenda](ADENDA_COORDINADOR_GLM_FLASH.md). No reintroducir Kimi como coordinador. El cambio no autoriza publicación ni modifica criterios o estados.

1. Confirmar carpeta/repo de OTERCO, cambios Git y ausencia de escritor activo. Separar configuraciones antiguas; no superponer paquetes.
2. Node/pnpm/Git/OpenCode disponibles. Materializar config según BOOTSTRAP sin sobrescribir. Ver ayuda si la versión difiere, sin eliminar permisos por error.
3. Conectar Go por `/connect` en la TUI si falta; la clave se introduce allí, no en chat/archivo. Use balance apagado en la cuenta.
4. En terminal, desde esta raíz:

```bash
opencode --version
opencode models
opencode debug agents
```

5. Confirmar los cuatro IDs previstos y los cuatro agentes de este sitio. Revisar configuración efectiva global/proyecto, variables de entorno de config, instrucciones heredadas, plugins y MCP; no imprimir autenticación o secretos.
6. Abrir `opencode --auto`. `--auto` se usa por decisión del propietario y no es una sandbox; conserva las denegaciones y no aísla plugins/MCP heredados.
7. Probar Task de lectura acotada al explorador y retorno, y restricciones de edición con un fixture público deliberado. No intentar leer secretos reales para “probar” denegación.
8. Registrar CLI/modelos/resultados/permisos/diferencias en REGISTRO_PREFLIGHT. Si algo no es compatible, corregir con operador y documentación oficial; no afirmar que el perfil ejecutó porque el JSON se pudo parsear.
9. `/ot-iniciar`. Empezar OT-01 o continuar la pendiente real, no reiniciar tareas aprobadas.

Después del bootstrap de scripts, aprobar solo comandos locales concretos revisados; no pnpm* o bash* general. Esas autorizaciones no sustituyen aislamiento del SO. No hace falta configurar hosting ni dominio para programar.
