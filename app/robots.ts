import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/#*"],
        disallow: ["/admin/", "/instrument", "/change-password", "/register", "/maintenance"],
      },
    ],
    sitemap: "https://sosagro4c.vercel.app/sitemap.xml",
  };
}
