import type { MetadataRoute } from "next";
import { DEFAULT_SEO_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Anlaşmalı Evlilik Platformu`,
    short_name: "AnlaşmalıEvlilik",
    description: DEFAULT_SEO_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    lang: "tr",
    categories: ["social", "lifestyle"],
  };
}
