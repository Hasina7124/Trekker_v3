"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { useProjects } from "@/context/project-context"
import { cn } from "@/lib/utils"

interface SidebarProps {
  selectedView: string
  setSelectedView: (view: string) => void
  selectedProjectId: string | null
  setSelectedProjectId: (id: string | null) => void
}

export function Sidebar({ selectedView, setSelectedView, selectedProjectId, setSelectedProjectId }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { projects } = useProjects()

  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      value: "dashboard",
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: "Projects",
      value: "projects",
      subItems: projects.map((project) => ({
        label: project.name,
        value: project.id,
        status: project.status,
      })),
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Analytics",
      value: "analytics",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Messages",
      value: "messages",
      badge: 3,
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      value: "settings",
    },
  ]

  return (
    <div
      className={cn(
        "bg-[#1e293b] border-r border-slate-700 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#60a5fa] flex items-center justify-center">
              <span className="font-bold text-white">T</span>
            </div>
            <h1 className="font-bold text-xl">Trekker</h1>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 mx-auto rounded-md bg-[#60a5fa] flex items-center justify-center">
            <span className="font-bold text-white">T</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-md hover:bg-slate-700 flex items-center justify-center"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.value}>
              <button
                onClick={() => {
                  setSelectedView(item.value)
                  if (item.value !== "projects") {
                    setSelectedProjectId(null)
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  selectedView === item.value ? "bg-slate-800 text-[#60a5fa]" : "hover:bg-slate-800/50",
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto bg-[#f87171] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>

              {!collapsed && item.value === "projects" && item.subItems && (
                <ul className="mt-1 ml-6 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.value}>
                      <button
                        onClick={() => {
                          setSelectedProjectId(subItem.value)
                          setSelectedView("project")
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                          selectedProjectId === subItem.value ? "bg-slate-800 text-[#60a5fa]" : "hover:bg-slate-800/50",
                        )}
                      >
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            subItem.status === "pending" && "bg-[#60a5fa]",
                            subItem.status === "in_progress" && "bg-[#34d399]",
                            subItem.status === "to_estimate" && "bg-[#fbbf24]",
                            subItem.status === "rejected" && "bg-[#f87171]",
                          )}
                        />
                        <span className="truncate">{subItem.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-slate-700">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800/50 transition-colors">
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}
