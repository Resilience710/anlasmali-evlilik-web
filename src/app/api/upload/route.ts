import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveImage, validateImage } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
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

  const err = validateImage(file);
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
