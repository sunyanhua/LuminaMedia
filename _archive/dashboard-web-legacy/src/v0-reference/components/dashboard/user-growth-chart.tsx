"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const chartData = [
  { month: "一月", users: 18600, newUsers: 2400 },
  { month: "二月", users: 21305, newUsers: 3200 },
  { month: "三月", users: 24237, newUsers: 4100 },
  { month: "四月", users: 28173, newUsers: 3800 },
  { month: "五月", users: 33209, newUsers: 5200 },
  { month: "六月", users: 39214, newUsers: 6100 },
  { month: "七月", users: 44500, newUsers: 5400 },
  { month: "八月", users: 51300, newUsers: 6800 },
  { month: "九月", users: 58200, newUsers: 7100 },
  { month: "十月", users: 66800, newUsers: 8600 },
  { month: "十一月", users: 75400, newUsers: 8800 },
  { month: "十二月", users: 84200, newUsers: 9200 },
]

export function UserGrowthChart() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-50">用户增长趋势</h3>
          <p className="mt-1 text-sm text-slate-400">年度用户数据统计</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-sm text-slate-400">总用户</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500/40" />
            <span className="text-sm text-slate-400">新用户</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="goldGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc'
              }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value: number) => [value.toLocaleString(), '']}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#goldGradient)"
              name="总用户"
            />
            <Area
              type="monotone"
              dataKey="newUsers"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#goldGradientLight)"
              name="新用户"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
