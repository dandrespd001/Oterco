# Funciones exentas, diferidas y condicionadas

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


La clasificación conserva el motivo real. “Exenta” significa fuera del contrato de esta entrega, no una imposibilidad universal. Una función gratuita también puede excluirse por mantenimiento, falta de datos o alcance. No implementarla solo porque se menciona aquí.

| ID | Función | Clasificación | Motivo/alternativa |
|---|---|---|---|
| OT-EX01 | Workers/VPS/servicios Paid, autoescalado con cobro o trial con vencimiento | EXENTA_POR_GRATUIDAD | AssetsFree, fallar/optimizar antes de contratar |
| OT-EX02 | Procesamiento remoto de video, streaming de pago, IA de consultas por consumo | EXENTA_POR_GRATUIDAD | Fotos optimizadas en build; sin IA en runtime |
| OT-EX03 | Un asset de más de25MiB en Static Assets | EXENTA_POR_GRATUIDAD_EN_DESTINO | Optimizar o retirarlo; no bucketde pago silencioso |
| OT-EX04 | Formulario receptor/D1/Turnstile de OTERCO | DIFERIDA_POR_ALCANCE | No pedido por las fuentes; contacto/preparador local. Puede serFree, no se afirma lo contrario |
| OT-EX05 | Envío automático de emails, newsletter o CRM | DIFERIDA_POR_ALCANCE | Mailto/copia voluntaria; no receptor inmobiliario heredado |
| OT-EX06 | Venta online, inventario real de hato, precios/pagos/reservas | DIFERIDA_POR_ALCANCE | Portafolio informativo; nueva especificación de transacciones |
| OT-EX07 | Cálculos de raciones, carga animal, peso/salud, rendimiento económico o solar | PENDIENTE_DE_DATOS_Y_VALIDACION | No hay modelo/inputs/fuentes operacionales; no inventar consejos técnicos |
| OT-EX08 | IoT, telemetría ganadera/solar, GIS o rutas | DIFERIDA_POR_ALCANCE | No hay API/datos ni necesidad definida; ubicación textual |
| OT-EX09 | Video original en portada, autoplay y carrusel | DIFERIDA_POR_ALCANCE_RENDIMIENTO | No necesarios; video que quepa puede serFree, pero permiso y uso no aprobados |
| OT-EX10 | Modo oscuro automático | DIFERIDA_POR_MANTENIMIENTO | Gratis técnicamente; duplica contraste/QA y no mejora necesidad principal |
| OT-EX11 | CMS, login y panel | DIFERIDA_POR_ALCANCE | Datos validados y preview |
| OT-EX12 | Tipografías/stock/plantillas con licencia de pago | EXENTA_POR_PRESUPUESTO | Solo alternativas autorizadas sin costo añadido, no piratería |
| OT-EX13 | Fotos/datos solares/contactos sin aprobación | PENDIENTE_DE_APROBACION | Fixtures u omisión explícita hasta validar |
| OT-EX14 | Reusar UI, fotos y CSS de PA para ahorrar | EXCLUIDA_POR_REQUISITO_VISUAL | Crear interfaz propia; reutilizar solo utilidades neutrales |
| OT-EX15 | Analítica publicitaria, widgets y mapas externos | DIFERIDA_POR_ALCANCE | Sin seguimiento ni embeds iniciales |
| OT-EX16 | Anonimato/indetectabilidad del desarrollador | NO_GARANTIZABLE | Diferenciación visual comprobada, sin falsificar autoría/licencias |

Reingreso: necesidad concreta, fuente/regla, compatibilidad Free acreditada para cuenta, datos, impacto de mantenimiento/rendimiento, pruebas y aprobación escrita. Hosting gratis no incluye dominio/buzón/OpenCode Go ni horas de trabajo.
