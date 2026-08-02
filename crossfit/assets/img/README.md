# Imágenes del sitio

**Todas las fotos del sitio son reales del gimnasio.** No queda nada de stock.

## Cómo funciona

Los originales viven en `originales/` y no se tocan nunca. El script
`scripts/images.mjs` los recorta, los optimiza y escribe las versiones que usa la web
en esta carpeta:

```bash
npm run images
```

Si querés cambiar un recorte, editá las coordenadas en `scripts/images.mjs` y volvé a
correr el comando. Cada entrada tiene una nota explicando por qué está recortada así.

## Qué se usa y dónde

| Archivo | Origen | Medida | Dónde aparece |
|---|---|---|---|
| `logo.png` | `00.png` | 230 × 230 | Encabezado, menú móvil y pie |
| `hero.webp` | `02.png` | 1269 × 781 | Fondo del encabezado y del cierre |
| `coach.webp` | `03.png` | 732 × 549 | Sección "Quiénes somos" |
| `prog-standard.webp` | `05.png` | 455 × 341 | Tarjeta Standard |
| `prog-fit.webp` | `04.png` | 455 × 341 | Tarjeta Fit |
| `prog-hibrida.webp` | `06.png` | 456 × 342 | Tarjeta Híbrida |
| `comunidad.webp` | `01.png` | 695 × 428 | Sección "Friends & Fitness" |
| `og.jpg` | `01.png` | 1200 × 630 | Vista previa al compartir en WhatsApp y redes |
| `apple-touch-icon.png` | `00.png` | 180 × 180 | Ícono al agregar a pantalla de inicio en iOS |
| `favicon.svg` | — | vectorial | Ícono de la pestaña |

Las nueve derivadas suman unos 385 KB. Los originales pesaban 4 MB.

## Detalles a tener en cuenta

**Las fotos de las programaciones eran posteos de redes** con el título quemado encima
("Standard", "FIT (Funcional)", "HÍBRIDA"). El recorte lo elimina, pero eso obliga a
usar sólo la mitad inferior de cada imagen. Quedan en 455 px de ancho, así que en
pantallas retina se ven levemente blandas. Si algún día sacás estas fotos sin el texto
encima, reemplazá los originales y volvé a correr `npm run images`.

**El favicon es un SVG dibujado aparte**, no el logo. El logo real tiene las palabras
"Satoshi" y "Friends & Fitness" adentro del círculo, y a 16 px eso es una mancha.

**La foto de comunidad se usa entera**, sin recortar: la gente llega hasta los bordes
del encuadre y cualquier recorte deja a alguien afuera. Por eso su contenedor en el
sitio respeta la proporción original 695:428 en vez de forzar un formato.

## Si más adelante sumás fotos

Convertí a WebP con calidad 82 (o pasalas por `scripts/images.mjs`), apuntá a menos de
250 KB por foto, y actualizá siempre los atributos `width` y `height` en `index.html`.
Esos dos atributos son los que evitan que la página salte mientras carga.
