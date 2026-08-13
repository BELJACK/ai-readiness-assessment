/**
 * Backfills the seeded submissions with answers for the questions added after
 * they were first written (familiarity, automation opportunities, blockers).
 *
 *   node scripts/backfill-seed.mjs           # dry run, prints the plan
 *   node scripts/backfill-seed.mjs --apply   # writes
 *
 * Answers are derived from each row's existing scores so the seeded data stays
 * internally consistent: a respondent who rates everything low also reads as
 * less familiar with AI and flags more manual work as automatable.
 */
import { Pool } from "pg"
import fs from "node:fs"
import path from "node:path"

const APPLY = process.argv.includes("--apply")
// --force re-derives rows that were already backfilled (e.g. after editing the
// blocker copy below).
const FORCE = process.argv.includes("--force")

const SCALE_IDS = [
  "q_confidence",
  "q_prompting",
  "q_frequency",
  "q_impact",
  "q_access",
  "q_data",
  "q_leadership",
  "q_safety",
]

const AUTOMATABLE = [
  "summarising",
  "drafting",
  "research",
  "data_entry",
  "reporting",
  "meetings",
]

// Blockers, phrased the way someone on that team would actually say it.
// Several per team so a team with multiple respondents doesn't repeat itself.
const BLOCKERS = {
  Sales: [
    "I'm never sure what customer data I'm allowed to paste into these tools.",
    "It drafts a decent follow-up but it doesn't know our pricing rules.",
    "Honestly I've never been shown what it's good for in my role.",
  ],
  Engineering: [
    "Approval for new tooling takes weeks, so we just don't bother.",
    "It's useful for boilerplate, less so anywhere near our own codebase.",
    "Review overhead cancels out the time it saves on anything non-trivial.",
  ],
  Operations: [
    "Our process docs are out of date, so the output is confidently wrong.",
    "The data lives in four systems that don't talk to each other.",
  ],
  Marketing: [
    "It writes fine drafts but nothing that sounds like us yet.",
    "No one owns prompt quality here, so results are all over the place.",
  ],
  "Customer Success": [
    "No one has told us what's actually approved for customer conversations.",
    "I'd use it for ticket summaries if I knew that was allowed.",
  ],
  "People & HR": [
    "Anything involving employee data feels too risky without a clear policy.",
    "We have no guidance at all, so I've stayed away from it entirely.",
  ],
  Finance: [
    "The numbers have to be exactly right, and I can't verify how it got them.",
    "Audit trail is the blocker — I can't explain a number I didn't derive.",
  ],
  Leadership: [
    "I can't tell which of this is real value versus hype.",
    "We haven't decided who owns AI adoption, so nothing moves.",
  ],
}

function loadUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  for (const file of [".env.local", ".env"]) {
    const p = path.join(process.cwd(), file)
    if (!fs.existsSync(p)) continue
    const m = fs.readFileSync(p, "utf8").match(/^DATABASE_URL=(.+)$/m)
    if (m) return m[1].trim()
  }
  throw new Error("DATABASE_URL not found")
}

// Deterministic per-row pseudo-randomness so repeated runs are stable.
function seeded(id) {
  const x = Math.sin(id * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function derive(row) {
  const values = SCALE_IDS.map((k) => row.answers[k]).filter((v) => typeof v === "number")
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 3

  // Familiarity tracks overall confidence, nudged slightly by the row's seed.
  const familiarity = Math.min(5, Math.max(1, Math.round(avg + (seeded(row.id) - 0.5))))

  // Lower readiness -> more manual work worth automating.
  const count = Math.min(AUTOMATABLE.length, Math.max(1, Math.round(6 - avg)))
  const offset = Math.floor(seeded(row.id + 7) * AUTOMATABLE.length)
  const automatable = Array.from(
    { length: count },
    (_, i) => AUTOMATABLE[(offset + i) % AUTOMATABLE.length],
  )

  // Only some people leave a comment — roughly the lower half, plus a few others.
  const leavesComment = avg < 3.6 || seeded(row.id + 13) > 0.72
  const pool = BLOCKERS[row.team] ?? []
  const blocker =
    leavesComment && pool.length
      ? pool[Math.floor(seeded(row.id + 21) * pool.length) % pool.length]
      : undefined

  return { familiarity, automatable, blocker }
}

const pool = new Pool({ connectionString: loadUrl() })

const rows = (await pool.query("select id, team, answers from submissions order by id")).rows

let changed = 0
for (const row of rows) {
  const answers = { ...row.answers }
  const alreadyDone =
    answers.q_familiarity !== undefined && answers.q_automatable !== undefined
  if (alreadyDone && !FORCE) continue

  const { familiarity, automatable, blocker } = derive(row)
  answers.q_familiarity = familiarity
  answers.q_automatable = automatable
  if (blocker) answers.q_blocker = blocker
  else delete answers.q_blocker

  changed++
  console.log(
    `#${String(row.id).padStart(2)} ${row.team.padEnd(17)} familiarity=${familiarity} ` +
      `automatable=${automatable.length} ${blocker ? "+comment" : ""}`,
  )

  if (APPLY) {
    await pool.query("update submissions set answers = $1 where id = $2", [answers, row.id])
  }
}

console.log(
  `\n${changed} of ${rows.length} rows ${APPLY ? "updated" : "would be updated"}.` +
    (APPLY ? "" : " Re-run with --apply to write."),
)

await pool.end()
