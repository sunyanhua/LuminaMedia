"use client"

import { Bell, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-8 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-50">仪表盘总览</h1>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">
          企业版
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="搜索..."
            className="h-10 w-64 rounded-lg border border-slate-800 bg-slate-900 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
        </Button>

        {/* Date Selector */}
        <Button
          variant="outline"
          className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
        >
          最近 7 天
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
