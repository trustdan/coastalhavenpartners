import process from "process"
import { Metadata } from "next"
import clsx, { ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export function constructMetadata({
  title = "Coastal Haven Capital | Private Equity",
  description = "A private equity firm investing in exceptional lower middle-market companies. Join our team as a deal sourcing intern.",
  image = absoluteUrl("/opengraph-image"),
  canonicalPath,
  ...props
}: {
  title?: string
  description?: string
  image?: string
  canonicalPath?: string
  [key: string]: Metadata[keyof Metadata]
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://coastalhavencapital.com"

  return {
    title,
    description,
    keywords: [
      "private equity",
      "PE internship",
      "deal sourcing",
      "investment internship",
      "private equity careers",
      "finance internship",
      "lower middle market",
      "PE analyst",
      "investment analyst",
      "deal origination",
    ],
    authors: [{ name: "Coastal Haven Capital" }],
    creator: "Coastal Haven Capital",
    publisher: "Coastal Haven Capital",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Coastal Haven Capital",
      locale: "en_US",
      url: canonicalPath ? absoluteUrl(canonicalPath) : baseUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@coastalhavencap",
    },
    icons: "/favicon.ico",
    metadataBase: new URL(baseUrl),
    ...(canonicalPath && {
      alternates: {
        canonical: canonicalPath,
      },
    }),
    ...props,
  }
}
