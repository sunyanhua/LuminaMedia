import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { UserGrowthChart } from "@/components/dashboard/user-growth-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Fixed Sidebar */}
      <DashboardSidebar />

      {/* Fixed Header */}
      <DashboardHeader />

      {/* Main Content - with proper offset for sidebar and header */}
      <main className="ml-64 pt-16">
        <div className="min-h-[calc(100vh-4rem)] p-8">
          {/* Stats Row */}
          <StatCards />

          {/* Charts and Activity Row */}
          <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
            {/* User Growth Chart - Takes 2/3 width on xl */}
            <div className="xl:col-span-2">
              <UserGrowthChart />
            </div>

            {/* Activity Feed - Takes 1/3 width on xl */}
            <div className="xl:col-span-1">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
