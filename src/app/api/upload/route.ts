import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveImage, validateImage } from "@/lib/storage";
import { isSameOrigin } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  // Kullanıcı başına yükleme limiti (Cloudinary/disk maliyeti koruması)
  if (!(await checkRateLimit(`upload:${session.user.id}`, 30, 60 * 60)).ok) {
    return NextResponse.json(
      { error: "Çok fazla yükleme. Lütfen biraz sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  const err = await validateImage(file);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  try {
    const url = await saveImage(file);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "Yükleme başarısız oldu." },
      { status: 500 }
    );
  }
}
