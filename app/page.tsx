import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { DIMENSIONS, DIMENSION_MAP, QUESTIONS, TEAMS, levelForScore } from "@/lib/assessment"
import { AUDIENCE, BENEFITS, DELIVERABLES, FAQS, GLOSSARY, SUCCESS_FACTORS } from "@/lib/content"
import { TONE_CLASSES } from "@/lib/tone"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { ArrowRight, BarChart3, Check, ClipboardList, Lightbulb, Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Free AI Readiness Assessment for Teams | Compass",
  description: `A ${QUESTIONS.length}-question assessment that scores how ready your teams are to adopt AI, with a breakdown by team and a ranked list of what to fix first. Free, anonymous, no signup.`,
  openGraph: {
    title: "Free AI Readiness Assessment for Teams",
    description: `Score how ready your teams are to adopt AI across five capabilities. ${QUESTIONS.length} questions, about three minutes, no signup.`,
    type: "website",
  },
}

// Structured data mirrors the visible copy so the two cannot disagree.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Compass AI Readiness Assessment",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      description: `A ${QUESTIONS.length}-question assessment that scores how ready an organisation's teams are to adopt AI across five capabilities.`,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader action={{ href: "/dashboard", label: "View dashboard", variant: "ghost" }} />

      <main>
        {/* ---- Hero -------------------------------------------------------- */}
        <section className="border-b border-hairline bg-band">
          <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
              <div>
                <p className="eyebrow text-primary">Free tool. No signup required.</p>

                <h1 className="mt-6 text-balance text-[2.5rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.5rem]">
                  AI Readiness Assessment
                </h1>

                <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                  {QUESTIONS.length} questions that score how ready your teams are to adopt AI. You
                  get a score out of 100, a breakdown by team, and a ranked list of what to fix
                  first.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/assess"
                    className="inline-flex h-12 items-center justify-center bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Start assessment
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center justify-center border border-hairline bg-panel px-6 text-sm font-semibold text-foreground transition-colors hover:bg-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    See the overview
                  </Link>
                </div>

                <p className="mt-6 text-sm text-muted-foreground">
                  No email required to see your score.
                </p>
              </div>

              <div className="lg:justify-self-end">
                <ProductPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ---- Direct answer ----------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="callout mx-auto max-w-3xl p-6 sm:p-8">
            <p className="eyebrow text-primary">In short</p>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground">
              An AI readiness assessment scores how prepared a company is to adopt AI across a
              fixed set of capabilities, on a 0 to 100 scale. Most companies land in the Emerging
              to Ready range. Data quality, tooling access, and clear usage rules are usually what
              hold them back longest.
            </p>
          </div>
        </section>

        {/* ---- How it works ------------------------------------------------ */}
        <section className="border-y border-hairline bg-band">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <Step
                n="1"
                icon={<ClipboardList className="size-5" />}
                title={`Answer ${QUESTIONS.length} questions`}
                body="Rating scales, single choices, and multi-select, covering skills, habits, tooling, data, and safety. About three minutes."
              />
              <Step
                n="2"
                icon={<BarChart3 className="size-5" />}
                title="See your score"
                body="A score out of 100, a readiness band, and a breakdown across five capabilities, shown on the page straight away."
              />
              <Step
                n="3"
                icon={<Lightbulb className="size-5" />}
                title="Act on the gaps"
                body="Your lowest capabilities become ranked priorities, each naming the teams that need it most."
              />
            </div>
          </div>
        </section>

        {/* ---- What it measures -------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What it measures</h2>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Five capabilities, scored separately. A company can be strong on tooling and weak on
            governance, and one number would hide that.
          </p>

          <div className="panel mt-8 divide-y divide-hairline">
            {DIMENSIONS.map((d, i) => (
              <div key={d.id} className="grid gap-2 p-6 sm:grid-cols-[240px_1fr] sm:gap-8">
                <div className="flex items-baseline gap-3">
                  <span className="numeric text-xs font-semibold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{d.label}</h3>
                </div>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {d.blurb}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="panel p-6">
              <p className="eyebrow text-muted-foreground">Readiness bands</p>
              <dl className="mt-4 flex flex-col gap-3">
                {[
                  { range: "0 to 39", score: 20 },
                  { range: "40 to 59", score: 50 },
                  { range: "60 to 79", score: 70 },
                  { range: "80 to 100", score: 90 },
                ].map(({ range, score }) => {
                  const level = levelForScore(score)
                  const tone = TONE_CLASSES[level.tone]
                  return (
                    <div key={range} className="flex items-center gap-4">
                      <dt className="numeric w-24 shrink-0 text-sm text-muted-foreground">
                        {range}
                      </dt>
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
            </div>

            <div className="panel p-6">
              <p className="eyebrow text-muted-foreground">Covers {TEAMS.length} teams</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {TEAMS.map((t) => (
                  <span key={t} className="bg-inset px-3 py-1.5 text-xs font-medium text-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Each person picks their team. Scores roll up so you can see which teams are ahead
                and which need support.
              </p>
            </div>
          </div>
        </section>

        {/* ---- Who it is for + what you get -------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-6 sm:p-8">
              <p className="eyebrow text-primary">This is for you if</p>
              <ul className="mt-6 flex flex-col gap-4">
                {AUDIENCE.map((a) => (
                  <li key={a} className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-pretty text-sm leading-relaxed text-muted-foreground">
                      {a}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-6 sm:p-8">
              <p className="eyebrow text-primary">What you get</p>
              <ul className="mt-6 flex flex-col gap-4">
                {DELIVERABLES.map((d) => (
                  <li key={d} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-tone-advanced" strokeWidth={2.5} />
                    <span className="text-pretty text-sm leading-relaxed text-muted-foreground">
                      {d}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---- Why this matters -------------------------------------------- */}
        <section className="border-y border-hairline bg-band">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-primary">Why this matters</p>
              <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                What separates the teams that get value from AI
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                The gap between a stalled AI effort and a working one is rarely the technology.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3">
              {SUCCESS_FACTORS.map((f, i) => (
                <div key={f.title} className="text-center">
                  <span className="numeric mx-auto flex size-10 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-sm font-semibold tracking-tight text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Benefits ----------------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Why run the assessment
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="panel p-6">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">{b.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Want the detail?{" "}
            <Link href="/methodology" className="font-medium text-primary underline underline-offset-4">
              Read how the scoring works
            </Link>
            .
          </p>
        </section>

        {/* ---- Glossary ----------------------------------------------------- */}
        <section className="border-y border-hairline bg-band">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Terms used here</h2>
            <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
              {GLOSSARY.map((g) => (
                <div key={g.term} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr] sm:gap-8">
                  <dt className="text-sm font-semibold text-primary">{g.term}</dt>
                  <dd className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {g.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---- FAQ ---------------------------------------------------------- */}
        <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 divide-y divide-hairline border-y border-hairline">
            {FAQS.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-[15px] font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  />
                </summary>
                <p className="pb-6 pr-10 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ---- CTA ---------------------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col items-center gap-6 border border-hairline bg-ink p-10 text-center text-ink-foreground sm:p-14">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              See where your teams stand
            </h2>
            <p className="max-w-md text-pretty leading-relaxed text-ink-foreground/70">
              Three minutes, no signup, and a real score at the end. Share the link and the
              overview fills in as answers arrive.
            </p>
            <Link
              href="/assess"
              className="inline-flex h-12 items-center justify-center bg-ink-foreground px-6 text-sm font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Start assessment
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

// ---------------------------------------------------------------------------

// A still of the real questionnaire, not invented data. Shows what the product
// actually looks like without claiming numbers that belong to nobody.
function ProductPreview() {
  // Pull one real question so the label, scale ends, and dimension always agree
  // with the live assessment instead of drifting from hardcoded copy.
  const question = QUESTIONS.find((q) => q.id === "q_frequency")
  if (!question || question.kind !== "scale") return null

  const dimension = DIMENSION_MAP[question.dimension]
  const index = QUESTIONS.findIndex((q) => q.id === question.id) + 1

  return (
    <div className="panel w-full" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <span className="text-xs font-medium text-foreground">
          Question <span className="numeric">{index}</span> of{" "}
          <span className="numeric">{QUESTIONS.length}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          <span className="numeric">{index - 1}</span> answered
        </span>
      </div>

      <div className="px-6 pt-4">
        <div className="flex gap-1">
          {Array.from({ length: QUESTIONS.length }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < index - 1 ? "bg-primary/45" : i === index - 1 ? "bg-primary" : "bg-inset",
              )}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <span className="inline-flex items-center bg-inset px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {dimension.label}
        </span>
        <p className="mt-4 text-balance text-lg font-semibold leading-snug tracking-tight text-foreground">
          {question.text}
        </p>

        <div className="mt-6 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={cn(
                "numeric flex h-12 items-center justify-center border text-base font-semibold",
                n === 4
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-hairline bg-panel text-muted-foreground",
              )}
            >
              {n}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{question.lowLabel}</span>
          <span>{question.highLabel}</span>
        </div>
      </div>
    </div>
  )
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: string
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-primary text-primary">
        {icon}
      </span>
      <p className="eyebrow mt-4 text-muted-foreground">Step {n}</p>
      <h3 className="mt-1.5 text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  )
}
