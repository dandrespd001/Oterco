# Contenido editable, contratos y registros

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Contratos a implementar

| Contrato | Datos | Validación |
|---|---|---|
| SiteConfig | ID `oterco`, nombre, locale `es-CO`, URL canónica, modo/publicable, contacto, composición | Producción HTTPS y dominio comprobado; nunca canal ficticio |
| FarmRecord | ID, nombre, municipio, departamento, función, texto, fotos | IDs estables; solo dos registros de las fuentes hasta ampliación aprobada |
| PortfolioRecord | ID, categoría, título, descripción, destino CTA | Tres líneas actuales; no precio, stock o compra implícitos |
| ChapterRecord | ID, tipo permitido, datos, enabled | Sin componente/ruta/código arbitrario desde JSON |
| AssetRecord público | ID, importación, alt, focalPoint, función | Existe, dimensiones y autorización; alt según función |
| ClaimRecord privado | literal, origen, propuesta, estado, aprobación | Fuera del HTML/JS/JSON público |
| InquiryInput | topic, message | Enum permitido y máximo 800 caracteres; no ejecución HTML |
| InquiryResult | asunto y cuerpo de texto plano | Determinista, sin promesa de envío ni precio |

Los esquemas Zod son autoridad de estructura; tipos se infieren. `schemaVersion` no equivale a revisión editorial ni a versión de la aplicación. Los diseños visibles se controlan con componentes de OTERCO, no mediante HTML arbitrario editado por IA en JSON.

## Ejemplo técnico no publicable

```json
{
  "schemaVersion": 1,
  "siteId": "oterco",
  "publishable": false,
  "mode": "technical",
  "locale": "es-CO",
  "canonicalUrl": null,
  "contact": {"email": null, "verified": false},
  "tools": {"inquiryDraft": {"enabled": true}},
  "solar": {"enabled": false, "claimState": "blocked"}
}
```

El ejemplo no crea contactos ni una URL. Un dato bloqueado no deja rastros públicos en SEO, textos alternativos o código cliente. Un editor debe saber dónde cambiar datos, cómo validar y qué flujo de aprobación seguir. No se construye un CMS.

## Comprobaciones de build

IDs/anclas únicos; menú sin destinos apagados; recursos existentes; no `file://`, `javascript:` o rutas absolutas personales; datos públicos sin notas internas; correo verificado antes de producción; bloque solar pendiente excluido explícitamente; no claims críticos sin aprobación; no fuentes/colores/componentes de PA; no placeholder en salida comercial. La comprobación permite fixtures en salida técnica no promocionable.
