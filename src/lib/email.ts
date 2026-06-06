// E-posta gönderimi (Brevo). BREVO_API_KEY varsa gerçek e-posta gönderir;
// yoksa (geliştirme) sadece konsola yazar ve doğrulama "kapalı" sayılır.

export function emailVerificationEnabled(): boolean {
  return !!process.env.BREVO_API_KEY;
}

function parseFrom(from: string): { name: string; email: string } {
  const m = from.match(/^(.*)<(.+)>$/);
  if (m) return { name: m[1].trim().replace(/"/g, ""), email: m[2].trim() };
  return { name: "anlaşmalievlilik.com", email: from.trim() };
}

async function sendEmail(to: string, subject: string, html: string) {
  const from =
    process.env.EMAIL_FROM || "anlaşmalievlilik.com <noreply@anlasmalievlilik.net>";

  // Brevo
  if (process.env.BREVO_API_KEY) {
    const sender = parseFrom(from);
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`E-posta gönderilemedi (Brevo): ${t}`);
    }
    return res.json();
  }

  // Anahtar yok -> geliştirme: sadece logla
  console.log(`[DEV E-POSTA] Alıcı: ${to} | Konu: ${subject}`);
  return { dev: true };
}

export async function sendVerificationEmail(to: string, link: string) {
  const html = `
  <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#f4f4f4;padding:32px">
    <div style="max-width:480px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:28px">
      <h1 style="margin:0 0 8px;font-size:20px">E-postanızı doğrulayın</h1>
      <p style="color:#9a9a9a;line-height:1.6">
        anlaşmalievlilik.com'a hoş geldiniz! Hesabınızı etkinleştirmek için
        aşağıdaki butona tıklayın.
      </p>
      <a href="${link}" style="display:inline-block;margin:18px 0;background:#f97316;color:#fff;
        text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">
        E-postamı Doğrula
      </a>
      <p style="color:#777;font-size:12px;line-height:1.6">
        Buton çalışmazsa bu bağlantıyı tarayıcınıza yapıştırın:<br/>
        <span style="color:#f97316">${link}</span><br/><br/>
        Bu işlemi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.
      </p>
    </div>
  </div>`;
  return sendEmail(to, "E-postanızı doğrulayın — anlaşmalievlilik.com", html);
}

export async function sendPasswordResetEmail(to: string, link: string) {
  const html = `
  <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#f4f4f4;padding:32px">
    <div style="max-width:480px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:28px">
      <h1 style="margin:0 0 8px;font-size:20px">Parolanızı sıfırlayın</h1>
      <p style="color:#9a9a9a;line-height:1.6">
        Hesabınız için parola sıfırlama talebi aldık. Yeni parola belirlemek için
        aşağıdaki butona tıklayın. Bu bağlantı 1 saat geçerlidir.
      </p>
      <a href="${link}" style="display:inline-block;margin:18px 0;background:#f97316;color:#fff;
        text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">
        Parolamı Sıfırla
      </a>
      <p style="color:#777;font-size:12px;line-height:1.6">
        Buton çalışmazsa bu bağlantıyı tarayıcınıza yapıştırın:<br/>
        <span style="color:#f97316">${link}</span><br/><br/>
        Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz; parolanız değişmez.
      </p>
    </div>
  </div>`;
  return sendEmail(to, "Parolanızı sıfırlayın — anlaşmalievlilik.com", html);
}
