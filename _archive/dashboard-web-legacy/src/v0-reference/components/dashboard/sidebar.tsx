"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Brain,
  LayoutGrid,
  Shield,
  Settings,
  Sparkles,
} from "lucide-react"

const navItems = [
  { label: "仪表盘", icon: LayoutDashboard, active: true },
  { label: "客户洞察", icon: Users, active: false },
  { label: "AI 策略", icon: Brain, active: false },
  { label: "内容矩阵", icon: LayoutGrid, active: false },
  { label: "安全审计", icon: Shield, active: false },
  { label: "设置", icon: Settings, active: false },
]

export function DashboardSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-900">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-lg font-semibold text-slate-50">
            LuminaMedia
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    item.active
                      ? "bg-slate-800 text-amber-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
              <span className="text-sm font-semibold text-slate-950">JD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">张东</p>
              <p className="text-xs text-slate-500">管理员</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
