# Imágenes del sitio

Hoy el sitio funciona con **fotos de stock de Unsplash cargadas por URL**, así que se ve
terminado desde el minuto uno. Cuando tengas las fotos reales del box, reemplazalas acá.

## Cómo reemplazar una foto

1. Guardá la foto en esta carpeta con el nombre indicado en la tabla.
2. Abrí `index.html` y buscá la URL de Unsplash correspondiente.
3. Reemplazá `src="https://images.unsplash.com/..."` por `src="assets/img/nombre.webp"`.
4. Ajustá `width` y `height` a las dimensiones reales de tu foto (esto evita que la
   página "salte" mientras carga — es lo que Google mide como CLS).

## Fotos necesarias

| Archivo | Dónde aparece | Medida recomendada | Qué debería mostrar |
|---|---|---|---|
| `hero.webp` | Fondo del encabezado | 2000 × 1333 px | Plano general del box en plena clase. Con espacio libre a la izquierda: ahí va el título. |
| `nosotros.webp` | Sección "Quiénes somos" | 1200 × 1500 px (vertical) | Coach corrigiendo a un atleta. Transmite acompañamiento. |
| `prog-standard.webp` | Tarjeta Standard | 1000 × 625 px | Barra olímpica, snatch o clean & jerk. |
| `prog-fit.webp` | Tarjeta Fit | 1000 × 625 px | Circuito por estaciones, sin barras ni jaulas. |
| `prog-hibrida.webp` | Tarjeta Híbrida | 1000 × 625 px | Running o trabajo continuo. |
| `galeria-1.webp` | Galería (foto grande) | 1200 × 1200 px | La mejor foto que tengas del box. |
| `galeria-2..5.webp` | Galería (4 chicas) | 800 × 600 px | Equipamiento, clase grupal, detalle, comunidad. |
| `cta.webp` | Fondo del cierre | 2000 × 1333 px | Plano de ambiente. Va muy oscurecida. |
| `og-image.jpg` | Vista previa al compartir en WhatsApp / redes | **1200 × 630 px exactos** | Foto del box con el logo. Actualizar también la etiqueta `og:image` en `index.html`. |

## Formato

- Usá **WebP** (o AVIF). Pesan la mitad que un JPG con la misma calidad.
- Convertidor sin instalar nada: [squoosh.app](https://squoosh.app).
- Apuntá a menos de 250 KB por foto; el fondo del hero, menos de 400 KB.
- El `favicon.svg` de esta carpeta es el ícono de la pestaña. Ya está listo.

## Si una foto falla

Cada contenedor de imagen tiene un degradado de fondo en los colores de la marca. Si una
URL se rompe, se ve el degradado en lugar de un ícono roto — el sitio nunca queda "feo".
