import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy | Compass",
  description:
    "What the AI readiness assessment stores, what it does not store, and how responses are shown.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader action={{ href: "/assess", label: "Take assessment" }} />

      <main>
        <div className="border-b border-hairline bg-band">
          <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="eyebrow text-primary">Privacy</p>
            <h1 className="mt-4 text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.75rem]">
              What we store
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              The short version: your team, an optional job title, and your answers. Nothing that
              identifies you.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <Section title="What is stored">
            <ul className="not-prose flex flex-col gap-3">
              {[
                ["Team", "The team you pick at the start, used to group results."],
                ["Job title", "Optional, free text, and only shown alongside a comment you wrote."],
                ["Answers", "Your responses to the assessment questions."],
                ["Timestamp", "When the response was submitted."],
              ].map(([k, v]) => (
                <li key={k} className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-6">
                  <span className="text-sm font-semibold text-foreground">{k}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="What is not stored">
            <p>
              No name, no email address, no IP address, no device identifier, and no account. There
              is no sign-up step because there are no accounts to sign into.
            </p>
          </Section>

          <Section title="How responses are shown">
            <p>
              The dashboard only ever shows aggregates: a company score, capability scores, and
              team averages. An individual response is never displayed on its own.
            </p>
            <p>
              The one exception is the optional comment at the end of the assessment. If you write
              one, it may appear on the dashboard next to your team and job title. Do not put
              anything in that box you would not want a colleague to read.
            </p>
          </Section>

          <Section title="Data kept in your browser">
            <p>
              Your in-progress answers are saved to this browser so a refresh does not lose them,
              and your completed result is kept so the summary survives a reload. Both live only on
              your device. Clearing site data removes them.
            </p>
            <p>No analytics cookies and no third-party trackers are set.</p>
          </Section>

          <Section title="Where the data lives">
            <p>
              Responses are stored in a Postgres database and are only used to produce the scores
              shown in this product. They are not sold, shared with third parties, or used to build
              a profile of anyone.
            </p>
          </Section>

          <Section title="Removing a response">
            <p>
              Because responses carry nothing that identifies you, a single one cannot be located
              and deleted on request. If a whole workspace needs clearing, that is done at the
              database level by whoever operates the deployment.
            </p>
          </Section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-pretty leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
