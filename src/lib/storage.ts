import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return "Yalnızca JPEG, PNG veya WebP yükleyebilirsiniz.";
  }
  if (file.size > MAX_BYTES) {
    return "Dosya boyutu en fazla 5MB olabilir.";
  }
  return null;
}

/** Yerel geliştirme sürücüsü: public/uploads altına yazar. */
async function saveLocal(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

/**
 * Görseli kaydeder ve genel URL döndürür.
 * IMAGE_DRIVER=cloudinary olduğunda Cloudinary'ye yüklenir (anahtarlar gerekli),
 * aksi halde yerel sürücü kullanılır.
 */
export async function saveImage(file: File): Promise<string> {
  if (
    process.env.IMAGE_DRIVER === "cloudinary" &&
    process.env.CLOUDINARY_CLOUD_NAME
  ) {
    return saveCloudinary(file);
  }
  return saveLocal(file);
}

async function saveCloudinary(file: File): Promise<string> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "anlasmali-evlilik";

  // İmza: SHA-1(folder=...&timestamp=...{apiSecret})
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const { createHash } = await import("crypto");
  const signature = createHash("sha1").update(toSign).digest("hex");

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("folder", folder);
  body.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    { method: "POST", body }
  );
  if (!res.ok) {
    throw new Error("Cloudinary yükleme başarısız oldu.");
  }
  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
