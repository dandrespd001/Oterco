# Contrato de independencia visual — dos marcas, no dos temas

**Naturaleza:** dirección de diseño propuesta para implementar; el propietario aprueba el resultado. Conserva las convenciones accesibles aunque algunos controles nativos se parezcan.

## Matriz prescriptiva inicial

| Dimensión | Puerta Abierta | OTERCO |
|---|---|---|
| Personalidad | Urbana, analítica, precisa, orientada a explicar y facilitar contacto | Rural contemporánea, editorial, territorial y cercana |
| Paleta | Azul cobalto, tinta azul, blanco frío, lavanda muy pálida | Pergamino, verde bosque, terracota y ocre restringido |
| Familias propuestas | Manrope (títulos) + Source Sans 3 (cuerpo/controles) | Libre Caslon Display (títulos) + Work Sans (cuerpo) |
| Portada | Fotografía comercial panorámica con velo oscuro, texto blanco y CTA sólido | Titular editorial sobre fondo claro, imagen ganadera en proporción asimétrica; sin texto blanco superpuesto |
| Encabezado | Barra compacta, CTA sólido; comportamiento sticky moderado | Masthead tipográfico y menú/índice breve; no sticky en la primera entrega |
| Organización | Oferta → ventajas → método → comparación → cobertura → contacto directo → cierre | Territorio → portafolio → haciendas → vida del hato/infraestructura → manejo → solar opcional → cierre editorial/contacto |
| Secciones | Bloques modulares y recorridos de decisión; acordeones de método | Capítulos editoriales, fichas de haciendas y secuencias fotográficas |
| Elementos | Botón sólido 10–12 px radio; panel de contacto 16 px, sin campos; iconos técnicos compactos | Enlaces subrayados/botones rectos 0–3 px; filetes; pies de foto y títulos serif |
| Imágenes | Fachadas/locales/tejido urbano; geometría controlada; sin ganado ni topografía ornamental | Fotos rurales propias autorizadas, horizontes y detalles; sin skyline ni iconos inmobiliarios |
| Ancho objetivo | Contenedor 1.216 px, texto ~65 ch, retícula 12 columnas como guía | Contenedor 1.120 px, texto ~58 ch, columnas editoriales asimétricas |
| H1 orientativo | clamp(2.25rem, 4.2vw, 3.75rem), peso 650–700, interlineado 1.08 | clamp(2.75rem, 5.5vw, 5rem), peso 400, interlineado 1.05 |
| Cuerpo orientativo | 17 px, interlineado 1.6; enlaces y controles 16 px | 18 px, interlineado 1.65; captions ≥14 px |
| Ritmo | Separaciones principales 56–80 px, panel de canales jerarquizado | Separaciones 72–112 px, alternar imagen/lectura sin grandes huecos vacíos |
| Movimiento | Estados de controles 120–180 ms; feedback inmediato; sin desplazar fotos | Enlaces/filetes 220–280 ms; fotografías quietas; no revelar contenido al hacer scroll |
| Móvil | Navegación plegable y acceso breve a contacto; canales visibles sin formulario | Índice editorial no modal, fotos con crop aprobado, capítulos; contacto sin barra flotante copiada |
| Pie | Breve y luminoso, identificación y privacidad | Cierre verde bosque con contacto editorial; sin imitar tres columnas del otro |

Las cifras son puntos de partida y se ajustan por pruebas de lectura. No fijar alturas que corten texto ni anchos que impidan zoom. Fuentes locales con licencia comprobada y fallback; nada de fuentes premium obligatorias ni archivos de fuentes compartidos en este paquete. Si falta acceso a la fuente, usar fallback distinto por marca y no aprobar todavía la tipografía final.

## Lo expresamente prohibido

- Duplicar el hero/footer/CSS de Puerta Abierta, cambiar colores y declararlo OTERCO.
- La misma secuencia de tarjetas, proporciones, iconos, paddings y curvas de animación con otro texto.
- Un `theme === empresa` en un núcleo visible o imports de una app a otra.
- Una galería o fuente pública común que haga descargar ambas identidades.
- Forzar diferencias mediante controles incomprensibles, contraste insuficiente o movimiento excesivo.
- Inventar porcentajes de originalidad o prometer anonimato de autoría.

## Revisión en etapas

**Antes de programar secciones completas:** dos mapas de composición separados; en la fase 1 solo se construye Puerta Abierta respetando la reserva visual de OTERCO. Su comparación provisional es contra esta matriz, no contra una web de OTERCO todavía inexistente.

**Al finalizar Puerta Abierta:** guardar su ficha visual y capturas aprobadas para revisión; el futuro OTERCO empieza de su propia referencia HTML. El diseñador no recibe componentes de Puerta Abierta como plantilla.

**Al terminar OTERCO:** comparar hero, cabecera, dos secciones interiores, contacto, pie y móvil completos. Hacer también una copia de revisión sin logos y en escala de grises para observar estructura; no usarla como único test.

**Evidencia:** navegador/sistema/fuentes/viewport, capturas originales, diferencias observadas, similitudes justificadas, decisiones pendientes y firma del propietario. Los snapshots detectan regresiones de cada sitio contra sí mismo; no certifican que dos diseños sean diferentes. [Playwright](https://playwright.dev/docs/test-snapshots).

## Checklist de aceptación visual

- [ ] No hay familias principales iguales, salvo fallback temporal no aprobado.
- [ ] Paletas y distribución de superficies son distintas, no solo el acento.
- [ ] Jerarquías, escala y ancho del titular se distinguen sin logo.
- [ ] Hero, navegación, cierre y bloques interiores no comparten esqueleto visible.
- [ ] Orden y agrupación responden al propósito distinto, con trazabilidad de fuentes.
- [ ] Fotografías, proporciones, crops e iconografía tienen tratamiento local.
- [ ] Botones, fichas, tablas/paneles de contacto y captions no forman una misma biblioteca visual.
- [ ] El móvil no converge en la misma pila de tarjetas.
- [ ] Movimiento reducido está respetado y el contenido no necesita animación para aparecer.
- [ ] Recursos de la otra marca ausentes del build y de la red.
- [ ] Accesibilidad manual, errores y zoom conservan legibilidad.
- [ ] Revisión humana registrada; los pendientes no se marcan aprobados por la IA.

No añadir 'diseñado por' o una firma común por defecto. No retirar créditos/licencias exigibles. Esta decisión busca identidad de marca, no falsear autores ni ocultar relaciones societarias documentadas.

## Cambio vigente de Puerta Abierta

Su formulario, receptor, DB y CAPTCHA se retiraron por instrucción posterior. No conservar la silueta del formulario como bloque vacío ni convertirlo en una herramienta de datos personales. Los canales directos y una explicación breve ocupan esa sección. OTERCO no copia este panel: conserva contacto editorial y, cuando corresponda, su preparador local.
