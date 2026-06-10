// Sahte/demo verileri ÖNİZLEME (silmez). Seed.ts'in eklediği örnek üyeler
// (@ornek.com), demo ilanlar, mesajlar, bildirimler vb. listelenir.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const demoUsers = await prisma.user.findMany({
  where: { email: { endsWith: "@ornek.com" } },
  select: {
    id: true,
    email: true,
    _count: {
      select: {
        listings: true,
        sentMessages: true,
        notifications: true,
        favorites: true,
        reportsMade: true,
      },
    },
  },
});
const demoUserIds = demoUsers.map((u) => u.id);

const [listings, conversations, messages, favorites, notifications, reports] =
  await Promise.all([
    prisma.listing.count({ where: { authorId: { in: demoUserIds } } }),
    prisma.conversation.count({
      where: {
        OR: [
          { userAId: { in: demoUserIds } },
          { userBId: { in: demoUserIds } },
        ],
      },
    }),
    prisma.message.count({ where: { senderId: { in: demoUserIds } } }),
    prisma.favorite.count({ where: { userId: { in: demoUserIds } } }),
    prisma.notification.count(),
    prisma.report.count({ where: { reporterId: { in: demoUserIds } } }),
  ]);

// Korunacaklar
const [admins, settings, categories, cities, ageOptions, otherUsers] =
  await Promise.all([
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.siteSetting.count(),
    prisma.category.count(),
    prisma.city.count(),
    prisma.ageOption.count(),
    prisma.user.count({
      where: { email: { not: { endsWith: "@ornek.com" } } },
    }),
  ]);

console.log("\n========= ÖNİZLEME (henüz silinmedi) =========\n");
console.log("SİLİNECEK demo kullanıcılar (@ornek.com):", demoUsers.length);
demoUsers.forEach((u) =>
  console.log(
    `   - ${u.email}  (${u._count.listings} ilan, ${u._count.sentMessages} mesaj)`
  )
);
console.log(`\nCASCADE silinecekler:`);
console.log(`   İlan:        ${listings}`);
console.log(`   Konuşma:     ${conversations}`);
console.log(`   Mesaj:       ${messages}`);
console.log(`   Favori:      ${favorites}`);
console.log(`   Şikayet:     ${reports}`);
console.log(`\nTÜM bildirimler ayrıca silinecek: ${notifications}`);
console.log(`   ("Onay bekleyen ilan", "Yeni mesajınız var" vb.)`);

console.log(`\n--- KORUNACAK ---`);
console.log(`   Admin kullanıcısı:       ${admins}`);
console.log(`   Site ayarları:           ${settings}`);
console.log(`   Kategoriler:             ${categories}`);
console.log(`   Şehirler (81 il):        ${cities}`);
console.log(`   Yaş seçenekleri:         ${ageOptions}`);
console.log(`   Diğer gerçek kullanıcı:  ${otherUsers - admins} (admin hariç)`);

await prisma.$disconnect();
