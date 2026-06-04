import type { Metadata } from "next"
import Link from "next/link"
import "maplibre-gl/dist/maplibre-gl.css"
import "./globals.css"
import "./forum-port.css"
import { OrganizationJsonLd, SiteNavigationJsonLd, WebSiteJsonLd } from "@/components/JsonLd"
import { SiteHubNav } from "@/components/SiteHubNav"
import { siteDescription, siteTitle } from "@/lib/seo"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://freejobdata.com"),
  title: {
    default: siteTitle,
    template: "%s | FreeJobData"
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: "FreeJobData",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription
  },
  alternates: {
    canonical: "/"
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <SiteNavigationJsonLd />
        <div className="site-shell">
          <header className="nav">
            <Link className="brand" href="/">
              FreeJobData
            </Link>
            <div className="nav-cluster">
              <SiteHubNav />
              <nav className="nav-links" aria-label="Secondary navigation">
                <Link href="/maps">Maps</Link>
                <a href="https://jobdatapool.com/api">JobDataPool API</a>
              </nav>
            </div>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">
            <strong>Data powered by JobDataPool.</strong>
            <div className="footer-links">
              <Link href="/datasets">Datasets</Link>
              <Link href="/metrics">Metrics</Link>
              <Link href="/community">Community</Link>
              <Link href="/maps">Maps</Link>
              <Link href="/about">About</Link>
              <Link href="/press">Press</Link>
              <Link href="/api">API</Link>
              <a href="https://jobdatapool.com">JobDataPool</a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
