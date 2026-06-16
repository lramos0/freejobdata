import { NewsIndexGate } from "@/components/community/NewsGate"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Job Market News",
  description: "Signed-in FreeJobData community notes and job market analysis powered by JobDataPool.",
  path: "/news"
})

export default function NewsPage() {
  return <NewsIndexGate />
}
