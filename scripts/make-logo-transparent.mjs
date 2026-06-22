// sari.jpeg (siyah arka planlı logo) -> public/logo.png (şeffaf alfa kanallı PNG)
// Siyah arka planı transparan yapar; kenarlarda yumuşak geçiş + koyu halo temizliği (unpremultiply).
// Çalıştırma: node scripts/make-logo-transparent.mjs [kaynak.jpeg]
import sharp from "sharp";
import path from "node:path";

const SRC = process.argv[2] || "C:/Users/Direncinho/Downloads/sari.jpeg";
const OUT = path.resolve("public/logo.png");

const T_LOW = 40; // bunun altı tamamen şeffaf (arka plan + JPEG gürültüsü)
const T_HIGH = 110; // bunun üstü tamamen opak (parlak metin/amblem)

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let transparent = 0;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const m = Math.max(r, g, b);
  let a;
  if (m <= T_LOW) a = 0;
  else if (m >= T_HIGH) a = 255;
  else a = Math.round(((m - T_LOW) / (T_HIGH - T_LOW)) * 255);
  data[i + 3] = a;
  if (a === 0) {
    transparent++;
  } else if (a < 255) {
    // unpremultiply: "renk siyah üzerine" -> düz alfa (koyu kenar halosunu giderir)
    const a01 = a / 255;
    data[i] = Math.min(255, Math.round(r / a01));
    data[i + 1] = Math.min(255, Math.round(g / a01));
    data[i + 2] = Math.min(255, Math.round(b / a01));
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(OUT);

const pct = ((transparent / (info.width * info.height)) * 100).toFixed(1);
console.log(`✓ ${OUT} (${info.width}x${info.height}) — %${pct} piksel şeffaf yapıldı`);
