import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { DIMENSIONS, QUESTIONS, SCORED_QUESTIONS, levelForScore } from "@/lib/assessment"
import { TONE_CLASSES } from "@/lib/tone"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How the scoring works | Compass",
  description:
    "The full scoring model behind the AI readiness assessment: how each answer format is scored, how scores roll up, and how recommendations are chosen.",
}

const FORMATS = [
  { format: "Rating scale (1 to 5)", scoring: "The value as given." },
  { format: "Single choice", scoring: "Each option carries an explicit weight from 1 to 5." },
  {
    format: "Multi-select",
    scoring: "Scored inversely by coverage. Selecting more manual tasks lowers the score.",
  },
  { format: "Free text", scoring: "Not scored. Shown on the dashboard as context." },
]

export default function MethodologyPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader action={{ href: "/assess", label: "Take assessment" }} />

      <main>
        <div className="border-b border-hairline bg-band">
          <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="eyebrow text-primary">Methodology</p>
            <h1 className="mt-4 text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.75rem]">
              How the scoring works
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              The whole model in one page. No weighting you cannot see, and no score you cannot
              trace back to an answer.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <Section title="One scale, four answer formats">
            <p>
              The assessment asks {QUESTIONS.length} questions in four formats. Every scored
              format resolves to the same 1 to 5 value, which is what lets a mixed questionnaire
              produce one comparable number.
            </p>
            <div className="panel mt-6 divide-y divide-hairline not-prose">
              {FORMATS.map((f) => (
                <div key={f.format} className="grid gap-2 p-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                  <p className="text-sm font-semibold text-foreground">{f.format}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.scoring}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Why multi-select runs backwards">
            <p>
              One question asks which manual tasks you do often enough that automating them would
              help. Selecting more of them means more unautomated work, so the score runs inversely
              to the number selected:
            </p>
            <pre className="not-prose mt-4 overflow-x-auto border border-hairline bg-inset p-4 text-sm text-foreground">
              <code>score = 5 - (selected / total) * 4</code>
            </pre>
          </Section>

          <Section title="Converting to 0 to 100">
            <p>
              Averages are rescaled from the 1 to 5 range onto 0 to 100 so every number in the
              product reads the same way:
            </p>
            <pre className="not-prose mt-4 overflow-x-auto border border-hairline bg-inset p-4 text-sm text-foreground">
              <code>score = ((average - 1) / 4) * 100</code>
            </pre>
          </Section>

          <Section title="How scores roll up">
            <p>
              Four stages, each a plain mean. Unanswered questions are skipped rather than counted
              as zero, so a submission from before a question existed stays usable.
            </p>
            <ol className="not-prose mt-6 flex flex-col gap-3">
              {[
                "Each answer becomes a 1 to 5 value.",
                `Values group into ${DIMENSIONS.length} capability scores.`,
                "Capability scores average into a team score.",
                "Team scores average into the company score.",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="numeric flex size-7 shrink-0 items-center justify-center rounded-full bg-inset text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="The five capabilities">
            <p>
              Every scored question belongs to exactly one capability. That is what turns a low
              overall score into something specific to fix.
            </p>
            <div className="panel mt-6 divide-y divide-hairline not-prose">
              {DIMENSIONS.map((d) => {
                const count = SCORED_QUESTIONS.filter((q) => q.dimension === d.id).length
                return (
                  <div key={d.id} className="flex items-start justify-between gap-6 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{d.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {d.blurb}
                      </p>
                    </div>
                    <span className="numeric shrink-0 text-xs text-muted-foreground">
                      {count} {count === 1 ? "question" : "questions"}
                    </span>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="Readiness bands">
            <p>Bands exist so the number means something without a chart beside it.</p>
            <dl className="not-prose mt-6 divide-y divide-hairline border-y border-hairline">
              {[
                { range: "0 to 39", score: 20 },
                { range: "40 to 59", score: 50 },
                { range: "60 to 79", score: 70 },
                { range: "80 to 100", score: 90 },
              ].map(({ range, score }) => {
                const level = levelForScore(score)
                const tone = TONE_CLASSES[level.tone]
                return (
                  <div key={range} className="flex items-center gap-6 py-3">
                    <dt className="numeric w-24 shrink-0 text-sm text-muted-foreground">{range}</dt>
                    <dd
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        tone.softBg,
                        tone.text,
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", tone.dot)} />
                      {level.label}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </Section>

          <Section title="How recommendations are chosen">
            <p>
              Recommendations are generated, not hand-written per company. The three lowest
              capability scores become ranked priorities. Each is paired with a predefined action
              and the two teams scoring worst in that capability, so the advice names who to start
              with instead of stating a general principle.
            </p>
          </Section>

          <Section title="What this does not do">
            <p>
              It does not benchmark you against other companies. Your score reflects only the
              answers your own people give, and a benchmark would need a far larger sample than
              this holds. It also cannot tell you whether a specific AI project will succeed. It
              measures readiness to adopt, not the value of any one initiative.
            </p>
          </Section>

          <div className="mt-16 flex flex-col items-center gap-6 border border-hairline bg-ink p-10 text-center text-ink-foreground">
            <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
              See your own score
            </h2>
            <Link
              href="/assess"
              className="inline-flex h-12 items-center justify-center bg-ink-foreground px-6 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Start assessment
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-pretty leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
