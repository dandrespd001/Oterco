# Acta 2026-09-19 — OT-06 Capítulos y portafolio

**Sesión coordinador:** ses_f452eb8eeffeQJGEN8CFk4jaxV · **Implementador:** ot-implementador (ses_f44a7921bffem9037wyMN6gk43 + ajustes ses_f449f4fb4ffeyz95ElQkQE2qKr) · **Revisor:** ot-revisor (ses_f44a26814ffeP9Bxkc74lAr3wP).

## Resultados

- 4 bloques reales desde `proyeccionPublica(perfilBase)` (Portafolio 3 líneas, Fincas 2, GanadoManejo, Infraestructura) + `FotoPendiente.astro`: import real en la página; cero literales en bloques; slots reservan dimensiones de las huellas doc (6/6 verificadas por revisor), bebedero 485/650 contenido; solar sin cifras, ancla #solar sin enlaces rotos (no listado en masthead).
- dist: 0 img/script/base64/file://; sin NIT/contacto/solar/fotos fuera de omitidos; literales de oferta/fincas verificados por el revisor contra 09_FUENTES (coinciden).
- Revisor (límite de pasos alcanzado, veredicto con evidencia recogida): sin bloqueos; 81 tests, 77 pass/4 skip heredados; check 18 ficheros 0/0; ampliación SHELL_OT05 no relaja aserciones.

## Casos

- OT-Q007 ✓ · OT-Q009 ✓ (la ed. localizada queda garantizada por estructura: sin literales duplicados fuera de perfil.esperado.ts) · OT-Q022 ✓ parcial (dims reservadas; srcset/sizes reales pendientes de derivados) · OT-Q023 ✓ (composición contenida; pendiente visual operador) · OT-Q024 ✓.

## Ajustes aplicados (post-revisión)

- data-tratamiento="resumen" en párrafos editoriales (5) para distinguir de transcripción literal.
- Códigos de caso retirados del cuerpo publicable (a comentarios).
- Hero marcado `data-source="sin-asignar"` (futuras validaciones contra SOURCE_IDS deberán exceptuarlo).

## Pendientes

- Operador: derivados de fotos + permisos, .woff2 + licencias, validación visual del prototipo; srcset/sizes reales en la próxima unidad con imágenes.
- Verificación con navegador real de detalles móvil (`<details>`) → OT-10/OT-12.

## Próximo paso

OT-07 — Preparador local de consulta (3 categorías, mailto, sin envío automático ni almacenamiento).
