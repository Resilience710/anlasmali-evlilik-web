"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import { rateLimitByIp } from "@/lib/rate-limit";

export type ContactState = { error?: string; success?: string };

export async function contactAction(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  // Spam koruması: IP başına saatte 5 mesaj
  if (!(await rateLimitByIp("contact", 5, 60 * 60))) {
    return {
      error: "Çok fazla mesaj gönderdiniz. Lütfen biraz sonra tekrar deneyin.",
    };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: "Lütfen tüm alanları doğru doldurun." };
  }

  // Yöneticilere bildirim olarak iletilir (e-posta altyapısı yoksa)
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deletedAt: null },
    select: { id: true },
  });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: "SYSTEM",
        title: `İletişim: ${parsed.data.subject}`,
        body: `${parsed.data.name} (${parsed.data.email}): ${parsed.data.message.slice(0, 120)}`,
        linkUrl: "/admin",
      })),
    });
  }

  return { success: "Mesajınız alındı. En kısa sürede dönüş yapacağız." };
}
