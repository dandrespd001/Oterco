# Extracción local segura de imágenes

Utilidad de preparación, no código de la web. Usa Python estándar y un destino nuevo; falla si encuentra formatos/cantidad inesperados o si el destino existe. No descarga nada ni valida derechos. La validación de dimensiones/calidad y la optimización pertenecen al pipeline posterior. Ejecutar sobre la fuente que coincide con las huellas; no habilitar scripts desconocidos por contener este nombre.

Guardar el bloque como `extraer.py` en un directorio de trabajo privado, no `public`, y ejecutar con el HTML original y un destino privado nuevo. Los nombres son relativos/controlados; la utilidad no reutiliza rutas aportadas en atributos.

```python
from pathlib import Path
from html.parser import HTMLParser
import base64, hashlib, json, sys

class Images(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
    def handle_starttag(self, tag, attrs):
        if tag.lower() == "img":
            self.images.append(dict(attrs))

def main():
    if len(sys.argv) != 3:
        raise SystemExit("Uso: python extraer.py fuente.html directorio-nuevo-privado")
    source, output = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    if not source.is_file() or source.stat().st_size > 20_000_000:
        raise SystemExit("Fuente ausente o tamaño fuera del límite de esta utilidad")
    if output.exists():
        raise SystemExit("Destino existente: no se sobrescribe")
    parser = Images()
    parser.feed(source.read_text(encoding="utf-8"))
    records, payloads = [], []
    for index, attrs in enumerate(parser.images, 1):
        src = attrs.get("src", "")
        if not src.startswith("data:image/jpeg;base64,"):
            raise SystemExit(f"Imagen {index}: formato no esperado; revisión manual")
        raw = base64.b64decode(src.split(",", 1)[1], validate=True)
        if len(raw) > 10_000_000 or not raw.startswith(b"\xff\xd8\xff"):
            raise SystemExit("JPEG no válido para esta extracción")
        filename = f"original-{index:02d}.jpg"
        payloads.append((filename, raw))
        records.append({"file": filename, "bytes": len(raw),
                        "sha256": hashlib.sha256(raw).hexdigest(),
                        "sourceAlt": attrs.get("alt", ""), "approved": False})
    if len(records) != 6:
        raise SystemExit("Cantidad inesperada: inspeccionar original antes de continuar")
    output.mkdir(parents=True, exist_ok=False)
    for filename, raw in payloads:
        (output / filename).write_bytes(raw)
    (output / "inventory.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Extraídas {len(records)} imágenes; ninguna aprobada para publicación")

if __name__ == "__main__":
    main()
```

No cargar el base64 completo al modelo. Comparar el inventario resultante con INVENTARIO_RECURSOS.md; retirar EXIF en derivados y obtener aprobación antes de su publicación. `inventory.json` se crea al ejecutar esta herramienta, no forma parte del paquete Markdown entregado.
