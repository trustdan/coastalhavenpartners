import { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/utils"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/privacy",
    "/terms",
    "/login",
    "/signup",
    "/signup/candidate",
    "/signup/recruiter",
  ].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date().toISOString().split("T")[0],
  }))

  return [...routes]
}

