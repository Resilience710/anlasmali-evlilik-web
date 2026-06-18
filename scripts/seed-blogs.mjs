// scripts/blogs.json içindeki blog yazılarını veritabanına yükler (slug'a göre upsert).
// Mevcut yazıların içeriğini günceller, yoksa oluşturur. Diğer verilere dokunmaz.
// Çalıştırma: node scripts/seed-blogs.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const posts = JSON.parse(
  fs.readFileSync(path.join(__dirname, "blogs.json"), "utf8")
);

async function main() {
  let created = 0;
  let updated = 0;
  for (const p of posts) {
    const data = {
      title: p.title,
      metaTitle: p.metaTitle || null,
      metaDescription: p.metaDescription || null,
      excerpt: p.excerpt || null,
      keyword: p.keyword || null,
      content: p.content,
      order: p.order ?? 0,
      published: true,
    };
    const existing = await prisma.blogPost.findUnique({
      where: { slug: p.slug },
      select: { id: true },
    });
    if (existing) {
      await prisma.blogPost.update({ where: { slug: p.slug }, data });
      updated++;
    } else {
      await prisma.blogPost.create({ data: { slug: p.slug, ...data } });
      created++;
    }
    console.log(`  ✓ ${p.slug}`);
  }
  const total = await prisma.blogPost.count();
  console.log(`\nBitti. ${created} eklendi, ${updated} güncellendi. Toplam: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
