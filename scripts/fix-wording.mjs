// SiteSetting metin alanlarındaki "ciddi evlilik / ciddi ilişki" ifadelerini
// "anlaşmalı evlilik" konumlandırmasına çevirir. Yıkıcı değildir; yalnızca metin günceller.
// Çalıştırma: node scripts/fix-wording.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sıra önemli: önce uzun/özel kalıplar, sonra genel.
function fix(v) {
  if (!v) return v;
  let s = v;
  s = s.replace(/Ciddi İlişki, Mutlu Evlilik/g, "Anlaşmalı Evlilik Platformu");
  s = s.replace(/Ciddi düşünen/g, "Anlaşmalı evlilik düşünen");
  s = s.replace(/ciddi ilişki ve evlilik düşünen/gi, "anlaşmalı evlilik düşünen");
  s = s.replace(/ciddi ilişki ve evlilik/gi, "anlaşmalı evlilik");
  s = s.replace(/ciddi evlilik ve ilişki/gi, "anlaşmalı evlilik");
  s = s.replace(/ciddi ilişki/gi, "anlaşmalı evlilik");
  s = s.replace(/ciddi evlilik/gi, "anlaşmalı evlilik");
  // Kalan tekil "ciddi" -> "anlaşmalı evlilik" yerine bağlama uygun düşmeyebilir;
  // yine de kullanıcı isteği gereği hiç "ciddi" kalmasın:
  s = s.replace(/\bciddi\b/gi, (m) =>
    m[0] === "C" ? "Anlaşmalı evlilik" : "anlaşmalı evlilik"
  );
  return s;
}

const TEXT_FIELDS = [
  "tagline",
  "heroTitle",
  "heroSubtitle",
  "aboutText",
  "contactText",
  "termsText",
  "privacyText",
  "disclaimerText",
  "faqJson",
];

async function main() {
  const s = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  if (!s) {
    console.log("SiteSetting yok — değişiklik gerekmiyor.");
    return;
  }
  const data = {};
  for (const f of TEXT_FIELDS) {
    const nv = fix(s[f]);
    if (nv !== s[f]) {
      data[f] = nv;
      console.log(`  ✓ ${f} güncellendi`);
    }
  }
  if (Object.keys(data).length === 0) {
    console.log("Düzeltilecek 'ciddi' ifadesi bulunamadı.");
  } else {
    await prisma.siteSetting.update({ where: { id: "singleton" }, data });
    console.log(`\n${Object.keys(data).length} alan güncellendi.`);
  }

  // Doğrulama
  const after = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  const leftover = TEXT_FIELDS.filter((f) => after[f] && /ciddi/i.test(after[f]));
  console.log(
    leftover.length
      ? `⚠️ Hâlâ 'ciddi' içeren alanlar: ${leftover.join(", ")}`
      : "✅ Hiçbir alanda 'ciddi' kalmadı."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
