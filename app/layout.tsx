import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import { OrganizationJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://freejobdata.com"),
  title: {
    default: "FreeJobData | Free Job Market Data, Reports, and Hiring Trends",
    template: "%s | FreeJobData"
  },
  description:
    "FreeJobData publishes free job market datasets, hiring reports, and labor market intelligence powered by JobDataPool.",
  alternates: {
    canonical: "/"
  }
}

const navItems = [
  ["Reports", "/reports"],
  ["Datasets", "/datasets"],
  ["Companies", "/companies"],
  ["Jobs", "/jobs"],
  ["Locations", "/locations"],
  ["Methodology", "/methodology"]
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OrganizationJsonLd />
        <div className="site-shell">
          <header className="nav">
            <Link className="brand" href="/">
              FreeJobData
            </Link>
            <nav className="nav-links" aria-label="Primary navigation">
              {navItems.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
              <a href="https://jobdatapool.com/api">JobDataPool API</a>
            </nav>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">
            <strong>Data powered by JobDataPool.</strong>
            <div className="footer-links">
              <Link href="/about">About</Link>
              <Link href="/press">Press</Link>
              <Link href="/api">API</Link>
              <Link href="/methodology">Methodology</Link>
              <a href="https://jobdatapool.com">JobDataPool</a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
