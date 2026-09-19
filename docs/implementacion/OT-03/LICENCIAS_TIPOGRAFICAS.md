# Licencias tipográficas OT-03 — registro pendiente

**Fecha:** 2026-09-19 · **Estado:** PENDIENTE DEL OPERADOR (sin binarios en el repo).

## Familias elegidas (distintas de la otra marca, sin CDN en runtime)

| Familia | Rol | Pesos útiles | Licencia esperada |
|---|---|---|---|
| Libre Caslon Display | Titulares | 400 | OFL-1.1 |
| Work Sans | Texto / UI | 400, 500, 700 | OFL-1.1 |

Declaración técnica lista en `apps/oterco/src/styles/fonts.css`
(4 bloques `@font-face`, `font-display: swap`, solo `url()` locales a
`../assets/fonts/*.woff2`, cero URL remotas — verificado por OT-Q011).

## Por qué pendiente (sin red remota en esta unidad)

La ficha exige obtener las fuentes de distribución autorizada. En esta
unidad la red remota no está autorizada, por lo que NO se descargó nada:
ni fetch a Google Fonts / GitHub, ni CDN en runtime, ni copia de fuentes
de Puerta Abierta. Los `.woff2` no existen todavía
(`src/assets/fonts/` contiene solo `README.md` con los pasos).

## Qué debe registrar el operador al descargar

1. Origen exacto (URL de distribución autorizada + fecha de descarga).
2. Versión de cada familia y SHA-256 de cada `.woff2`.
3. Copiar junto a los binarios el `LICENSE`/`OFL.txt` que acompañe la
   descarga (la OFL exige distribuir la licencia con la fuente); los
   archivos tipográficos y su licencia viven en `src/assets/fonts/`,
   nunca en carpetas documentales.
4. Completar esta tabla con los valores reales:

| Fichero | Versión | SHA-256 | Origen | Fecha |
|---|---|---|---|---|
| `libre-caslon-display-400.woff2` | — | — | — | — |
| `work-sans-400.woff2` | — | — | — | — |
| `work-sans-500.woff2` | — | — | — | — |
| `work-sans-700.woff2` | — | — | — | — |

## Cableado pendiente (tras la descarga)

- Importar `../styles/fonts.css` desde la página cuando los binarios
  existan (hoy sin importar a propósito: evita 404 y FOUT con ficheros
  ausentes). Medir entonces OT-Q037/OT-Q038 con las fuentes reales.
- Autoría/atribución según el `LICENSE` descargado; no se afirma aquí
  autoría alguna sin el archivo de licencia en mano.
