import { ImageResponse } from "next/og";
import { DEFAULT_SEO_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const alt = `${SITE_NAME} ciddi evlilik platformu`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#11100f",
          color: "#fff7ed",
          padding: 72,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              background: "#f97316",
              color: "#11100f",
            }}
          >
            AE
          </div>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              maxWidth: 930,
              fontSize: 70,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            Anlaşmalı Evlilik ve Ciddi Evlilik Sitesi
          </div>
          <div
            style={{
              maxWidth: 880,
              color: "#fed7aa",
              fontSize: 30,
              lineHeight: 1.35,
            }}
          >
            {DEFAULT_SEO_DESCRIPTION}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            color: "#fdba74",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          <span>Gerçek profiller</span>
          <span>•</span>
          <span>Güvenli mesajlaşma</span>
          <span>•</span>
          <span>Türkiye geneli ilanlar</span>
        </div>
      </div>
    ),
    size
  );
}

