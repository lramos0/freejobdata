import Link from "next/link"
import { buildMetadata } from "@/lib/seo"
import { communityArticles } from "@/lib/community-data"

export const metadata = buildMetadata({
  title: "Job Market News",
  description: "Latest FreeJobData notes and job market analysis powered by JobDataPool.",
  path: "/news"
})

export default function NewsPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">News</p>
        <h1>Latest job market notes.</h1>
        <p className="lede">Short research updates, dataset announcements, and labor market signal notes from FreeJobData.</p>
      </section>
      <section className="section grid">
        {communityArticles.map((article) => (
          <Link className="card" href={`/news/${article.id}`} key={article.id}>
            <span className="pill">{article.author} · {article.publishedAt}</span>
            <h3>{article.title}</h3>
            <p className="muted">{article.summary}</p>
            <span className="muted">{article.sources?.length ? `${article.sourceCount} cited sources` : `${article.sourceCount} corroborating postings`}</span>
          </Link>
        ))}
      </section>
    </>
  )
}
