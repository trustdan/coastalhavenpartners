import { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/utils"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/candidate/",
        "/recruiter/",
        "/school/",
        "/admin/",
        "/complete-profile/",
        "/verify-email",
        "/mfa-verify",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}

