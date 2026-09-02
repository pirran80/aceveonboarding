import type { MetadataRoute } from "next";

// The portal has no login yet (STATUS.md Q2) — nothing here may be indexed.
// Belt and braces with the robots metadata in layout.tsx (feedback P1-3).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
