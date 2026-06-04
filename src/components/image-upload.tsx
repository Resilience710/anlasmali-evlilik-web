"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { initials } from "@/lib/utils";

export function ImageUpload({
  name,
  defaultUrl,
  label = "Fotoğraf",
  fallbackText = "",
  rounded = "full",
}: {
  name: string;
  defaultUrl?: string | null;
  label?: string;
  fallbackText?: string;
  rounded?: "full" | "lg";
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız.");
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <input type="hidden" name={name} value={url} />
      <div
        className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-border bg-elevated ${
          rounded === "full" ? "rounded-full" : "rounded-xl"
        }`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-medium text-muted-foreground">
            {fallbackText ? initials(fallbackText) : <Upload className="size-6" />}
          </span>
        )}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="size-5 animate-spin text-white" />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-elevated disabled:opacity-50 cursor-pointer"
          >
            <Upload className="size-4" />
            {label} Yükle
          </button>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <X className="size-4" />
              Kaldır
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPEG/PNG/WebP, en fazla 5MB.</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
