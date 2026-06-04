import { CommunityHub } from "@/components/community/CommunityHub"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Community Intelligence Platform",
  description:
    "Explore FreeJobData community articles, automated team briefings, and a Deck.gl GIS map of job posting locations.",
  path: "/community"
})

export default function CommunityPage() {
  return <CommunityHub />
}
