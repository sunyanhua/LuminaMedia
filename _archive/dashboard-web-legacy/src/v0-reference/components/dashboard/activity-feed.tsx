"use client"

import { UserPlus, FileText, AlertCircle, CheckCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    type: "user" as const,
    title: "新用户注册",
    description: "王小明 完成了账户注册",
    time: "2 分钟前",
    icon: UserPlus,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    id: 2,
    type: "content" as const,
    title: "内容发布",
    description: "新的营销活动已上线",
    time: "15 分钟前",
    icon: FileText,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: 3,
    type: "alert" as const,
    title: "系统警告",
    description: "服务器负载已达 85%",
    time: "32 分钟前",
    icon: AlertCircle,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    id: 4,
    type: "success" as const,
    title: "任务完成",
    description: "数据备份成功完成",
    time: "1 小时前",
    icon: CheckCircle,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    id: 5,
    type: "ai" as const,
    title: "AI 分析",
    description: "本周用户行为报告已生成",
    time: "2 小时前",
    icon: Zap,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    id: 6,
    type: "user" as const,
    title: "VIP 用户升级",
    description: "李华 升级为企业账户",
    time: "3 小时前",
    icon: UserPlus,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
]

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-50">实时动态</h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <span className="text-xs text-slate-400">实时更新</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              "group flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-slate-800/50",
              index === 0 && "bg-slate-800/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                activity.iconBg
              )}
            >
              <activity.icon className={cn("h-5 w-5", activity.iconColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200">{activity.title}</p>
              <p className="mt-0.5 truncate text-sm text-slate-400">
                {activity.description}
              </p>
            </div>
            <span className="shrink-0 text-xs text-slate-500">{activity.time}</span>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full rounded-lg border border-slate-800 bg-slate-800/50 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-amber-500">
        查看全部动态
      </button>
    </div>
  )
}
