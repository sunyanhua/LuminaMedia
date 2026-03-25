"use client"

import { TrendingUp, TrendingDown, Users, Eye, Clock, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "总用户数",
    value: "248,395",
    change: "+12.5%",
    trend: "up" as const,
    icon: Users,
  },
  {
    label: "页面浏览量",
    value: "1.2M",
    change: "+8.2%",
    trend: "up" as const,
    icon: Eye,
  },
  {
    label: "平均停留时间",
    value: "4m 32s",
    change: "-2.1%",
    trend: "down" as const,
    icon: Clock,
  },
  {
    label: "转化率",
    value: "3.24%",
    change: "+15.3%",
    trend: "up" as const,
    icon: Target,
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-50">{stat.value}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 transition-colors group-hover:bg-amber-500/10">
              <stat.icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {stat.trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {stat.change}
            </span>
            <span className="text-sm text-slate-500">vs 上周</span>
          </div>
          {/* Subtle glow effect on hover */}
          <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
          </div>
        </div>
      ))}
    </div>
  )
}
