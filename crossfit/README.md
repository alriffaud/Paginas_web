# Satoshi Friends &amp; Fitness — Sitio web

Sitio de una sola página para el box de Barrio Sur, Montevideo.
HTML estático + Tailwind CSS v4 + GSAP. Sin framework, sin backend, sin base de datos.

---

## Índice

1. [Cómo trabajar con el proyecto](#1-cómo-trabajar-con-el-proyecto)
2. [Qué editar y dónde](#2-qué-editar-y-dónde)
3. [Pendientes antes de publicar](#3-pendientes-antes-de-publicar)
4. [Cómo publicarlo](#4-cómo-publicarlo)
5. [Decisiones de diseño](#5-decisiones-de-diseño)
6. [Accesibilidad y rendimiento](#6-accesibilidad-y-rendimiento)

---

## 1. Cómo trabajar con el proyecto

Instalación (una sola vez):

```bash
npm install
```

Mientras editás, dejá corriendo el compilador de estilos:

```bash
npm run dev
```

Para ver el sitio en el navegador, en otra terminal:

```bash
npm run serve
```

Antes de subir a producción, compilá el CSS minificado:

```bash
npm run build
```

Si cambiás las fotos del gimnasio, regeneralas con:

```bash
npm run images
```

> **Importante:** Tailwind lee las clases directamente de `index.html`. Cada vez que
> agregues o cambies una clase en el HTML tenés que volver a compilar (`npm run dev`
> lo hace solo; `npm run build` para el archivo final). Si un cambio de clase "no se
> ve", casi siempre es que falta recompilar.

### Estructura

```
index.html              Todo el contenido de la página
src/input.css           Fuente de estilos: colores, tipografía, componentes
assets/css/main.css     CSS compilado (generado — no editar a mano)
assets/js/main.js       Animaciones, horarios, reseñas, formulario
assets/img/             Fotos optimizadas para la web (generadas)
assets/img/originales/  Fotos originales del gimnasio — nunca se tocan
assets/video/           Video de fondo del encabezado + su póster
scripts/images.mjs      Recorta y optimiza las fotos (npm run images)
```

---

## 2. Qué editar y dónde

### Teléfono, email y nombre

`assets/js/main.js`, arriba de todo, en el objeto `CONFIG`. Además hay enlaces
`tel:` y `wa.me` dentro de `index.html` (buscá `59892321900`).

### Horarios

`assets/js/main.js`, constantes `IMPARES`, `PARES` y `HORARIOS`. Cada clase es
`{ t: "07:00", prog: "standard" }` y `prog` sólo puede ser `standard`, `fit` o `hibrida`.
La grilla, las pestañas y los filtros se regeneran solos desde ese único array: no hay
que tocar el HTML ni mantener dos copias de los datos.

### Reseñas

`assets/js/main.js`, constante `RESENAS`. Agregá o quitá objetos del array; el carrusel
se ajusta solo. Las iniciales del avatar se calculan a partir del nombre.

### Textos de las programaciones

Están escritos directamente en `index.html`, en la sección `PROGRAMACIONES`. El texto
corto es el que se ve siempre; el largo está dentro de `<div class="prog-more">` y se
despliega con "Leer más".

### Video del encabezado

Está en `assets/video/`, en dos formatos: `presentacion.webm` (253 KB, lo eligen
Chrome, Firefox y Android) y `presentacion.mp4` (582 KB, para Safari). El navegador
toma el primero que soporta. `presentacion-poster.webp` es el primer fotograma y se ve
mientras el video carga, o en lugar del video si el usuario pidió menos movimiento.

Para reemplazarlo por otro video:

```bash
ffmpeg -i nuevo.mp4 -c copy -movflags +faststart assets/video/presentacion.mp4
ffmpeg -i nuevo.mp4 -c:v libvpx-vp9 -crf 36 -b:v 0 -an assets/video/presentacion.webm
ffmpeg -i nuevo.mp4 -frames:v 1 -q:v 2 poster.jpg
```

`-movflags +faststart` mueve el índice al principio del archivo: sin eso el video no
empieza a reproducirse hasta terminar de descargarse. `-an` descarta el audio, que no
se usa. Convertí `poster.jpg` a WebP y guardalo como `presentacion-poster.webp`.

Si cambiás el video, **volvé a mirar el contraste del título**: un video más claro
puede dejar ilegible el "CON PROPÓSITO" en rojo. La intensidad del oscurecimiento se
ajusta en `.hero-scrim`, dentro de `src/input.css`.

### Colores

`src/input.css`, bloque `@theme`. Cambiando `--color-ember*` cambia el acento de todo el
sitio. Si cambiás el rojo, verificá el contraste en
[webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/).

---

## 3. Pendientes antes de publicar

Estos son los datos que no tenía al construir el sitio. Están marcados con `TODO`
en el código:

| Pendiente | Dónde | Estado actual |
|---|---|---|
| **Email real del gimnasio** | `assets/js/main.js` → `CONFIG.email` | Placeholder `hola@satoshifitness.uy` |
| **Reseñas reales** | `assets/js/main.js` → `RESENAS` | 6 reseñas de ejemplo con nombres ficticios |
| **Grilla de horarios real** | `assets/js/main.js` → `IMPARES` / `PARES` / `HORARIOS` | Grilla propuesta dentro de las franjas reales (7–13 y 16–22, sábado 9–12) |
| **Dominio** | 6 líneas en `index.html`, marcadas `REEMPLAZAR-DOMINIO` | Sin definir — ver sección 4 |

Las fotos ya son todas reales del gimnasio (ver `assets/img/README.md`). El Instagram
`@satoshi_crossfit` sale del cartel de la fachada en la foto grupal; confirmá que sea
la cuenta vigente antes de publicar.

Las cifras de la sección de estadísticas (3 programaciones, 10 habilidades físicas,
6 días, 11 clases por día) salen del material que me diste y de la grilla de horarios;
no hay números inventados sobre socios ni años de trayectoria. Si querés mostrar esos
datos, se cambian en `index.html` (atributo `data-count`).

---

## 4. Cómo publicarlo

El sitio es HTML estático: anda en cualquier hosting.

**Netlify / Vercel / Cloudflare Pages (gratis y recomendado):** arrastrá la carpeta del
proyecto, ya compilada con `npm run build`. Se publica con HTTPS automático.

**Hosting compartido / cPanel:** subí por FTP `index.html` y la carpeta `assets/`
completa. No hace falta subir `node_modules/`, `src/` ni `package.json`.

### El dominio: hacelo en dos pasos, no en uno

Hoy no hay dominio definitivo — el plan es pushear a GitHub, deployar a Vercel o
Netlify con su URL temporal (algo como `satoshi-crossfit.vercel.app`) para mostrarle
el sitio a un posible cliente, y recién después conseguir un dominio propio. Eso está
bien: **el orden correcto es deployar primero y completar el dominio después**, nunca
al revés, porque ni Vercel ni Netlify asignan la URL hasta que el primer deploy ya
existe.

Hay 6 líneas en `index.html` que necesitan una URL absoluta — `canonical`, `og:url`,
`og:image` y tres campos del JSON-LD (`url`, `logo`, `image`). Los motores que generan
la vista previa al compartir un link (WhatsApp, Instagram, Facebook, LinkedIn) exigen
que esas URLs sean absolutas; una ruta relativa como `assets/img/og.jpg` no funciona
ahí, aunque en el sitio la imagen se vea perfecta. No hay forma de evitar este paso.

Las 6 líneas están marcadas con el placeholder `REEMPLAZAR-DOMINIO`, así que actualizarlas
es una sola búsqueda y reemplazo:

```bash
# después de deployar, con la URL que te haya dado Vercel/Netlify
sed -i 's#https://REEMPLAZAR-DOMINIO.com#https://satoshi-crossfit.vercel.app#g' index.html
```

En Windows con PowerShell:

```powershell
(Get-Content index.html) -replace 'https://REEMPLAZAR-DOMINIO\.com', 'https://satoshi-crossfit.vercel.app' | Set-Content index.html -Encoding utf8
```

**Vas a repetir este mismo paso una segunda vez** cuando pasen de la URL temporal al
dominio propio — no lo dejes como un pendiente indefinido, porque significa que
durante todo ese tiempo el sitio no genera vista previa al compartirse por WhatsApp,
que es el canal que más van a usar para difundirlo.

---

## 5. Decisiones de diseño

**Referencia visual.** De las tres imágenes que pasaste, la base es la segunda: negro
profundo, rojo fuego, tipografía condensada, tarjetas de vidrio sobre foto. De la
primera tomé la barra de contacto superior; de la tercera, la fila de estadísticas.

**Sello 聡 del encabezado.** El fondo del hero lleva el carácter japonés que está en
el cartel de la fachada del box, a gran escala y al 7% de opacidad. Reemplaza a un
"SATOSHI" contorneado que era el recurso genérico que usa todo el mundo: este carácter
es de ellos y ningún otro gimnasio de Montevideo puede usarlo.

Va como **trazado vectorial y no como texto**, así no depende de que el visitante tenga
instalada una fuente japonesa. El contorno se extrajo del glifo de Noto Sans JP, que es
SIL OFL y por lo tanto permite derivar y embeber. La ruta está inline en `index.html`;
el tamaño, color y opacidad se ajustan en `.hero-seal` dentro de `src/input.css`.

Se ubica en la pila de fondo **antes** del scrim, no después: así el mismo degradado que
protege la legibilidad del título también lo atenúa. En escritorio eso lo vuelve casi
invisible sobre la columna de texto y lo deja leerse en la mitad derecha, que es donde
no hay nada. Está oculto por debajo de 1024px, donde el hero ya es denso.

**Logo.** En el encabezado y el pie va el logo circular real. Lo acompaña un lockup
tipográfico ("SATOSHI / Friends & Fitness") porque a 44 px las palabras que están
adentro del círculo no se leen: a ese tamaño el logo funciona como símbolo, no como
texto. Es la práctica habitual con logos tipo insignia.

**Fotos.** El sitio usa siete fotos reales del gimnasio. La grupal de la fachada tiene
sección propia ("Friends & Fitness") en lugar de una galería de mosaico, porque es la
foto que mejor cuenta qué es el lugar y en un mosaico habría quedado recortada.

**Tipografía.** Barlow Condensed para títulos (condensada, atlética, muy legible en
mayúsculas grandes) y Barlow para texto corrido. Son de la misma familia, así que
combinan sin esfuerzo.

**Color.** Negro `#08080A` en lugar de negro puro: el negro absoluto produce arrastre
visual en pantallas OLED. El rojo tiene tres tonos con roles distintos — uno para
fondos de botón, uno para acentos y uno más claro para texto chico — para que siempre
haya contraste suficiente.

**Animación.** Todo se anima con `transform` y `opacity` únicamente, que el navegador
resuelve en la GPU. Nunca se anima el ancho, el alto ni la posición, que obligan a
recalcular el diseño y provocan tirones en celulares de gama media.

- Entrada del hero en cascada
- Aparición de secciones al hacer scroll, escalonada entre elementos hermanos
- Contadores numéricos
- Parallax suave en las fotos — **sólo en escritorio**
- Botón que sigue al cursor — **un solo botón en todo el sitio, sólo con mouse**
- Profundidad por puntero en "Quiénes somos" y "Friends & Fitness" — **sólo con mouse**
- Crossfade al cambiar de día en horarios (móvil)
- Marquee infinito en CSS puro
- Video de fondo en el encabezado, con control de pausa

**Horarios: dos componentes, un solo dato.** Por debajo de 1024 px la grilla se
convierte en un selector de día: pestañas Lun–Sáb con un solo día visible, abriendo en
el día actual (los domingos, cerrados, abre en lunes sin marcarlo como hoy). En
escritorio se mantiene la grilla de seis columnas, que ahí sí sirve para comparar días.

Esto bajó la sección de **4,88 a 1,77 pantallas de scroll** en 375 px, y la página
entera de 18,6 a 16,3. Era el bloque más largo del sitio y el más consultado: nadie lee
seis días de corrido, busca el suyo.

Como el mismo HTML se presenta de dos formas, la semántica ARIA sigue a lo que se ve:
los roles `tablist`/`tab`/`tabpanel` se ponen y se sacan desde JS según el breakpoint,
porque no se pueden condicionar por media query. Las pestañas llevan navegación con
flechas, Home y End, y tabindex móvil. El cambio de día interpola la altura del
contenedor para que el contenido de abajo no salte.

**Un solo botón magnético.** El efecto de seguir al cursor está en el CTA del hero y
en ningún otro. Se marca con `data-magnetic` en el HTML, no con la clase del botón,
para que quede explícito cuál es el elemento focal. El movimiento es jerarquía: si lo
tuvieran los siete botones primarios, ninguno destacaría, y el recurso quedaría como
un tic en vez de una intención. Los demás botones conservan su transición de color y
el `scale(0.975)` al presionar; en el magnético esa escala se aplica desde GSAP,
porque el `transform` inline que escribe pisaría la regla CSS.

**Profundidad por puntero.** Al mover el mouse dentro de "Quiénes somos" y
"Friends & Fitness" reaccionan tres capas a distinta velocidad: un foco ámbar que sigue
al cursor, la foto que se inclina hasta 4,5° en 3D, y el marco rojo que se desplaza 15 px
en paralaje. Las tres velocidades distintas son las que producen la sensación de
profundidad; con una sola capa se vería como un truco.

Se implementa con `gsap.quickTo`, que reutiliza el mismo tween en vez de crear uno nuevo
en cada evento del mouse. El efecto se aplica a elementos que no tienen ningún otro tween
encima — nunca a la foto, que ya lleva parallax de scroll, ni al contenedor que anima al
entrar — para que no compitan dos animaciones por la misma propiedad.

Sólo se activa con `(hover: hover) and (pointer: fine)`. En pantallas táctiles no existe
"mover el mouse" y el efecto quedaría trabado en el último punto tocado, así que ni
siquiera se registran los eventos.

**Sin JavaScript el sitio sigue funcionando.** GSAP se carga desde un CDN; si falla,
no queda nada oculto, porque las animaciones nunca esconden contenido desde el CSS.
La grilla de horarios y las reseñas sí necesitan JS: son datos generados. Si eso te
preocupa, se pueden pasar a HTML fijo.

---

## 6. Accesibilidad y rendimiento

Verificado sobre el sitio ya construido:

- **Contraste:** 0 fallos WCAG AA en todos los textos de la página, calculado con
  composición real de transparencias. Los pares principales van de 5,1:1 a 18,2:1.
- **Zonas táctiles:** mínimo 44 × 44 px en todo el sitio, verificado a 375 px.
- **Peso de las imágenes:** 385 KB entre las nueve, contra los 4 MB de los originales.
- **Teclado:** foco visible en todo elemento interactivo, enlace "saltar al contenido",
  y el menú móvil atrapa el foco y cierra con `Escape`.
- **Lectores de pantalla:** jerarquía de encabezados correcta, íconos SVG con
  `aria-hidden`, errores de formulario con `role="alert"`, filtros con `aria-pressed`.
- **`prefers-reduced-motion`:** si el usuario lo activa, se apagan todas las animaciones
  y todo el contenido queda visible.
- **Video de fondo:** no lleva `autoplay` en el HTML; lo arranca el JS sólo si el
  usuario no pidió menos movimiento ni está en modo de ahorro de datos. Tiene botón de
  pausa (WCAG 2.2.2) y se detiene solo cuando el encabezado sale de pantalla, salvo
  que lo hayas pausado a mano. Si el JS no corre, queda el póster.
- **Contraste sobre el video:** verificado fotograma por fotograma contra el 1% de
  píxeles más claros de cada franja de texto. Peor caso: 4,29:1 en móvil y 4,16:1 en
  escritorio para el título rojo (mínimo 3:1); 7,89:1 y 8,18:1 para el párrafo
  (mínimo 4,5:1).
- **Sello del hero:** cuesta 0,30 de contraste en el peor punto del título rojo
  (4,16:1 → 3,86:1, mínimo 3:1 para texto grande), medido fotograma por fotograma del
  video contra el percentil 99 de luminancia.
- **Foco por puntero:** en su punto más intenso sube la luminancia del fondo de 0,0025 a
  0,0119. El texto que queda encima baja de 18,2:1 a 15,4:1 (títulos), de 8,4:1 a 7,1:1
  (párrafos) y de 6,5:1 a 5,5:1 (etiquetas). Todo sigue sobre el mínimo AA.
- **Selector de día:** patrón ARIA de pestañas completo, con roles que se retiran en
  escritorio para no anunciar un tablist donde se ven los seis días a la vez.
- **Sin scroll horizontal** a 375 px ni en orientación apaisada.
- **Sin saltos de diseño:** todas las imágenes declaran `width` y `height`; las fuentes
  usan `display=swap`.
- **Carga diferida** en todas las imágenes fuera de la primera pantalla y en el mapa.

### Formulario de contacto

Envía por WhatsApp (arma el mensaje y abre el chat) con alternativa por email. No hay
backend, así que no hay nada que mantener ni que pueda caerse. Valida al salir de cada
campo, no en cada tecla, y al enviar lleva el foco al primer campo con error.

Si más adelante querés que los mensajes lleguen a una casilla de correo, se conecta a
[Web3Forms](https://web3forms.com) o [Formspree](https://formspree.io) cambiando sólo la
función `initForm` en `assets/js/main.js`.
