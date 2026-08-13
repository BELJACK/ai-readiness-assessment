import { AssessmentFlow } from "@/components/assessment/assessment-flow"
import { SiteHeader } from "@/components/site-header"

export const metadata = {
  title: "Take the assessment | Compass",
  description: "A few short questions about how you use AI in your work.",
}

export default function AssessPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader action={{ href: "/dashboard", label: "Dashboard", variant: "ghost" }} />
      <main>
        <AssessmentFlow />
      </main>
    </div>
  )
}
