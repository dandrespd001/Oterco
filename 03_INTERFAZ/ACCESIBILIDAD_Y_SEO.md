# Accesibilidad, SEO y estados

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


Objetivo WCAG 2.2 AA (V24–V26), sin prometer conformidad completa por pasar axe. Un H1, main, header/nav/footer identificables y skiplink. Jerarquía H2/H3 con capítulos y fotos; no sustituir texto por imagen. Idioma es-CO, unidades claras, acentos y caracteres legibles.

Enlaces descriptivos; botones para acciones, enlaces para navegación. Operación con Tab/ShiftTab/Enter/Espacio según elemento. Foco siempre visible y no tapado; índice móvil con nombre/estado y cierre adecuado. Ningún hover obligatorio. Objetivo táctil 44×44 px; esta cifra es criterio de proyecto, no definición del mínimo AA universal. Contraste normal≥4.5:1, grande≥3:1 y componentes/indicadores según criterio aplicable. Ocre decorativo no exime contraste.

Probar320/390/768/1440 px, zoom 200% y reflow 400%, orientación, texto largo y `prefers-reduced-motion`. Sin scroll horizontal de página; imagen vertical no fuerza ancho. Contenido/anclas/email legibles sin JS. El preparador explica que necesitaJS y deja alternativa de contacto. Fallo del módulo no inutiliza portfolio ni navegación.

Para campos del preparador: labels visibles, ayuda enlazada, error textual y anunciado sin cada pulsación, revisión antes de abrir mailto, resultado de texto plano accesible, copia con éxito/error reales. No mensajes “enviado”. Restaurar foco razonablemente al cerrar.

SEO: título/descripción propios, canonical de dominio aprobado, robots y sitemap de rutas públicas, OpenGraph y favicon locales. `Organization` solo con hechos aprobados; no reseñas/estrellas/certificaciones/sedes inventadas. Domicilio societario no prueba local abierto al público. Privacidad y404 no se usan como páginas de relleno. En previews `noindex`; esto no protege datos, que deben estar ausentes.

Rutas inexistentes responden 404 real; no fallback de SPA. Anchorlinks no son páginas de servicios independientes. No visible “made by” inventado; conservar atribuciones legales de recursos cuando correspondan. No añadir metadatos falsos para ocultar autoría. Capturas y manuales nunca afirman revisión visual si solo se leyó código.
