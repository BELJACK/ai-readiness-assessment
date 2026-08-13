import { getDashboardData } from "@/app/actions/assessment"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { EmptyState } from "@/components/dashboard/empty-state"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Business overview | Compass",
  description:
    "Overall AI readiness, a breakdown by team, and the capabilities to upskill first.",
}

async function Dashboard() {
  const data = await getDashboardData()
  if (data.totalResponses === 0) return <EmptyState />
  return <DashboardView data={data} />
}

export default function DashboardPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader action={{ href: "/assess", label: "Take assessment" }} />
      <main>
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
