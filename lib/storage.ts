/**
 * Session-local persistence for the assessment.
 *
 * Two jobs:
 *  - keep in-progress answers so a refresh mid-questionnaire doesn't lose work
 *  - keep the last completed result so the success screen survives a reload
 *
 * Everything is best-effort: private browsing and disabled storage must not
 * break the flow, so every call is wrapped.
 */
import type { AnswerMap } from "@/lib/assessment"

const DRAFT_KEY = "compass.assessment.draft.v2"
const RESULT_KEY = "compass.assessment.result.v2"

export type Draft = {
  team: string
  role: string
  answers: AnswerMap
  step: number
}

export type StoredResult = {
  team: string
  role: string
  answers: AnswerMap
  score: number
  completedAt: string
}

function read<T>(storage: Storage | undefined, key: string): T | null {
  try {
    const raw = storage?.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(storage: Storage | undefined, key: string, value: unknown): void {
  try {
    storage?.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable. The flow still works in memory.
  }
}

function remove(storage: Storage | undefined, key: string): void {
  try {
    storage?.removeItem(key)
  } catch {
    // ignore
  }
}

const session = () => (typeof window === "undefined" ? undefined : window.sessionStorage)
const local = () => (typeof window === "undefined" ? undefined : window.localStorage)

export const loadDraft = () => read<Draft>(session(), DRAFT_KEY)
export const saveDraft = (draft: Draft) => write(session(), DRAFT_KEY, draft)
export const clearDraft = () => remove(session(), DRAFT_KEY)

export const loadResult = () => read<StoredResult>(local(), RESULT_KEY)
export const saveResult = (result: StoredResult) => write(local(), RESULT_KEY, result)
export const clearResult = () => remove(local(), RESULT_KEY)
