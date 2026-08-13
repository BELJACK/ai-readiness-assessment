"use client"

import { submitAssessment } from "@/app/actions/assessment"
import { QuestionCard } from "@/components/assessment/question-card"
import { ScoreRing } from "@/components/score-ring"
import {
  DIMENSION_MAP,
  QUESTIONS,
  SCORED_QUESTIONS,
  TEAMS,
  isAnswered,
  levelForScore,
  scoreOf,
  toScore,
  type AnswerMap,
  type AnswerValue,
} from "@/lib/assessment"
import { clearDraft, clearResult, loadDraft, loadResult, saveDraft, saveResult } from "@/lib/storage"
import { TONE_CLASSES } from "@/lib/tone"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Phase = "form" | "submitting" | "done"

const TOTAL = QUESTIONS.length

export function AssessmentFlow() {
  const [step, setStep] = useState(0) // 0 = intro, 1..TOTAL = questions
  const [team, setTeam] = useState("")
  const [role, setRole] = useState("")
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [phase, setPhase] = useState<Phase>("form")
  const [error, setError] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [restored, setRestored] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [direction, setDirection] = useState(1)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ---- Draft persistence ---------------------------------------------------
  useEffect(() => {
    // A finished result wins over a draft: the person already submitted.
    const done = loadResult()
    if (done && Object.keys(done.answers ?? {}).length > 0) {
      setTeam(done.team ?? "")
      setRole(done.role ?? "")
      setAnswers(done.answers ?? {})
      setPhase("done")
      setHydrated(true)
      return
    }

    const draft = loadDraft()
    if (draft && Object.keys(draft.answers ?? {}).length > 0) {
      setTeam(draft.team ?? "")
      setRole(draft.role ?? "")
      setAnswers(draft.answers ?? {})
      setStep(Math.min(TOTAL, Math.max(0, draft.step ?? 0)))
      setRestored(true)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || phase === "done") return
    saveDraft({ team, role, answers, step })
  }, [hydrated, team, role, answers, step, phase])

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  // Each step is a new screen, so start it at the top rather than wherever the
  // previous one was scrolled to. Skipped on first paint and for reduced motion.
  useEffect(() => {
    if (!hydrated) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
  }, [step, phase, hydrated])

  const answeredCount = useMemo(
    () => SCORED_QUESTIONS.filter((q) => isAnswered(q, answers[q.id])).length,
    [answers],
  )

  const personalScore = useMemo(() => {
    const values = SCORED_QUESTIONS.map((q) => scoreOf(q, answers[q.id])).filter(
      (v): v is number => v !== null,
    )
    if (values.length === 0) return 0
    return toScore(values.reduce((a, b) => a + b, 0) / values.length)
  }, [answers])

  const handleSubmit = useCallback(
    async (finalAnswers: AnswerMap, finalTeam: string, finalRole: string) => {
      setPhase("submitting")
      setError(null)
      const res = await submitAssessment({ team: finalTeam, role: finalRole, answers: finalAnswers })
      if (res.ok) {
        const values = SCORED_QUESTIONS.map((q) => scoreOf(q, finalAnswers[q.id])).filter(
          (v): v is number => v !== null,
        )
        const score = values.length
          ? toScore(values.reduce((a, b) => a + b, 0) / values.length)
          : 0
        saveResult({
          team: finalTeam,
          role: finalRole,
          answers: finalAnswers,
          score,
          completedAt: new Date().toISOString(),
        })
        clearDraft()
        setPhase("done")
      } else {
        setError(res.error ?? "Something went wrong.")
        setPhase("form")
      }
    },
    [],
  )

  // Index (1-based step) of the first scored question left blank, or null.
  const firstGap = useMemo(() => {
    const i = QUESTIONS.findIndex((q) => q.kind !== "text" && !isAnswered(q, answers[q.id]))
    return i === -1 ? null : i + 1
  }, [answers])

  const question = step > 0 ? QUESTIONS[step - 1] : null
  const isLastQuestion = step === TOTAL
  const currentAnswered = question ? isAnswered(question, answers[question.id]) : false

  function goNext() {
    if (question && !currentAnswered) {
      setShowValidation(true)
      return
    }
    setShowValidation(false)
    setDirection(1)
    if (isLastQuestion) {
      // Don't submit a form with a hole in it. Jump back to the gap and say so.
      if (firstGap !== null) {
        setDirection(-1)
        setStep(firstGap)
        setError(
          `Question ${firstGap} of ${TOTAL} still needs an answer. We've taken you back to it.`,
        )
        return
      }
      void handleSubmit(answers, team, role)
    } else {
      setStep((s) => Math.min(TOTAL, s + 1))
    }
  }

  function handleAnswer(value: AnswerValue, opts?: { advance?: boolean }) {
    if (!question) return
    const next = { ...answers, [question.id]: value }
    setAnswers(next)
    setShowValidation(false)
    setError(null)

    // Single-choice formats advance on their own; multi-select and text need
    // an explicit Next since the person may still be adding to their answer.
    if (!opts?.advance) return
    setDirection(1)
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => {
      if (isLastQuestion) {
        const gap = QUESTIONS.findIndex((q) => q.kind !== "text" && !isAnswered(q, next[q.id]))
        if (gap !== -1) {
          setDirection(-1)
          setStep(gap + 1)
          setError(
            `Question ${gap + 1} of ${TOTAL} still needs an answer. We've taken you back to it.`,
          )
          return
        }
        void handleSubmit(next, team, role)
      } else {
        setStep((s) => Math.min(TOTAL, s + 1))
      }
    }, 240)
  }

  // ---- Submitting ----------------------------------------------------------
  if (phase === "submitting") {
    return (
      <Shell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <span className="relative flex size-14 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <span className="relative flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </span>
          </span>
          <h1 className="mt-8 text-xl font-semibold tracking-tight sm:text-2xl">
            Scoring your answers
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Adding them to the {team} results.
          </p>
        </div>
      </Shell>
    )
  }

  // ---- Done ----------------------------------------------------------------
  if (phase === "done") {
    const level = levelForScore(personalScore)
    const tone = TONE_CLASSES[level.tone]
    const spread = dimensionSpread(answers)

    return (
      <Shell>
        <div className="flex flex-col items-center py-12 text-center sm:py-16">
          <span className={cn("animate-pop-in flex size-12 items-center justify-center rounded-full", tone.softBg)}>
            <Check className={cn("size-6", tone.text)} strokeWidth={2.5} />
          </span>
          <h1 className="mt-6 text-balance text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl">
            Your response is in.
          </h1>
          <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Your answers now count toward the {team} score. Here is where you landed.
          </p>

          <div className="panel mt-8 w-full overflow-hidden">
            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8 sm:text-left">
              <ScoreRing score={personalScore} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Your readiness
                </p>
                <p className="mt-2 text-balance text-lg font-medium leading-snug tracking-tight text-foreground">
                  You scored <span className={tone.text}>{level.label}</span> across the five
                  capabilities.
                </p>
                <dl className="mt-6 grid gap-3 border-t border-hairline pt-6 sm:grid-cols-2">
                  {spread ? (
                    <>
                      <Snapshot label="Strongest" value={spread.strongest} tone="advanced" />
                      <Snapshot label="Biggest gap" value={spread.weakest} tone="emerging" />
                    </>
                  ) : (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Spread
                      </dt>
                      <dd className="mt-1 text-sm text-muted-foreground">
                        You rated every capability the same, so no single area stands out.
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View the business dashboard
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => {
              clearResult()
              clearDraft()
              setAnswers({})
              setTeam("")
              setRole("")
              setStep(0)
              setPhase("form")
            }}
            className="mt-6 text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Take it again
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            Individual answers stay anonymous. Only team averages are shown.
          </p>
        </div>
      </Shell>
    )
  }

  // ---- Intro ---------------------------------------------------------------
  if (step === 0) {
    return (
      <Shell>
        <div className="py-10 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Before we start
          </p>
          <h1 className="mt-2 text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-4xl">
            Which team are you on?
          </h1>
          <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            This is anonymous. Your team is used to group results. No names are stored.
          </p>

          {restored ? (
            <p className="mt-6 flex items-start gap-2 rounded-xl border border-hairline bg-inset px-4 py-3 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-tone-advanced" />
              We saved your answers from earlier. Pick up where you left off.
            </p>
          ) : null}

          <fieldset className="mt-8">
            <legend className="text-sm font-medium text-foreground">Team</legend>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TEAMS.map((t) => {
                const active = team === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTeam(t)}
                    aria-pressed={active}
                    className={cn(
                      "relative flex h-12 items-center rounded-xl border pl-3.5 pr-9 text-left text-[13px] font-medium transition-all sm:text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? "border-primary bg-primary/8 text-foreground shadow-sm"
                        : "border-hairline bg-panel text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <span className="truncate">{t}</span>
                    {active ? (
                      <span className="absolute right-3 flex size-4 items-center justify-center rounded-full bg-primary">
                        <Check className="size-2.5 text-primary-foreground" strokeWidth={3.5} />
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="mt-8">
            <label htmlFor="role" className="text-sm font-medium text-foreground">
              Role <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Account Executive"
              maxLength={80}
              className="mt-4 h-12 w-full rounded-xl border border-hairline bg-panel px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="button"
            disabled={!team}
            onClick={() => setStep(1)}
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {answeredCount > 0 ? "Continue assessment" : "Start assessment"}
            <ArrowRight className="ml-1.5 size-4" />
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {TOTAL} questions. About 3 minutes. Anonymous.
          </p>
        </div>
      </Shell>
    )
  }

  if (!question) return null
  const dimension = DIMENSION_MAP[question.dimension]
  const optional = question.kind === "text"

  return (
    <Shell>
      <div className="py-8 sm:py-12">
        <Stepper current={step} total={TOTAL} answered={answeredCount} />

        <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={step}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
        <div className="mt-8">
          <span className="inline-flex items-center rounded-full bg-inset px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {dimension.label}
          </span>
          <h1 className="mt-4 text-balance text-[1.5rem] font-semibold leading-snug tracking-tight sm:text-[1.9rem]">
            {question.text}
          </h1>
          {"help" in question && question.help ? (
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              {question.help}
            </p>
          ) : null}
        </div>

        <div className="mt-8">
          <QuestionCard question={question} value={answers[question.id]} onChange={handleAnswer} />
        </div>
        </motion.div>
        </AnimatePresence>

        {showValidation && !currentAnswered ? (
          <p
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            Please choose an answer before continuing.
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-hairline pt-6">
          <button
            type="button"
            onClick={() => {
              setShowValidation(false)
              setDirection(-1)
              setStep((s) => Math.max(0, s - 1))
            }}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          <button
            type="button"
            onClick={goNext}
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              currentAnswered || optional
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "bg-inset text-muted-foreground hover:text-foreground",
            )}
          >
            {isLastQuestion ? "Submit" : optional && !currentAnswered ? "Skip" : "Next"}
            <ArrowRight className="ml-1.5 size-4" />
          </button>
        </div>
      </div>
    </Shell>
  )
}

// ---------------------------------------------------------------------------

// Spring physics rather than eased keyframes: the step settles instead of
// stopping, which reads as physical on a stepped form.
const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.9 },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -20 : 20,
    transition: { duration: 0.14, ease: "easeIn" as const },
  }),
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">{children}</div>
}

function Stepper({
  current,
  total,
  answered,
}: {
  current: number
  total: number
  answered: number
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs font-medium">
        <span className="text-foreground">
          Question <span className="numeric">{current}</span> of{" "}
          <span className="numeric">{total}</span>
        </span>
        <span className="text-muted-foreground">
          <span className="numeric">{answered}</span> answered
        </span>
      </div>
      <div
        className="mt-2 flex gap-1"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        {Array.from({ length: total }, (_, i) => {
          const index = i + 1
          return (
            <span
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                index < current ? "bg-primary/45" : index === current ? "bg-primary" : "bg-inset",
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

function Snapshot({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "advanced" | "emerging"
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("mt-1 text-sm font-semibold", TONE_CLASSES[tone].text)}>{value}</dd>
    </div>
  )
}

// Best and worst dimension for this person. Null when everything ties, since
// "strongest" and "biggest gap" would otherwise name the same area.
function dimensionSpread(answers: AnswerMap): { strongest: string; weakest: string } | null {
  const byDimension = new Map<string, number[]>()
  for (const q of SCORED_QUESTIONS) {
    const v = scoreOf(q, answers[q.id])
    if (v === null) continue
    const list = byDimension.get(q.dimension) ?? []
    list.push(v)
    byDimension.set(q.dimension, list)
  }

  const ranked = [...byDimension.entries()]
    .map(([id, vals]) => ({
      label: DIMENSION_MAP[id as keyof typeof DIMENSION_MAP].label,
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    }))
    .sort((a, b) => b.avg - a.avg)

  const top = ranked[0]
  const bottom = ranked[ranked.length - 1]
  if (!top || !bottom || top.avg === bottom.avg) return null
  return { strongest: top.label, weakest: bottom.label }
}
