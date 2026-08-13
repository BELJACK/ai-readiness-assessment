import { levelForScore, type DashboardData } from "@/lib/assessment"
import { TONE_CLASSES } from "@/lib/tone"
import { cn } from "@/lib/utils"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"

/**
 * Score per month, so the dashboard answers "is this getting better" rather
 * than only "where are we now". Hand-built SVG: it is one polyline.
 */
export function TrendCard({ data }: { data: DashboardData }) {
  const { trend, trendDelta } = data
  if (trend.length < 2) return null

  const scores = trend.map((t) => t.score)
  // Pad the range so a flat run doesn't sit on the floor of the chart.
  const min = Math.max(0, Math.min(...scores) - 8)
  const max = Math.min(100, Math.max(...scores) + 8)
  const span = Math.max(1, max - min)

  const W = 100
  const H = 34
  const points = trend.map((t, i) => {
    const x = trend.length === 1 ? W / 2 : (i / (trend.length - 1)) * W
    const y = H - ((t.score - min) / span) * H
    return { x, y, ...t }
  })

  const line = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
  const area = `0,${H} ${line} ${W},${H}`

  const direction = trendDelta === null || trendDelta === 0 ? "flat" : trendDelta > 0 ? "up" : "down"
  const tone =
    direction === "up"
      ? TONE_CLASSES.advanced
      : direction === "down"
        ? TONE_CLASSES.critical
        : TONE_CLASSES.developing
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus

  const latest = trend[trend.length - 1]
  const level = levelForScore(latest.score)
  // A month with very few responses swings hard. Say so rather than letting a
  // spike read as a solid result.
  const thinSample = latest.responses < 3

  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow text-muted-foreground">Readiness over time</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Each point scores only the responses received that month.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            tone.softBg,
            tone.text,
          )}
        >
          <Icon className="size-3.5" />
          {trendDelta === null || trendDelta === 0
            ? "No change"
            : `${trendDelta > 0 ? "+" : ""}${trendDelta} pts`}
        </span>
      </div>

      {/* The SVG is stretched to fill the width, which would squash circular
          markers into ellipses, so the dots are HTML positioned over it. */}
      <div className="relative mt-6 h-24 w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label={`Readiness by month, from ${trend[0].score} in ${trend[0].label} to ${latest.score} in ${latest.label}`}
        >
          <polygon points={area} className="fill-primary/8" />
          <polyline
            points={line}
            fill="none"
            className="stroke-primary"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {points.map((p, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-primary bg-background",
              i === points.length - 1 ? "size-2.5" : "size-2",
            )}
            style={{ left: `${p.x}%`, top: `${(p.y / H) * 100}%` }}
          />
        ))}
      </div>

      <div className="mt-3 flex justify-between">
        {trend.map((t, i) => (
          <div key={i} className="text-center">
            <p className="numeric text-xs font-semibold text-foreground">{t.score}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 border-t border-hairline pt-4 text-sm leading-relaxed text-muted-foreground">
        {direction === "up" ? (
          <>
            Readiness is climbing. {latest.label} scored{" "}
            <span className="font-medium text-foreground">
              {latest.score} ({level.label})
            </span>{" "}
            across {latest.responses} {latest.responses === 1 ? "response" : "responses"}.
            {thinSample ? (
              <span className="text-muted-foreground">
                {" "}
                That is a small sample, so treat the jump as provisional until more
                {" "}
                {latest.label} responses arrive.
              </span>
            ) : null}
          </>
        ) : direction === "down" ? (
          <>
            Readiness has slipped {Math.abs(trendDelta ?? 0)} points since {trend[0].label}. Newer
            responses are scoring lower than earlier ones.
          </>
        ) : (
          <>Readiness has held steady since {trend[0].label}.</>
        )}
      </p>
    </div>
  )
}
