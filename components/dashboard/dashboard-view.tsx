import { ScoreRing } from "@/components/score-ring"
import { ShareButton } from "@/components/dashboard/share-button"
import { ExportButton } from "@/components/dashboard/export-button"
import { TrendCard } from "@/components/dashboard/trend-card"
import { DIMENSION_MAP, LEVEL_BLURB, levelForScore, type DashboardData } from "@/lib/assessment"
import { TONE_CLASSES } from "@/lib/tone"
import { cn } from "@/lib/utils"
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react"
import Link from "next/link"

export function DashboardView({ data }: { data: DashboardData }) {
  const overallLevel = levelForScore(data.overallScore)
  const teamCount = data.teams.length
  const strongest = data.teams[0]
  const weakest = data.teams[data.teams.length - 1]

  return (
    <>
      {/* ---- Hero ------------------------------------------------------- */}
      <div className="border-b border-hairline bg-band">
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Business overview
              </p>
              <h1 className="mt-2 text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.75rem]">
                AI Readiness
              </h1>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
                Based on {data.totalResponses}{" "}
                {data.totalResponses === 1 ? "response" : "responses"} across {teamCount}{" "}
                {teamCount === 1 ? "team" : "teams"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" data-print-hide>
              <ExportButton />
              <ShareButton />
            </div>
          </div>

          <div className="panel mt-8 overflow-hidden">
            <div className="flex flex-col items-center gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-12">
              <ScoreRing score={data.overallScore} size="lg" />

              <div className="min-w-0 flex-1">
                <p className="text-balance text-xl font-medium leading-snug tracking-tight text-foreground sm:text-2xl">
                  {LEVEL_BLURB[overallLevel.tone]}
                </p>
                <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                  Every answer maps to a 0 to 100 value, averaged by capability and by team. The
                  lowest scores below are where training pays back fastest.
                </p>

                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-hairline pt-6 sm:grid-cols-4">
                  <Metric label="Readiness" value={overallLevel.label} tone={overallLevel.tone} />
                  <Metric label="Responses" value={String(data.totalResponses)} />
                  <Metric label="Teams" value={String(teamCount)} />
                  <Metric label="Capabilities" value={String(data.dimensions.length)} />
                </dl>
              </div>
            </div>

            <div className="grid gap-px border-t border-hairline bg-hairline sm:grid-cols-2">
              <Extreme
                label="Strongest team"
                team={strongest?.team}
                score={strongest?.score}
                variant="up"
              />
              <Extreme
                label="Needs the most support"
                team={weakest?.team}
                score={weakest?.score}
                variant="down"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        {/* ---- Capabilities --------------------------------------------- */}
        <Section
          index="01"
          title="Readiness by capability"
          subtitle="The five capabilities behind the overall score, strongest first."
        >
          <div className="panel divide-y divide-hairline">
            {[...data.dimensions]
              .sort((a, b) => b.score - a.score)
              .map((d) => {
                const level = levelForScore(d.score)
                const tone = TONE_CLASSES[level.tone]
                return (
                  <div key={d.id} className="p-6 sm:px-6 sm:py-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{d.label}</p>
                        <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                          {DIMENSION_MAP[d.id].blurb}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-baseline gap-2">
                        <span className="numeric text-2xl font-semibold text-foreground">
                          {d.score}
                        </span>
                        <LevelChip level={level.label} tone={tone} />
                      </div>
                    </div>
                    <Bar score={d.score} tone={tone} className="mt-4" />
                  </div>
                )
              })}
          </div>
        </Section>

        {data.trend.length >= 2 ? (
          <Section
            index="02"
            title="Direction of travel"
            subtitle="Whether readiness is improving, and by how much."
          >
            <TrendCard data={data} />
          </Section>
        ) : null}

        {/* ---- Teams ------------------------------------------------------ */}
        <Section
          index="03"
          title="Breakdown by team"
          subtitle={`All ${teamCount} teams ranked by score, with the capability each should fix first.`}
        >
          <ol className="panel divide-y divide-hairline">
            {data.teams.map((t, i) => {
              const level = levelForScore(t.score)
              const tone = TONE_CLASSES[level.tone]
              const focus = [...t.dimensions].sort((a, b) => a.score - b.score)[0]
              return (
                <li
                  key={t.team}
                  className="grid grid-cols-[auto_1fr] items-start gap-x-4 p-6 sm:gap-x-6 sm:px-6"
                >
                  <span className="numeric mt-0.5 flex size-7 items-center justify-center rounded-full bg-inset text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="text-[15px] font-semibold text-foreground">{t.team}</p>
                      <div className="flex shrink-0 items-baseline gap-2">
                        <span className="numeric text-xl font-semibold text-foreground">
                          {t.score}
                        </span>
                        <LevelChip level={level.label} tone={tone} />
                      </div>
                    </div>

                    <Bar score={t.score} tone={tone} className="mt-4" />

                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {t.responses} {t.responses === 1 ? "response" : "responses"}
                      </span>
                      {focus ? (
                        <>
                          <span aria-hidden="true" className="hidden text-border sm:inline">
                            &middot;
                          </span>
                          <span>
                            Fix first:{" "}
                            <span className="font-medium text-foreground">{focus.label}</span>{" "}
                            <span className="numeric">({focus.score})</span>
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Section>

        {/* ---- Recommendations -------------------------------------------- */}
        <Section
          index="04"
          title="Where to upskill"
          subtitle="Your three lowest capabilities, what to do about each, and which teams to start with."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {data.recommendations.map((rec, i) => {
              const level = levelForScore(rec.score)
              const tone = TONE_CLASSES[level.tone]
              return (
                <article key={rec.dimension} className="panel flex flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Priority {i + 1}
                    </span>
                    <span className={cn("numeric text-lg font-semibold", tone.text)}>
                      {rec.score}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                    {rec.label}
                  </h3>
                  <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {rec.text}
                  </p>

                  {rec.weakestTeams.length > 0 ? (
                    <div className="mt-6 border-t border-hairline pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Start with
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rec.weakestTeams.map((wt) => (
                          <span
                            key={wt.team}
                            className="inline-flex items-center gap-1.5 rounded-full bg-inset px-3 py-1 text-xs font-medium text-foreground"
                          >
                            {wt.team}
                            <span className="numeric text-muted-foreground">{wt.score}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </Section>

        {/* ---- Automation opportunities + verbatims ------------------------ */}
        {data.opportunities.length > 0 || data.voices.length > 0 ? (
          <Section
            index="05"
            title="What people told us"
            subtitle="The manual work teams want automated, and the blockers they named."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {data.opportunities.length > 0 ? (
                <div className="panel p-6">
                  <p className="eyebrow text-muted-foreground">Automation opportunities</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Share of respondents who do each task often enough to be worth automating.
                  </p>
                  <ul className="mt-6 flex flex-col gap-4">
                    {data.opportunities.map((o) => (
                      <li key={o.label}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-sm text-foreground">{o.label}</span>
                          <span className="numeric shrink-0 text-sm font-semibold text-foreground">
                            {o.share}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden bg-inset">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.max(o.share, 2)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data.voices.length > 0 ? (
                <div className="panel p-6">
                  <p className="eyebrow text-muted-foreground">In their words</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Unedited answers, shown with the team that gave them.
                  </p>
                  <ul className="mt-6 flex flex-col gap-4">
                    {data.voices.map((v, i) => (
                      <li key={i} className="border-l-2 border-primary/40 pl-4">
                        <p className="text-pretty text-sm leading-relaxed text-foreground">
                          &ldquo;{v.text}&rdquo;
                        </p>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {v.team}
                          {v.role ? ` · ${v.role}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        {/* ---- CTA ---------------------------------------------------------- */}
        <section data-print-hide className="mt-16 flex flex-col items-center justify-between gap-6 border border-hairline bg-ink p-6 text-center text-ink-foreground sm:flex-row sm:text-left">
          <div>
            <p className="text-base font-semibold tracking-tight">
              Get more of your team to respond
            </p>
            <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-foreground/70">
              Every response sharpens the numbers on this page.
            </p>
          </div>
          <Link
            href="/assess"
            className="inline-flex h-11 shrink-0 items-center justify-center bg-ink-foreground px-6 text-sm font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Take the assessment
            <ArrowUpRight className="ml-1.5 size-4" />
          </Link>
        </section>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------

function Section({
  index,
  title,
  subtitle,
  children,
}: {
  index: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-16">
      <div className="flex items-baseline gap-3">
        <span className="numeric text-xs font-semibold text-primary">{index}</span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <p className="mt-1.5 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
        {subtitle}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Bar({
  score,
  tone,
  className,
}: {
  score: number
  tone: (typeof TONE_CLASSES)[keyof typeof TONE_CLASSES]
  className?: string
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-inset", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tone.bg)}
        style={{ width: `${Math.max(score, 2)}%` }}
      />
    </div>
  )
}

function LevelChip({
  level,
  tone,
}: {
  level: string
  tone: (typeof TONE_CLASSES)[keyof typeof TONE_CLASSES]
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone.softBg,
        tone.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone.dot)} />
      {level}
    </span>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: ReturnType<typeof levelForScore>["tone"]
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1.5 text-lg font-semibold tracking-tight",
          tone ? TONE_CLASSES[tone].text : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function Extreme({
  label,
  team,
  score,
  variant,
}: {
  label: string
  team?: string
  score?: number
  variant: "up" | "down"
}) {
  const tone = variant === "up" ? TONE_CLASSES.advanced : TONE_CLASSES.emerging
  const Icon = variant === "up" ? TrendingUp : TrendingDown
  return (
    <div className="flex items-center gap-4 bg-panel px-6 py-6">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tone.softBg)}>
        <Icon className={cn("size-4", tone.text)} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-[15px] font-semibold text-foreground">{team ?? "No data"}</p>
      </div>
      <span className={cn("numeric shrink-0 text-xl font-semibold", tone.text)}>{score ?? 0}</span>
    </div>
  )
}
