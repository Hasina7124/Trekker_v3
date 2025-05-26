"use client"

import { useState } from "react"
import { Bell, Clock, BarChart, CheckCircle2, AlertTriangle, Briefcase } from "lucide-react"
import { useProjects } from "@/context/project-context"
import { ProjectCard } from "@/components/User/project-card"
import { ProgressBar } from "@/components/User/progress-bar"

interface ProjectDashboardProps {
  onSelectProject: (id: string) => void
}

export function ProjectDashboard({ onSelectProject }: ProjectDashboardProps) {
  const { projects, loading, error, user, loadProjects } = useProjects()
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  const filters = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "rejected" },
  ]

  const filteredProjects =
    selectedFilter === "all" ? projects.data : projects.data.filter((project) => project.status === selectedFilter)

  // Calculate stats
  const totalProjects = projects.total
  const completedProjects = projects.data.filter((p) => p.status === "completed").length
  const pendingProjects = projects.data.filter((p) => p.status === "pending").length
  const activeProjects = projects.data.filter((p) => p.status === "active").length

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadProjects(page)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60a5fa]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-slate-800 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#f87171]"></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#60a5fa] flex items-center justify-center">
              <span className="font-bold text-white">{user.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Total Projects</h3>
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-[#60a5fa]" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{totalProjects}</p>
          <div className="mt-4 flex items-center text-xs text-[#34d399]">
            <span>+2 new this month</span>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Completed</h3>
            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-[#34d399]" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{completedProjects}</p>
          <div className="mt-4 flex items-center text-xs">
            <ProgressBar value={(completedProjects / totalProjects) * 100} className="flex-1 h-1.5" />
            <span className="ml-2 text-slate-400">{Math.round((completedProjects / totalProjects) * 100)}%</span>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Pending</h3>
            <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-[#fbbf24]" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{pendingProjects}</p>
          <div className="mt-4 flex items-center text-xs text-[#fbbf24]">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Requires attention</span>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 font-medium">Active</h3>
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <BarChart className="h-4 w-4 text-[#60a5fa]" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{activeProjects}</p>
          <div className="mt-4 flex items-center text-xs text-slate-400">
            <span>Active development</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your Projects</h2>
            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedFilter === filter.value ? "bg-slate-800 text-[#60a5fa]" : "hover:bg-slate-800/50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onClick={() => onSelectProject(project.id.toString())} />
          ))}

          {filteredProjects.length === 0 && (
            <div className="col-span-3 py-8 text-center text-slate-400">
              No projects found matching the selected filter.
            </div>
          )}
        </div>

        {/* Pagination */}
        {projects.last_page > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-slate-700">
            {Array.from({ length: projects.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  currentPage === page
                    ? "bg-[#60a5fa] text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
