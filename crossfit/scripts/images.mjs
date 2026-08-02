/* ==========================================================================
   Prepara las fotos reales del gimnasio para la web.
   --------------------------------------------------------------------------
   Lee los originales de assets/img/originales/ y escribe versiones
   optimizadas en assets/img/. Los originales nunca se tocan.

   Uso:  npm run images
   ========================================================================== */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const ORIG = "assets/img/originales";
const OUT = "assets/img";

/* Cada entrada define el recorte que necesita la foto.
   `crop` está en píxeles del original. Si falta, se usa la foto entera. */
const TAREAS = [
  {
    src: "00.png",
    out: "logo.png",
    formato: "png",
    nota: "Logo oficial. Se mantiene PNG por la transparencia.",
  },
  {
    src: "01.png",
    out: "comunidad.webp",
    nota: "Foto grupal en la puerta del box. Se usa entera: la gente llega hasta los bordes.",
  },
  {
    src: "02.png",
    out: "hero.webp",
    nota: "Detalle de disco y championes. Fondo del encabezado y del cierre.",
  },
  {
    src: "03.png",
    out: "coach.webp",
    crop: { left: 140, top: 0, width: 732, height: 549 },
    nota: "Coach corrigiendo en anillas. El recorte 4:3 arranca en 140 para no perder las anillas, que son las que dan contexto.",
  },
  {
    src: "05.png",
    out: "prog-standard.webp",
    crop: { left: 0, top: 280, width: 455, height: 341 },
    nota: "Recorta el título quemado de arriba. Queda el overhead lunge.",
  },
  {
    src: "04.png",
    out: "prog-fit.webp",
    crop: { left: 0, top: 400, width: 455, height: 341 },
    nota: "Recorta el título quemado. Queda la sentadilla con kettlebell.",
  },
  {
    src: "06.png",
    out: "prog-hibrida.webp",
    crop: { left: 0, top: 280, width: 456, height: 342 },
    nota: "Recorta el título quemado. Queda el wall ball y el cajón.",
  },
];

await mkdir(OUT, { recursive: true });

/* --- Derivados especiales ------------------------------------------------
   No siguen el patrón de recorte, así que se generan aparte. */
async function derivados() {
  // Vista previa al compartir en WhatsApp y redes. Tiene que ser JPEG:
  // el soporte de WebP en las previsualizaciones todavía es irregular.
  const og = await sharp(`${ORIG}/01.png`)
    .resize(1200, 630, { fit: "cover", position: "top" })
    .flatten({ background: "#08080a" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(`${OUT}/og.jpg`);
  console.log(`01.png → og.jpg  ${og.width}×${og.height}  ${(og.size / 1024).toFixed(0)} KB`);

  // Ícono para "agregar a pantalla de inicio" en iOS. Se compone sobre el
  // fondo del sitio porque iOS no respeta la transparencia.
  const icon = await sharp(`${ORIG}/00.png`)
    .resize(160, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 10, bottom: 10, left: 10, right: 10, background: "#08080a" })
    .flatten({ background: "#08080a" })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/apple-touch-icon.png`);
  console.log(
    `00.png → apple-touch-icon.png  ${icon.width}×${icon.height}  ${(icon.size / 1024).toFixed(0)} KB`
  );
}

for (const t of TAREAS) {
  let img = sharp(`${ORIG}/${t.src}`);
  if (t.crop) img = img.extract(t.crop);

  img =
    t.formato === "png"
      ? img.png({ compressionLevel: 9, palette: true })
      : img.flatten({ background: "#08080a" }).webp({ quality: 82, effort: 5 });

  const info = await img.toFile(`${OUT}/${t.out}`);
  const kb = (info.size / 1024).toFixed(0);
  console.log(`${t.src} → ${t.out}  ${info.width}×${info.height}  ${kb} KB`);
}

await derivados();

console.log("\nListo. Recordá correr `npm run build` si además cambiaste clases del HTML.");
