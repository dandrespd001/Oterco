# Acta 2026-09-20 — OT-10 Accesibilidad y móvil

**Sesión coordinador:** ses_f452eb8eeffeQJGEN8CFk4jaxV · **Implementador:** ot-implementador (ses_f3f053d45ffeblVD5zxTnjgdt9 + ajustes ses_f3efdeecbffe0Wqu81lAdPAyYI) · **Revisor:** ot-revisor (ses_f3f009a74ffeZRHP4ZXf6RhhN4).

## Resultados

- Auditoría programática de accesibilidad (`tests/acc.test.mjs`, 23 tests sin paquetes): jerarquía, figuras/notas, aria/labels, skip-link, landmarks, tabindex/foco ≥3px, taborder-vs-visual, contraste WCAG calculado sobre tokens (11 pares texto ≥4.5:1; ocre solo decorativo), táctiles ≥44px, reflow 320px, reduced-motion, lang/titles.
- Cero paquetes nuevos; sin navegador en el entorno — **nada se declara según visión**. Única corrección de interfaz: skip-link + main en `public/404.html` (luego con CSS embebido mínimo).
- Revisor: reprodujo suite completa (201/196/0/5),炼 build, cálculo WCAG independiente coincidente (13 pares); sin paquetes ni secretos.

## Casos

- OT-Q019 ✓ · Q013/Q015/Q016/Q017/Q018 verdes en proxy, **pendiente de verificación viva por operador** §5 del INFORME: instrucciones exactas de viewports 320/390/768/1440, zoom 200%/reflow 400%, teclado, lectores Edge/Orca, axe DevTools gratuito y capturas completas (inspección visual no sustituible por DOM).
- OT-Q052 **pendiente operador** (axe/capturas/archivo).

## Ajustes post-revisión

F1 1280→1440 en informe/evidencia/test · cosmético tipográfico · F4 CSS embebido en 404 (nota: duplica literales de tokens; actualizar a mano si cambian) · F3 aserción sobre CSS emitido del bundle.

## Limitación persistente

DOM ≠ visión: sin capturas inspeccionadas por el operador NO se habilita la aprobación visual ni la publicación (bloqueos de fichas OT-10/14/15). SinXY evidencia visual archivada en esta unidad; el operador debe aportarlas.

## Próximo paso

OT-11 — Rendimiento y seguridad estática sobre dist actual (presupuestos, `CSP`, secretos, Lighthouse — Lighthouse real requiere navegador/CI del operador).
