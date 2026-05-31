import type { MetadataRoute } from "next";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://simulacao-estrategica-decisao.vercel.app",
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
