# OT-12 — Plantilla del pipeline único (BORRADOR, sin YAML real)

**Estado:** documentación para decisión del operador. **No crear**
`.github/workflows/*` **en esta unidad** (encargo OT-12: sin cuentas
remotas, SIN ACCOUNTS). La codificación real del workflow la aprueba y la
materializa el operador en OT-16/17. Este texto es la especificación
revisable del pipeline, no un workflow ejecutable.

## 1. Un solo pipeline (OT-Q044/Q046)

- Un único workflow de release; **prohibido** un segundo autodeploy
  paralelo (sin Workers Builds simultáneos).
- Cadena: rama → check/test → build → E2E/medición → revisión →
  commit integrado → `release:prepare` (candidato local con manifiesto y
  huellas) → `release:verify` → promoción = **copia de bytes sin
  recompilar** + `release:promote:local` en ensayo → aprobación humana →
  publicación manual del operador → smoke → registro.
- Runner Linux estándar; retención corta de artefactos técnicos (7 días
  propuestos); cancelación de corridas obsoletas por rama; sin minutos
  duplicados (cuotas GitHub Free compartidas, OT-Q053).

## 2. Secretos y PRs no confiables (OT-Q046)

- Los trabajos de PR (incluidos forks) **nunca reciben secretos**: el job
  de `pull_request` no declara `secrets:*` y el job de publicación solo
  existe en `workflow_dispatch` manual con aprobador registrado.
- Ningún paso ejecuta código de un fork con credenciales; el checkout de
  PRs no confiables usa solo lectura y sin `persist-credentials`.
- Revisión de permisos antes de concederlos: `contents: read` por
  defecto; escritura mínima solo en el job manual de publicación tras
  aprobación (operador). Sin tokens en logs ni en artefactos.

## 3. Puertas de aborto (OT-Q045)

El pipeline aborta (FALLA, sin publicar) si el candidato:

1. trae propósito distinto de `candidato-tecnico` /
   `candidato-comercial-aprobado`, o comercial sin aprobaciones
   (`isPublicable` + `DOMINIO_APROBADO`, hoy técnicas);
2. trae `siteId` distinto de `OTERCO-<slug>` (p. ej. artefacto de
   Puerta Abierta);
3. difiere del manifiesto (hash por fichero o hash de árbol);
4. contiene marca de origen ajeno o borradores no publicables;
5. excede presupuestos OT-11 o cuotas Free (Q053: limita e informa,
   sin pagos automáticos).

La promoción es **gitlista con huellas solamente**: copia de bytes +
`arbolHash` igual al manifiesto; las cabeceras/`_headers` por destino se
registran y hashean aparte, sin anunciar igualdad byte a byte si un
archivo de configuración por destino cambia (DESPLIEGUE §cadena única).

## 4. Qué NO hace este pipeline

- No publica, no cambia DNS/correo, no toca cuentas remotas (OT-16/17).
- No instala API, DB, CAPTCHA, formularios externos ni envío automático.
- No reconstruye recepción ni habilita el preparador para PA: el
  preparador aprobado es únicamente local y no habilita función para PA.
- No confirma ejecuciones no realizadas; cada paso registra
  comando/salida/exit code en `docs/implementacion/OT-1X/`.

## 5. Pendiente del operador (SIN ACCOUNTS)

1. Decidir la creación de `.github/workflows/release.yml` a partir de
   esta plantilla (un solo pipeline).
2. Verificar plan/cuotas reales de GitHub y Cloudflare antes de
   cualquier operación remota (OT-Q002/OT-Q053).
3. Conectar Go/hosting manualmente; el agente no publica ni configura
   cuentas.
