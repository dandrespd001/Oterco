# Comparación conceptual frente a Puerta Abierta (OT-04, sin capturas nuevas)

**Fecha:** 2026-09-19 · **Método:** comparación conceptual contra la matriz de
`03_INTERFAZ/INDEPENDENCIA_VISUAL.md`. **Sin capturas nuevas:** no existen
capturas aprobadas de PA en este repo (verificado: cero archivos de imagen en
el árbol) y el encargo prohíbe generar capturas nuevas para garantizar la
no-colisión. La comparación visual completa con capturas inspeccionadas queda
**pendiente del operador** (OT-14, CHECKLIST_VISUAL V-15/V-17).

| Dimensión (matriz) | Puerta Abierta (referencia matriz) | OTERCO OT-04 (implementado) |
|---|---|---|
| Personalidad | Urbana, analítica | Rural contemporánea, editorial, territorial |
| Paleta | Cobalto/tinta azul/blanco frío | Pergamino/bosque/terracota/ocre restringido |
| Familias | Manrope + Source Sans 3 | Stacks de trabajo hacia Caslon + Work Sans; `fonts.css` sin cablear; cero familias de PA en CSS |
| Portada | Foto panorámica con velo, texto blanco, CTA sólido | Hero tipográfico sobre fondo claro + textura abstracta CSS; bloque pendiente sin foto |
| Encabezado | Barra compacta sticky + CTA | Masthead tipográfico no sticky + índice `<details>` de 5 destinos |
| Organización | Oferta→ventajas→método→comparación→cobertura→contacto | Hero→portafolio→fincas→manejo→infra→cierre (sin contacto) |
| Elementos | Píldoras 10–12 px, panel 16 px | Rectos 0–3 px, filetes, etiquetas con borde, pies de bloque |
| Ancho/ritmo | 1216 px, 56–80 px | 1120 px, 40–112 px, capítulos asimétricos 7/5 |
| H1 | clamp medio, peso 650–700 | `clamp(2.75rem, 6.2vw, 5rem)`, peso 400 |
| Movimiento | 120–180 ms, feedback | Sin animación de entrada; reduced-motion anula todo |
| Pie | Breve y luminoso | Bosque profundo, una columna protagonista |

**Riesgo registrado:** ambos sitios comparten autor de implementación; no se
promete imposibilidad de atribución (DISENO.md §Aprobación). La diferenciación
exigida es de identidad y composición, verificable por el operador en OT-14.
