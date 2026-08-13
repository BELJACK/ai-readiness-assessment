// ---------------------------------------------------------------------------
// AI readiness assessment definition + scoring engine
// ---------------------------------------------------------------------------
// Every question is answered on a 1-5 Likert scale. Each question belongs to a
// "dimension" of AI readiness. Scores are averaged and normalized to 0-100 so
// the business can compare people, teams, and dimensions on one scale.
// ---------------------------------------------------------------------------

export const TEAMS = [
  "Sales",
  "Engineering",
  "Operations",
  "Marketing",
  "Customer Success",
  "People & HR",
  "Finance",
  "Leadership",
] as const

export type Team = (typeof TEAMS)[number]

export type DimensionId = "tooling" | "skills" | "adoption" | "data" | "culture"

export type Dimension = {
  id: DimensionId
  label: string
  blurb: string
  // Guidance shown as an upskilling recommendation when this dimension scores low.
  recommendation: string
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "skills",
    label: "Skills & Confidence",
    blurb: "How capable and confident people feel using AI in their work.",
    recommendation:
      "Run hands-on workshops and role-specific prompt clinics. Awareness sessions alone will not move this score.",
  },
  {
    id: "adoption",
    label: "Adoption & Habits",
    blurb: "How regularly AI shows up in day-to-day work.",
    recommendation:
      "Put shared prompt libraries inside existing workflows and review time saved weekly. Trials become habits when they are visible.",
  },
  {
    id: "tooling",
    label: "Tooling & Access",
    blurb: "Whether people have the right, approved AI tools available.",
    recommendation:
      "Approve one toolset, remove request friction, and publish a short guide covering what to use for which task.",
  },
  {
    id: "data",
    label: "Data & Process",
    blurb: "Whether data and processes are ready to support AI use.",
    recommendation:
      "Document your highest-volume workflows and clean the data behind them. Start where the repetition is worst.",
  },
  {
    id: "culture",
    label: "Culture & Leadership",
    blurb: "Whether leadership actively encourages safe AI adoption.",
    recommendation:
      "Publish clear usage rules and have leaders work in the open. People experiment once they know what is allowed.",
  },
]

export const DIMENSION_MAP: Record<DimensionId, Dimension> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d]),
) as Record<DimensionId, Dimension>

// The assessment mixes formats so it reads like a real questionnaire rather
// than one control repeated eight times. Every format still resolves to a
// 1-5 value so the scoring model stays a single transparent scale.
export type Question =
  | {
      kind: "scale"
      id: string
      dimension: DimensionId
      text: string
      lowLabel?: string
      highLabel?: string
    }
  | {
      kind: "choice"
      id: string
      dimension: DimensionId
      text: string
      help?: string
      options: { value: number; label: string; description: string }[]
    }
  | {
      kind: "multi"
      id: string
      dimension: DimensionId
      text: string
      help?: string
      // Selecting more of these signals higher readiness; scored by coverage.
      options: { id: string; label: string }[]
    }
  | {
      kind: "text"
      id: string
      dimension: DimensionId
      text: string
      help?: string
      placeholder?: string
    }

// A single answer, before scoring.
export type AnswerValue = number | string[] | string

export const QUESTIONS: Question[] = [
  {
    kind: "choice",
    id: "q_familiarity",
    dimension: "skills",
    text: "How would you describe your familiarity with AI tools?",
    help: "Pick the closest match.",
    options: [
      { value: 1, label: "New to it", description: "I've heard of them but haven't really used them." },
      { value: 2, label: "Experimenting", description: "I've tried a few things out of curiosity." },
      { value: 3, label: "Occasional user", description: "I reach for them now and then for specific tasks." },
      { value: 4, label: "Regular user", description: "They're a normal part of how I work." },
      { value: 5, label: "Power user", description: "I build workflows with them and help others do the same." },
    ],
  },
  {
    kind: "scale",
    id: "q_confidence",
    dimension: "skills",
    text: "I feel confident using AI tools to help with my work.",
    lowLabel: "Not confident",
    highLabel: "Very confident",
  },
  {
    kind: "scale",
    id: "q_prompting",
    dimension: "skills",
    text: "I know how to write effective prompts to get useful results.",
    lowLabel: "Not at all",
    highLabel: "Very well",
  },
  {
    kind: "scale",
    id: "q_frequency",
    dimension: "adoption",
    text: "I use AI tools as part of my daily or weekly work.",
    lowLabel: "Never",
    highLabel: "Every day",
  },
  {
    kind: "scale",
    id: "q_impact",
    dimension: "adoption",
    text: "AI meaningfully speeds up or improves tasks I own.",
    lowLabel: "Not yet",
    highLabel: "Significantly",
  },
  {
    kind: "multi",
    id: "q_automatable",
    dimension: "adoption",
    text: "Which of these do you do often enough that automating them would help?",
    help: "Select all that apply. This shows us where the time goes.",
    options: [
      { id: "summarising", label: "Summarising long documents" },
      { id: "drafting", label: "Drafting emails or docs" },
      { id: "research", label: "Research and background reading" },
      { id: "data_entry", label: "Repetitive data entry" },
      { id: "reporting", label: "Building recurring reports" },
      { id: "meetings", label: "Meeting notes and follow-ups" },
    ],
  },
  {
    kind: "scale",
    id: "q_access",
    dimension: "tooling",
    text: "I have access to the AI tools I need, and know which are approved.",
    lowLabel: "No access",
    highLabel: "Full access",
  },
  {
    kind: "scale",
    id: "q_data",
    dimension: "data",
    text: "The data and processes I rely on are organized enough for AI to help.",
    lowLabel: "Very messy",
    highLabel: "Well organized",
  },
  {
    kind: "scale",
    id: "q_leadership",
    dimension: "culture",
    text: "Leadership actively encourages my team to adopt AI.",
    lowLabel: "Not at all",
    highLabel: "Strongly",
  },
  {
    kind: "scale",
    id: "q_safety",
    dimension: "culture",
    text: "I understand what safe and acceptable AI use looks like here.",
    lowLabel: "Unclear",
    highLabel: "Very clear",
  },
  {
    kind: "text",
    id: "q_blocker",
    dimension: "culture",
    text: "What's the biggest thing holding you back from using AI more?",
    help: "Optional. One sentence is enough.",
    placeholder: "e.g. I'm not sure what's allowed with customer data",
  },
]

// Questions that produce a score. Text answers are qualitative context only.
export const SCORED_QUESTIONS = QUESTIONS.filter((q) => q.kind !== "text")

export function isAnswered(q: Question, value: AnswerValue | undefined): boolean {
  if (q.kind === "text") return true // always optional
  if (q.kind === "multi") return Array.isArray(value)
  return typeof value === "number"
}

export const SCALE_MIN = 1
export const SCALE_MAX = 5

// A single stored assessment response.
export type AnswerMap = Record<string, AnswerValue>

// Resolve any answer format to the shared 1-5 scale, or null if unscored.
export function scoreOf(q: Question, value: AnswerValue | undefined): number | null {
  if (value === undefined) return null

  if (q.kind === "scale" || q.kind === "choice") {
    if (typeof value !== "number" || !Number.isFinite(value)) return null
    if (value < SCALE_MIN || value > SCALE_MAX) return null
    return value
  }

  if (q.kind === "multi") {
    if (!Array.isArray(value)) return null
    // Lots of automatable manual work means low current readiness, so the score
    // runs inversely to how many items were selected.
    const valid = value.filter((id) => q.options.some((o) => o.id === id))
    const ratio = valid.length / q.options.length
    return SCALE_MAX - ratio * (SCALE_MAX - SCALE_MIN)
  }

  return null
}

// Convert a raw 1-5 average into a 0-100 readiness score.
export function toScore(avg: number): number {
  return Math.round(((avg - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100)
}

export type ReadinessLevel = {
  label: string
  // token-based color key used by the UI
  tone: "critical" | "emerging" | "developing" | "advanced"
}

// Bands are fixed by the assessment spec: 0-39 Low, 40-59 Emerging,
// 60-79 Ready, 80-100 Advanced.
export function levelForScore(score: number): ReadinessLevel {
  if (score < 40) return { label: "Low", tone: "critical" }
  if (score < 60) return { label: "Emerging", tone: "emerging" }
  if (score < 80) return { label: "Ready", tone: "developing" }
  return { label: "Advanced", tone: "advanced" }
}

export const LEVEL_BLURB: Record<ReadinessLevel["tone"], string> = {
  critical: "Few people use AI in their daily work. Start with access and basic training.",
  emerging: "Some people are getting value from AI. The gap is habit, not interest.",
  developing: "AI is in regular use but spread unevenly. Your weakest capability sets the ceiling.",
  advanced: "AI is part of how work gets done. Focus on depth and the teams still behind.",
}

// Plain-language explanation of how the number was produced, shown under the score.
export const SCORING_EXPLAINER =
  "Every answer maps to a 0-100 value. Those roll up into five capability scores, then a team score, then the company score."

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export type RawSubmission = {
  team: string
  role?: string | null
  answers: AnswerMap
  createdAt?: Date | string | null
}

export type DimensionScore = {
  id: DimensionId
  label: string
  score: number
  recommendation: string
}

export type TeamScore = {
  team: string
  score: number
  responses: number
  dimensions: DimensionScore[]
}

export type Recommendation = {
  dimension: DimensionId
  label: string
  score: number
  text: string
  // Teams that are dragging this dimension down the most.
  weakestTeams: { team: string; score: number }[]
}

export type DashboardData = {
  totalResponses: number
  overallScore: number
  dimensions: DimensionScore[]
  teams: TeamScore[]
  recommendations: Recommendation[]
  lastResponseAt: string | null
  // Score of the responses received in each period, oldest first. Empty when
  // there is not enough history to be worth plotting.
  trend: { label: string; score: number; responses: number }[]
  // Change between the first and last period, or null when there is no trend.
  trendDelta: number | null
  // Free-text answers, newest first, for qualitative context under the numbers.
  voices: { team: string; role: string | null; text: string }[]
  // Most-selected automation opportunities across the business.
  opportunities: { label: string; count: number; share: number }[]
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

// Average score (0-100) for a set of submissions restricted to one dimension.
function dimensionScore(subs: RawSubmission[], dimension: DimensionId): number {
  const questions = SCORED_QUESTIONS.filter((q) => q.dimension === dimension)
  const values: number[] = []
  for (const s of subs) {
    for (const q of questions) {
      const v = scoreOf(q, s.answers[q.id])
      if (v !== null) values.push(v)
    }
  }
  if (values.length === 0) return 0
  return toScore(mean(values))
}

// Overall score (0-100) across every answered question in a set.
function overall(subs: RawSubmission[]): number {
  const values: number[] = []
  for (const s of subs) {
    for (const q of SCORED_QUESTIONS) {
      const v = scoreOf(q, s.answers[q.id])
      if (v !== null) values.push(v)
    }
  }
  return toScore(mean(values))
}

export function buildDashboard(subs: RawSubmission[]): DashboardData {
  const totalResponses = subs.length

  const dimensions: DimensionScore[] = DIMENSIONS.map((d) => ({
    id: d.id,
    label: d.label,
    score: dimensionScore(subs, d.id),
    recommendation: d.recommendation,
  }))

  // Group by team.
  const byTeam = new Map<string, RawSubmission[]>()
  for (const s of subs) {
    const list = byTeam.get(s.team) ?? []
    list.push(s)
    byTeam.set(s.team, list)
  }

  const teams: TeamScore[] = [...byTeam.entries()]
    .map(([team, teamSubs]) => ({
      team,
      score: overall(teamSubs),
      responses: teamSubs.length,
      dimensions: DIMENSIONS.map((d) => ({
        id: d.id,
        label: d.label,
        score: dimensionScore(teamSubs, d.id),
        recommendation: d.recommendation,
      })),
    }))
    .sort((a, b) => b.score - a.score)

  // Recommendations: the two weakest dimensions overall, with the teams that
  // most need help in each.
  const recommendations: Recommendation[] = [...dimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((d) => {
      const weakestTeams = teams
        .map((t) => ({
          team: t.team,
          score: t.dimensions.find((td) => td.id === d.id)?.score ?? 0,
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 2)
      return {
        dimension: d.id,
        label: d.label,
        score: d.score,
        text: DIMENSION_MAP[d.id].recommendation,
        weakestTeams,
      }
    })

  // Qualitative context: the free-text question, newest first.
  const textQuestion = QUESTIONS.find((q) => q.kind === "text")
  const voices = textQuestion
    ? subs
        .map((s) => ({
          team: s.team,
          role: s.role ?? null,
          text: typeof s.answers[textQuestion.id] === "string" ? (s.answers[textQuestion.id] as string) : "",
        }))
        .filter((v) => v.text.trim().length > 0)
        // Two people can phrase a blocker identically; show each point once.
        .filter((v, i, all) => all.findIndex((o) => o.text === v.text) === i)
        .slice(0, 4)
    : []

  // Which manual tasks come up most often across the business.
  const multiQuestion = QUESTIONS.find((q) => q.kind === "multi")
  let opportunities: DashboardData["opportunities"] = []
  if (multiQuestion && multiQuestion.kind === "multi") {
    const counts = new Map<string, number>()
    let answeredCount = 0
    for (const s of subs) {
      const v = s.answers[multiQuestion.id]
      if (!Array.isArray(v)) continue
      answeredCount++
      for (const id of new Set(v)) {
        counts.set(id, (counts.get(id) ?? 0) + 1)
      }
    }
    if (answeredCount > 0) {
      opportunities = multiQuestion.options
        .map((o) => ({
          label: o.label,
          count: counts.get(o.id) ?? 0,
          share: Math.round(((counts.get(o.id) ?? 0) / answeredCount) * 100),
        }))
        .filter((o) => o.count > 0)
        .sort((a, b) => b.count - a.count)
    }
  }

  const timestamps = subs
    .map((s) => (s.createdAt ? new Date(s.createdAt).getTime() : NaN))
    .filter((n) => Number.isFinite(n))
  const lastResponseAt =
    timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null

  // Bucket responses by month and score each bucket on its own. This answers
  // "is this improving", which a single snapshot cannot.
  const trend = buildTrend(subs)
  const trendDelta =
    trend.length >= 2 ? trend[trend.length - 1].score - trend[0].score : null

  return {
    trend,
    trendDelta,
    totalResponses,
    overallScore: totalResponses === 0 ? 0 : overall(subs),
    dimensions,
    teams,
    recommendations,
    lastResponseAt,
    voices,
    opportunities,
  }
}


// Group submissions into calendar months and score each month independently.
// Fewer than two populated months means there is no trend worth showing.
function buildTrend(subs: RawSubmission[]): DashboardData["trend"] {
  const dated = subs
    .map((s) => ({ sub: s, at: s.createdAt ? new Date(s.createdAt) : null }))
    .filter((x): x is { sub: RawSubmission; at: Date } => x.at !== null && !isNaN(x.at.getTime()))

  if (dated.length < 4) return []

  const buckets = new Map<string, { at: Date; subs: RawSubmission[] }>()
  for (const { sub, at } of dated) {
    const key = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}`
    const bucket = buckets.get(key) ?? { at: new Date(at.getFullYear(), at.getMonth(), 1), subs: [] }
    bucket.subs.push(sub)
    buckets.set(key, bucket)
  }

  const ordered = [...buckets.values()].sort((a, b) => a.at.getTime() - b.at.getTime())
  if (ordered.length < 2) return []

  return ordered.map((b) => ({
    label: b.at.toLocaleDateString("en-GB", { month: "short" }),
    score: overall(b.subs),
    responses: b.subs.length,
  }))
}
