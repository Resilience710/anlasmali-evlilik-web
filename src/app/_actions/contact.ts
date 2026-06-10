"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import { rateLimitByIp } from "@/lib/rate-limit";

export type ContactState = { error?: string; success?: string };

// İletişim formu mesajlarının iletileceği e-posta (varsayılan dsenkos@gmail.com).
// İstenirse ortam değişkeniyle CONTACT_TO ile değiştirilebilir.
const CONTACT_TO = process.env.CONTACT_TO || "dsenkos@gmail.com";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendContactEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!process.env.BREVO_API_KEY) {
    console.log(
      `[DEV CONTACT] -> ${CONTACT_TO} | ${input.name} <${input.email}> | ${input.subject}`
    );
    return;
  }
  const from =
    process.env.EMAIL_FROM ||
    "anlaşmalievlilik.net <noreply@anlasmalievlilik.net>";
  const m = from.match(/^(.*)<(.+)>$/);
  const sender = m
    ? { name: m[1].trim().replace(/"/g, ""), email: m[2].trim() }
    : { name: "anlaşmalievlilik.net", email: from.trim() };

  const html = `
  <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#f4f4f4;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:22px">
      <h2 style="margin:0 0 10px;font-size:18px">Yeni İletişim Mesajı</h2>
      <p style="margin:6px 0;color:#aaa"><strong>Ad:</strong> ${escapeHtml(input.name)}</p>
      <p style="margin:6px 0;color:#aaa"><strong>E-posta:</strong> ${escapeHtml(input.email)}</p>
      <p style="margin:6px 0;color:#aaa"><strong>Konu:</strong> ${escapeHtml(input.subject)}</p>
      <div style="margin-top:12px;padding:12px;background:#0a0a0a;border-radius:8px;white-space:pre-wrap;color:#eee">${escapeHtml(input.message)}</div>
    </div>
  </div>`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: CONTACT_TO }],
      replyTo: { email: input.email, name: input.name },
      subject: `[İletişim] ${input.subject}`,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Brevo iletişim e-postası gönderilemedi: ${txt}`);
  }
}

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

  // 1) Hedef e-posta adresine Brevo ile gerçek mail gönder
  try {
    await sendContactEmail(parsed.data);
  } catch (e) {
    console.error("contactAction email error:", e);
    // Mail gönderilemese bile admin paneli bildirimini deneyelim — kullanıcı
    // tarafı için yine başarılı dönüyoruz; admin not'tan da takip edilebilir.
  }

  // 2) Yöneticilere panel bildirimi (yedek)
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
