import Link from "next/link"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Community",
  description:
    "Join the open job data community around the US job data pool—news, press, methodology, and ways to contribute.",
  path: "/community"
})

const communityLinks = [
  {
    label: "News & updates",
    href: "/news",
    detail: "Product notes and labor market commentary from FreeJobData."
  },
  {
    label: "Press & citations",
    href: "/press",
    detail: "How journalists and researchers should attribute FreeJobData and JobDataPool."
  },
  {
    label: "Methodology",
    href: "/methodology",
    detail: "How listings become metrics, entity pages, and public reports."
  },
  {
    label: "About",
    href: "/about",
    detail: "Mission and relationship to the US Job Data Pool ecosystem."
  },
  {
    label: "Reports",
    href: "/reports",
    detail: "Readable hiring stories built on open pool data."
  },
  {
    label: "JobDataPool API",
    href: "https://jobdatapool.com/api",
    detail: "Programmatic access for builders integrating pool data.",
    external: true
  }
]

export default function CommunityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Community", path: "/community" }
        ]}
      />
      <section className="hero">
        <p className="eyebrow">Community hub</p>
        <h1>Social hub around the US job data pool.</h1>
        <p className="lede">
          FreeJobData is the public layer for researchers, journalists, and builders working with open job listings.
          Start here for news, attribution guidance, and paths into the wider Job Pool ecosystem.
        </p>
      </section>

      <section className="section grid">
        {communityLinks.map((item) =>
          item.external ? (
            <a className="card" href={item.href} key={item.href} rel="noopener noreferrer">
              <span className="pill">External</span>
              <h3>{item.label}</h3>
              <p className="muted">{item.detail}</p>
            </a>
          ) : (
            <Link className="card" href={item.href} key={item.href}>
              <span className="pill">On-site</span>
              <h3>{item.label}</h3>
              <p className="muted">{item.detail}</p>
            </Link>
          )
        )}
      </section>

      <section className="section">
        <h2>Contribute</h2>
        <p className="lede">
          Share feedback on dataset coverage, request new report topics, or integrate via JobDataPool. Open source job
          data improves when the community documents methodology and cites provenance.
        </p>
        <div className="pill-row">
          <a className="button" href="https://jobdatapool.com">
            JobDataPool home
          </a>
          <Link className="button secondary" href="/datasets">
            Browse datasets
          </Link>
        </div>
      </section>
    </>
  )
}
