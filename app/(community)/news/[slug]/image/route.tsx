import { ImageResponse } from "next/og"
import { findCommunityArticle } from "@/lib/community-data"
import type { CommunityArticle } from "@/lib/community-data"

type RouteContext = {
  params: Promise<{ slug: string }>
}

function GenericNewsImage() {
  return (
    <div
      style={{
        alignItems: "stretch",
        background: "#f8fafc",
        color: "#0f172a",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "64px",
        width: "100%"
      }}
    >
      <div
        style={{
          background: "#1c6ee8",
          borderRadius: "12px",
          color: "white",
          display: "flex",
          fontSize: "28px",
          fontWeight: 800,
          padding: "16px 22px",
          width: "fit-content"
        }}
      >
        FreeJobData Community
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
        <div style={{ color: "#1c6ee8", display: "flex", fontSize: "28px", fontWeight: 800 }}>
          Signed-in job market notes
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "70px",
            fontWeight: 900,
            letterSpacing: "0",
            lineHeight: 1.02,
            maxWidth: "1050px"
          }}
        >
          FreeJobData community article
        </div>
        <div style={{ color: "#334155", display: "flex", fontSize: "32px", lineHeight: 1.3, maxWidth: "980px" }}>
          Sign in to view community articles, source links, and current job-market headlines.
        </div>
      </div>
      <div
        style={{
          borderTop: "2px solid #dbe3ef",
          color: "#475569",
          display: "flex",
          fontSize: "26px",
          fontWeight: 700,
          paddingTop: "28px"
        }}
      >
        freejobdata.com/community
      </div>
    </div>
  )
}

function isPublicTeamArticle(article: CommunityArticle | undefined): article is CommunityArticle {
  return Boolean(article?.type === "team" && article.body?.length)
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params
  const article = findCommunityArticle(slug)

  return new ImageResponse(
    isPublicTeamArticle(article) ? (
      <div
        style={{
          alignItems: "stretch",
          background: "#f8fafc",
          color: "#0f172a",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "64px",
          width: "100%"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <div
            style={{
              background: "#1c6ee8",
              borderRadius: "12px",
              color: "white",
              display: "flex",
              fontSize: "28px",
              fontWeight: 800,
              padding: "16px 22px"
            }}
          >
            FreeJobData Team
          </div>
          <div style={{ color: "#475569", display: "flex", fontSize: "26px", fontWeight: 700 }}>
            {article.publishedAt}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
          <div style={{ color: "#1c6ee8", display: "flex", fontSize: "28px", fontWeight: 800 }}>
            {article.industry}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "70px",
              fontWeight: 900,
              letterSpacing: "0",
              lineHeight: 1.02,
              maxWidth: "1050px"
            }}
          >
            {article.title}
          </div>
          <div style={{ color: "#334155", display: "flex", fontSize: "32px", lineHeight: 1.3, maxWidth: "980px" }}>
            {article.summary}
          </div>
        </div>
        <div
          style={{
            borderTop: "2px solid #dbe3ef",
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "28px"
          }}
        >
          <div style={{ color: "#475569", display: "flex", fontSize: "26px", fontWeight: 700 }}>
            freejobdata.com/news
          </div>
          <div style={{ color: "#0f172a", display: "flex", fontSize: "26px", fontWeight: 800 }}>
            {article.sourceCount} cited sources
          </div>
        </div>
      </div>
    ) : (
      <GenericNewsImage />
    ),
    {
      height: 630,
      width: 1200
    }
  )
}
