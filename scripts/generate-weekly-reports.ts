import { reports } from "../lib/data"

function main() {
  const weeklyReports = reports.filter((report) => report.reportType === "weekly")

  console.log(
    JSON.stringify(
      {
        generated: weeklyReports.map((report) => ({
          slug: report.slug,
          title: report.title,
          relatedDatasets: report.relatedEntities.datasets ?? []
        })),
        nextSteps: [
          "Replace static report bodies with generated markdown.",
          "Attach charts and tables from metric snapshots.",
          "Publish reports only after methodology and dataset links are present."
        ]
      },
      null,
      2
    )
  )
}

main()
