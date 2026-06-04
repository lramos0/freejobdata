import Link from "next/link"
import { SITE_SITELINKS } from "@/lib/site-hubs"

export function SiteHubNav() {
  return (
    <nav className="nav-sitelinks" aria-label="Primary site sections">
      {SITE_SITELINKS.map((hub) => (
        <Link key={hub.path} href={hub.path}>
          {hub.label}
        </Link>
      ))}
    </nav>
  )
}

export function SiteHubCards() {
  return (
    <section className="section grid site-hub-cards" aria-label="Explore FreeJobData">
      {SITE_SITELINKS.map((hub) => (
        <Link className="card" href={hub.path} key={hub.path}>
          <span className="pill">{hub.label}</span>
          <h3>{hub.label}</h3>
          <p className="muted">{hub.description}</p>
        </Link>
      ))}
    </section>
  )
}
