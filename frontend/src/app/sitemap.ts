import type { MetadataRoute } from "next";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://simulacao-estrategica-decisao.vercel.app",
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl.toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
