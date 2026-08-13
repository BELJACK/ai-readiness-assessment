import { getDashboardData } from "@/app/actions/assessment"
import { levelForScore } from "@/lib/assessment"

export const dynamic = "force-dynamic"

/** Wraps a value for CSV: quote it and double any internal quotes. */
function cell(value: string | number): string {
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const row = (cells: (string | number)[]) => cells.map(cell).join(",")

/**
 * Aggregated results as CSV, for anyone who wants the numbers in a spreadsheet
 * rather than a PDF. Only aggregates are exported, never individual responses.
 */
export async function GET() {
  const data = await getDashboardData()

  const lines: string[] = []

  lines.push(row(["Section", "Name", "Score", "Level", "Responses"]))
  lines.push(
    row([
      "Overall",
      "Company",
      data.overallScore,
      levelForScore(data.overallScore).label,
      data.totalResponses,
    ]),
  )

  for (const d of data.dimensions) {
    lines.push(row(["Capability", d.label, d.score, levelForScore(d.score).label, ""]))
  }

  for (const t of data.teams) {
    lines.push(row(["Team", t.team, t.score, levelForScore(t.score).label, t.responses]))
  }

  for (const t of data.teams) {
    for (const d of t.dimensions) {
      lines.push(row([`Team capability: ${t.team}`, d.label, d.score, levelForScore(d.score).label, ""]))
    }
  }

  for (const m of data.trend) {
    lines.push(row(["Monthly", m.label, m.score, levelForScore(m.score).label, m.responses]))
  }

  lines.push("")
  lines.push(row(["Priority", "Capability", "Score", "Recommendation", "Start with"]))
  data.recommendations.forEach((r, i) => {
    lines.push(
      row([i + 1, r.label, r.score, r.text, r.weakestTeams.map((w) => `${w.team} (${w.score})`).join("; ")]),
    )
  })

  if (data.opportunities.length > 0) {
    lines.push("")
    lines.push(row(["Automation opportunity", "Respondents", "Share %"]))
    for (const o of data.opportunities) {
      lines.push(row([o.label, o.count, o.share]))
    }
  }

  const stamp = new Date().toISOString().slice(0, 10)

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ai-readiness-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
