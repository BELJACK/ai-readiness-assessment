"use client"

import { SCALE_MAX, SCALE_MIN, type AnswerValue, type Question } from "@/lib/assessment"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const SCALE = Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => SCALE_MIN + i)

export function QuestionCard({
  question,
  value,
  onChange,
}: {
  question: Question
  value: AnswerValue | undefined
  onChange: (value: AnswerValue, opts?: { advance?: boolean }) => void
}) {
  // ---- 1-5 Likert ---------------------------------------------------------
  if (question.kind === "scale") {
    return (
      <div>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {SCALE.map((n) => {
            const active = value === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n, { advance: true })}
                aria-pressed={active}
                aria-label={`${n} out of ${SCALE_MAX}`}
                className={cn(
                  "numeric flex h-16 items-center justify-center rounded-xl border text-lg font-semibold transition-all sm:h-20 sm:text-xl",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-hairline bg-panel text-muted-foreground hover:-translate-y-0.5 hover:border-primary/50 hover:text-foreground hover:shadow-sm",
                )}
              >
                {n}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{question.lowLabel ?? "Strongly disagree"}</span>
          <span>{question.highLabel ?? "Strongly agree"}</span>
        </div>
      </div>
    )
  }

  // ---- Radio cards --------------------------------------------------------
  if (question.kind === "choice") {
    return (
      <div className="flex flex-col gap-2">
        {question.options.map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value, { advance: true })}
              aria-pressed={active}
              className={cn(
                "flex items-start gap-4 rounded-xl border p-4 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-primary bg-primary/8 shadow-sm"
                  : "border-hairline bg-panel hover:border-primary/40 hover:shadow-sm",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active ? "border-primary bg-primary" : "border-border",
                )}
              >
                {active ? (
                  <Check className="size-3 text-primary-foreground" strokeWidth={3.5} />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  // ---- Multi-select chips -------------------------------------------------
  if (question.kind === "multi") {
    const selected = Array.isArray(value) ? value : []
    return (
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const active = selected.includes(option.id)
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange(
                  active ? selected.filter((id) => id !== option.id) : [...selected, option.id],
                )
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-hairline bg-panel text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center border transition-colors",
                  active ? "border-primary bg-primary" : "border-border",
                )}
              >
                {active ? (
                  <Check className="size-2.5 text-primary-foreground" strokeWidth={4} />
                ) : null}
              </span>
              {option.label}
            </button>
          )
        })}
      </div>
    )
  }

  // ---- Free text ----------------------------------------------------------
  return (
    <textarea
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      rows={4}
      maxLength={500}
      className="w-full resize-none rounded-xl border border-hairline bg-panel p-4 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary"
    />
  )
}
