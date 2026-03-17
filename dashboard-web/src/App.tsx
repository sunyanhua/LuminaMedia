import { useState } from 'react'
import { BarChart3, Brain, Globe, Shield, Settings, Bell, Search, Menu, X } from 'lucide-react'
import Dashboard from './components/Dashboard'
import AICenter from './components/AICenter'
import MatrixWall from './components/MatrixWall'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = [
    { id: 'dashboard', label: '数智洞察看板', icon: BarChart3 },
    { id: 'ai-center', label: 'AI 智策中心', icon: Brain },
    { id: 'matrix', label: '矩阵管理墙', icon: Globe },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'ai-center':
        return <AICenter />
      case 'matrix':
        return <MatrixWall />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-background-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-deep-blue-600 to-gold-500 flex items-center justify-center">
                  <Brain size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">灵曜智媒</h1>
                <span className="text-xs bg-gold-500/20 text-gold-300 px-2 py-1 rounded-full">AI 驱动</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="搜索仪表板、报告或设置..."
                  className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm w-64 focus:outline-none focus:border-gold-500"
                />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Settings size={20} />
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-deep-blue-500 to-gold-400"></div>
            </div>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex border-t border-gray-800">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-gold-500 text-white bg-gradient-to-r from-deep-blue-900/50 to-transparent'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-900/50'
                  }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-background-card border-r border-gray-800 p-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-deep-blue-600 to-gold-500 flex items-center justify-center">
                  <Brain size={20} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">灵曜智媒</h2>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setSidebarOpen(false)
                    }}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg ${activeTab === tab.id
                        ? 'bg-deep-blue-900/50 text-white border-l-4 border-gold-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
                      }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 md:p-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-6 text-center text-gray-500 text-sm">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p>© 2026 灵曜智媒 - AI 驱动的自动化内容矩阵管理系统</p>
            <p className="mt-1">Powered by Gemini AI & OpenClaw Automation</p>
          </div>
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-2">
              <Shield size={14} />
              <span>政务审核状态: <span className="text-green-400">正常</span></span>
            </span>
            <span>版本: v1.0.0</span>
            <span>最后更新: 2026-03-14</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
