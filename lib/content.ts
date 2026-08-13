/**
 * Copy for the public tool page. Kept out of the component so the same text
 * feeds both the rendered page and the structured data in the document head.
 */

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is an AI readiness assessment?",
    a: "It is a structured review of how prepared an organisation is to adopt AI. Instead of one yes or no answer, it scores a fixed set of capabilities, then shows which ones are holding you back. The output is a score, a readiness band, and a ranked list of what to fix first.",
  },
  {
    q: "How is the score calculated?",
    a: "Every answer maps to a value between 0 and 100. Those values are averaged into five capability scores, then averaged again into one overall score. Scoring each capability separately is what makes the result useful, because an organisation can be strong on tooling and weak on governance, and a single number would hide that.",
  },
  {
    q: "How long does it take?",
    a: "About three minutes. There are 11 questions using rating scales, single choices, and multi-select, plus one optional comment.",
  },
  {
    q: "Do I need to sign up?",
    a: "No. There is no account, no email step, and no payment. Your score and full breakdown appear on the page as soon as you finish.",
  },
  {
    q: "What do you store?",
    a: "Your team, an optional job title, and your answers. No name, no email, no IP address. Results are only ever shown as team averages, never as individual responses.",
  },
  {
    q: "Can my whole company take it?",
    a: "Yes, and that is the point. Share one link across your teams. As answers arrive, the overview page fills in with a company score, a ranked breakdown by team, and the capabilities to train first.",
  },
  {
    q: "Is my score benchmarked against other companies?",
    a: "Not yet. Your score reflects only the answers your own people give. Cross-company benchmarking is not something we can do honestly without a much larger sample.",
  },
  {
    q: "Who should take it?",
    a: "Anyone doing the work. The questions ask about your own day to day, so no technical background is needed. Leaders get the most from it once enough of their team has responded.",
  },
]

export const GLOSSARY: { term: string; definition: string }[] = [
  {
    term: "AI readiness",
    definition:
      "How prepared an organisation is to adopt AI, measured across skills, daily habits, tooling, data quality, and leadership.",
  },
  {
    term: "Readiness band",
    definition:
      "A plain label for the overall score: Low, Emerging, Ready, or Advanced. It exists so the number means something without a chart next to it.",
  },
  {
    term: "Capability",
    definition:
      "One of the five areas scored separately. Every question belongs to exactly one, which is what turns a low score into a specific thing to fix.",
  },
]

/** Insight content: what separates companies that get value from AI. */
export const SUCCESS_FACTORS: { title: string; body: string }[] = [
  {
    title: "One named owner, not a committee",
    body: "Adoption moves when a single person is accountable for it. Where AI is everyone's side project, it stays a side project.",
  },
  {
    title: "Rules published before tools arrive",
    body: "The most common blocker is not capability, it is permission. People stop when they cannot tell whether an action is allowed.",
  },
  {
    title: "One workflow fixed properly",
    body: "Teams that pick a single repetitive workflow and finish it get further than teams planning a broad transformation.",
  },
]

/** Reasons to run the assessment, framed as outcomes. */
export const BENEFITS: { title: string; body: string }[] = [
  {
    title: "A number, not a hunch",
    body: "A score out of 100 across five capabilities, so you can say where you stand without guessing.",
  },
  {
    title: "The gap, located",
    body: "Scoring each capability separately shows which one is holding you back, and which teams feel it worst.",
  },
  {
    title: "A next step you can fund",
    body: "Recommendations point at your lowest capability and name the teams to start with, so the work has a scope.",
  },
]

/** Self-identification: helps a visitor decide in seconds whether this is for them. */
export const AUDIENCE: string[] = [
  "Your leadership team disagrees about how ready the company actually is",
  "People are using AI, but nobody can tell you who, how much, or how well",
  "You are about to fund AI training and want to know where to point it",
  "A pilot stalled and you cannot tell whether it was the tool or the ground it landed on",
  "You need a number for a board conversation rather than an opinion",
  "You suspect one or two teams are far behind, but cannot prove it",
]

/** The concrete outputs, so nobody has to guess what they get. */
export const DELIVERABLES: string[] = [
  "An overall readiness score from 0 to 100 with a plain-language band",
  "Scores for each of the five capabilities, so the gap has a name",
  "Every team ranked, with the one capability each should fix first",
  "Three ranked upskilling priorities, each naming the teams to start with",
  "The manual work your teams most want automated",
  "Readiness tracked month over month as more people respond",
  "A printable report and a CSV of every score",
]
