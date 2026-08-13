# Compass

Most AI projects stall on readiness, not technology. Compass measures how ready a
business actually is to adopt AI. Team members answer a short assessment. Leaders
get an overall score, a breakdown by team, and a ranked list of what to fix first.

Built by Belema Jackreece.

---

## Running it

```bash
pnpm install
```

Create `.env.local` with a Postgres connection string:

```bash
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

Then:

```bash
pnpm dev
```

The app runs at `http://localhost:3000`. It needs one table:

```sql
create table submissions (
  id         serial primary key,
  team       text not null,
  role       text,
  answers    jsonb not null,
  created_at timestamptz not null default now()
);
create index submissions_created_idx on submissions (created_at);
```

Two seed helpers, both dry-run by default and written with `--apply`:

- `scripts/backfill-seed.mjs` brings older rows forward when questions are added.
- `scripts/spread-seed-dates.mjs` spreads seed timestamps across recent months
  so the trend view has something to plot. Seed rows are inserted in one batch,
  which would otherwise leave every response on the same day.

---

## Screens

| Route          | Purpose                                                          |
| -------------- | ---------------------------------------------------------------- |
| `/`            | Marketing page. Static, no database dependency.                   |
| `/assess`      | The assessment a team member fills in.                            |
| `/dashboard`   | Business overview: score, capabilities, teams, recommendations.   |
| `/methodology` | The full scoring model, formulas included.                        |
| `/privacy`     | What is stored and what is not.                                   |
| `/api/export`  | Aggregated results as CSV.                                        |

Marketing and product are kept apart on purpose. `/` sells the tool and is
statically rendered, so it loads instantly and cannot break when the database is
down. `/dashboard` is the product and is always server-rendered fresh.

---

## Architecture

```
app/
  page.tsx              Marketing page (static)
  assess/page.tsx       Assessment route
  dashboard/page.tsx    Business overview, Suspense-wrapped
  methodology/page.tsx  Scoring model, generated from lib/assessment.ts
  privacy/page.tsx      Data handling
  actions/assessment.ts Server actions: submit + aggregate
  error.tsx             Runtime error boundary
  not-found.tsx         404
components/
  assessment/           Flow controller + per-format question renderer
  dashboard/            Dashboard view, trend, empty state, skeleton, export
  site-header.tsx       Nav, with a scrollable mobile row
  site-footer.tsx       Footer
  score-ring.tsx        Animated radial score
lib/
  assessment.ts         Questions, scoring engine, aggregation (the core)
  content.ts            FAQ, glossary, marketing copy (also feeds JSON-LD)
  storage.ts            Session persistence (draft + last result)
  tone.ts               Score band to colour class mapping
```

The design is deliberately server-first. `lib/assessment.ts` is pure and holds
every scoring decision, so the same functions produce the number on the
questionnaire's success screen and the number on the executive dashboard, so they
cannot drift apart.

Only the pieces that genuinely need interactivity are client components: the
assessment flow, the score ring, the header, and the share/export buttons.

The marketing page shows a still of the real questionnaire rather than invented
sample numbers, and it reads that question out of `lib/assessment.ts`, so the
preview cannot drift from the live assessment.

---

## Scoring

**Everything resolves to one 1 to 5 scale, then to 0 to 100.** That is what keeps
the model explainable: a mixed-format questionnaire still produces one comparable
number.

| Format             | How it scores                                                        |
| ------------------ | -------------------------------------------------------------------- |
| Likert (1 to 5)    | The value as given.                                                   |
| Radio cards        | Each option carries an explicit 1 to 5 weight.                        |
| Multi-select chips | Scored **inversely** by coverage. See below.                          |
| Free text          | Not scored. Qualitative context only.                                 |

The multi-select asks which manual tasks someone does often enough that
automating them would help. Selecting more of them signals *less* current
automation, so the score runs inversely:

```
score = 5 - (selected / total) * 4
```

Conversion to the reported number:

```
score = ((average - 1) / 4) * 100
```

Scores roll up in stages: **answers, then capability, then team, then company.**
Each stage is a plain mean, and every stage skips unanswered questions rather
than treating them as zero, so older submissions stay usable when new questions
are added.

**Bands**

| Range  | Label     |
| ------ | --------- |
| 0-39   | Low       |
| 40-59  | Emerging  |
| 60-79  | Ready     |
| 80-100 | Advanced  |

**Recommendations** are generated, not written. The three lowest-scoring
capabilities become ranked priorities, each paired with its predefined remedy and
the two teams scoring worst in that capability, so the advice names who to start
with rather than stating a generic best practice.

---

## The five capabilities

Skills & Confidence, Adoption & Habits, Tooling & Access, Data & Process,
Culture & Leadership

Each question belongs to exactly one, which is what makes a low overall score
diagnosable rather than just bad news.

---

## Product decisions

**Anonymous by default.** Only team and an optional role are stored, never a
name. People understate AI use when they think an answer is attributable, and a
readiness score built on flattering answers is worthless.

**A ranked list, not a grid of cards, for teams.** Eight equally weighted cards
force you to compare numbers by reading them one at a time. A single ranked
column with aligned bars puts the gap between the strongest and weakest team
first.

**Mixed question formats.** A questionnaire that repeats one control eleven times
reads as a form. Varying the format keeps attention up and lets each question ask
for what it actually needs.

**Free text is surfaced, not buried.** Numbers say a team is behind. The verbatim
comments say why. The dashboard shows both.

**Answers persist locally.** A refresh mid-questionnaire restores your place, and
a completed result survives a reload rather than vanishing.

**Submit never fails blindly.** If a question was missed, the form navigates to
that exact question and names it, instead of rejecting the whole submission with
a generic error.

**Trends admit their own weakness.** A month scored from fewer than three
responses is labelled provisional. A number that swings on a small sample should
say so rather than be read as a result.

---

## States

Every state in the brief is implemented and reachable:

- **Empty**: dashboard before any responses, with a share CTA
- **Loading**: skeletons matching the real layout, not a spinner
- **Onboarding**: team selection before the questionnaire starts
- **Active**: the stepped questionnaire, with restore-in-progress
- **Validation**: blocking Next until a required question is answered
- **Submitting**: a full-screen scoring state
- **Success**: animated confirmation with a personal snapshot
- **Error**: `error.tsx` boundary with retry, plus a styled 404
- **No history**: the trend section hides itself below four responses or two
  months, rather than plotting a line through one point

---

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Drizzle ORM,
Postgres (Neon), Vercel.

Type-safe throughout. `pnpm build` runs `tsc` and fails on any type error.

Charts are hand-built SVG and CSS rather than a charting library. There are only
two visual forms here, a radial and a bar, and both are a few lines each. A chart
dependency would have cost more in bundle size and style overrides than it saved.

---

## Deploying

Push to GitHub, import into Vercel, set `DATABASE_URL`, deploy. No other
configuration is required.
