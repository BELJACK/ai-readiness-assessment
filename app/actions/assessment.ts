"use server"

import { db } from "@/lib/db"
import { submissions } from "@/lib/db/schema"
import {
  QUESTIONS,
  SCALE_MAX,
  SCALE_MIN,
  TEAMS,
  buildDashboard,
  type AnswerMap,
  type AnswerValue,
  type DashboardData,
} from "@/lib/assessment"
import { desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type SubmitState = { ok: boolean; error?: string }

const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id))
const VALID_TEAMS = new Set<string>(TEAMS)

const MAX_TEXT_LENGTH = 500

export async function submitAssessment(input: {
  team: string
  role?: string
  answers: AnswerMap
}): Promise<SubmitState> {
  const team = (input.team ?? "").trim()
  if (!VALID_TEAMS.has(team)) {
    return { ok: false, error: "Please choose a valid team." }
  }

  const incoming = input.answers ?? {}

  // Reject unexpected keys before validating the known ones.
  for (const key of Object.keys(incoming)) {
    if (!QUESTION_IDS.has(key)) {
      return { ok: false, error: "Unexpected answer in submission." }
    }
  }

  // Validate each question against its own format.
  const clean: AnswerMap = {}
  for (const q of QUESTIONS) {
    const v: AnswerValue | undefined = incoming[q.id]

    if (q.kind === "text") {
      if (v === undefined || v === "") continue
      if (typeof v !== "string") {
        return { ok: false, error: "Unexpected answer in submission." }
      }
      const trimmed = v.trim().slice(0, MAX_TEXT_LENGTH)
      if (trimmed) clean[q.id] = trimmed
      continue
    }

    if (q.kind === "multi") {
      if (!Array.isArray(v) || v.some((item) => typeof item !== "string")) {
        return { ok: false, error: "Please answer every question before submitting." }
      }
      const allowed = new Set(q.options.map((o) => o.id))
      const unique = [...new Set(v)]
      if (unique.some((id) => !allowed.has(id))) {
        return { ok: false, error: "Unexpected answer in submission." }
      }
      clean[q.id] = unique
      continue
    }

    // scale + choice both store a plain 1-5 integer.
    if (typeof v !== "number" || !Number.isInteger(v) || v < SCALE_MIN || v > SCALE_MAX) {
      return { ok: false, error: "Please answer every question before submitting." }
    }
    if (q.kind === "choice" && !q.options.some((o) => o.value === v)) {
      return { ok: false, error: "Unexpected answer in submission." }
    }
    clean[q.id] = v
  }

  const role = (input.role ?? "").trim().slice(0, 80) || null

  try {
    await db.insert(submissions).values({ team, role, answers: clean })
    revalidatePath("/dashboard")
    return { ok: true }
  } catch (e) {
    console.error("submitAssessment error:", (e as Error).message)
    return { ok: false, error: "Something went wrong saving your response. Please try again." }
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const rows = await db
    .select({
      team: submissions.team,
      role: submissions.role,
      answers: submissions.answers,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .orderBy(desc(submissions.createdAt))

  return buildDashboard(
    rows.map((r) => ({
      team: r.team,
      role: r.role,
      answers: (r.answers ?? {}) as AnswerMap,
      createdAt: r.createdAt,
    })),
  )
}
