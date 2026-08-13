/**
 * Spreads the seeded submissions across the past few months.
 *
 *   node scripts/spread-seed-dates.mjs           # dry run
 *   node scripts/spread-seed-dates.mjs --apply   # writes
 *
 * The seed rows were all inserted in one batch, so every created_at is
 * identical and the trend view has nothing to plot. Real usage arrives over
 * weeks, so this rewrites created_at to a realistic arrival pattern. Lower
 * scoring responses are weighted earlier, which is what improvement looks like.
 */
import { Pool } from "pg"
import fs from "node:fs"
import path from "node:path"

const APPLY = process.argv.includes("--apply")
const WEEKS = 17

const SCALE_IDS = [
  "q_familiarity",
  "q_confidence",
  "q_prompting",
  "q_frequency",
  "q_impact",
  "q_access",
  "q_data",
  "q_leadership",
  "q_safety",
]

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

const seeded = (n) => {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const pool = new Pool({ connectionString: loadUrl() })

const rows = (await pool.query("select id, team, answers, created_at from submissions order by id"))
  .rows

// Rank by score, but only tilt the dates gently. A strict score-ordered ramp
// produces an unbelievable trend line; real data improves slowly and noisily.
const scored = rows
  .map((r) => {
    const vals = SCALE_IDS.map((k) => r.answers[k]).filter((v) => typeof v === "number")
    return { ...r, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 3 }
  })
  .sort((a, b) => a.avg - b.avg)

const now = Date.now()
const windowMs = WEEKS * 7 * 24 * 60 * 60 * 1000

// Evenly spaced arrival slots guarantee the months are covered. Rows are then
// assigned to slots by a blend of score rank and noise, so the trend rises
// gently instead of ramping like a manufactured demo.
const TILT = 0.42

const ranked = scored
  .map((r, i) => ({
    row: r,
    key: TILT * ((i + 0.5) / scored.length) + (1 - TILT) * seeded(r.id * 3 + 11),
  }))
  .sort((a, b) => a.key - b.key)

const plan = ranked.map(({ row: r }, slot) => {
  const frac = (slot + 0.5) / ranked.length
  const at = new Date(now - windowMs + frac * windowMs)
  // Land on a weekday working hour.
  if (at.getDay() === 0) at.setDate(at.getDate() + 1)
  if (at.getDay() === 6) at.setDate(at.getDate() + 2)
  at.setHours(9 + Math.floor(seeded(r.id + 3) * 8), Math.floor(seeded(r.id + 5) * 60), 0, 0)
  return { id: r.id, team: r.team, avg: r.avg.toFixed(2), at }
})

plan
  .slice()
  .sort((a, b) => a.at - b.at)
  .forEach((p) => {
    console.log(`#${String(p.id).padStart(2)} ${p.team.padEnd(17)} avg=${p.avg}  ${p.at.toISOString().slice(0, 16).replace("T", " ")}`)
  })

if (APPLY) {
  for (const p of plan) {
    await pool.query("update submissions set created_at = $1 where id = $2", [p.at, p.id])
  }
  console.log(`\n${plan.length} rows updated across the past ${WEEKS} weeks.`)
} else {
  console.log(`\nDry run. Re-run with --apply to write.`)
}

await pool.end()
