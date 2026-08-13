import { DIMENSIONS, TEAMS } from "@/lib/assessment"
import { ShareButton } from "@/components/dashboard/share-button"
import { ArrowRight, BarChart3, Share2, Users } from "lucide-react"
import Link from "next/link"

export function EmptyState() {
  return (
    <>
      <div className="border-b border-hairline bg-band">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BarChart3 className="size-6" />
          </span>
          <h1 className="mt-8 text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.75rem]">
            No responses yet
          </h1>
          <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Share the assessment with your teams. As answers arrive, this page fills in with an
            overall score, a breakdown by team, and where to upskill first.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/assess"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Take the assessment
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
            <ShareButton className="h-11 justify-center px-6" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <HowItWorks
            icon={<Share2 className="size-4" />}
            step="01"
            title="Share the link"
            body="Send one link to everyone across your teams. Responses are anonymous."
          />
          <HowItWorks
            icon={<Users className="size-4" />}
            step="02"
            title="People respond"
            body="Each person answers a short mix of ratings, choices, and multi-selects about how they work."
          />
          <HowItWorks
            icon={<BarChart3 className="size-4" />}
            step="03"
            title="See where to upskill"
            body="Scores roll up by team and capability, with next steps for the weakest areas."
          />
        </div>

        <div className="panel mt-4 grid gap-px overflow-hidden bg-hairline sm:grid-cols-2">
          <div className="bg-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              What we measure
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DIMENSIONS.map((d) => (
                <span
                  key={d.id}
                  className="rounded-full bg-inset px-3 py-1 text-xs font-medium text-foreground"
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Across {TEAMS.length} teams
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TEAMS.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-inset px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function HowItWorks({
  icon,
  step,
  title,
  body,
}: {
  icon: React.ReactNode
  step: string
  title: string
  body: string
}) {
  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="numeric text-xs font-semibold text-muted-foreground">{step}</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
