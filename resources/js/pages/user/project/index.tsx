"use client"

import { useState } from "react"
import { ProjectDashboard } from "@/components/User/project-dashboard"
import { ProjectDetail } from "@/components/User/project-detail"
import { ProjectEstimation } from "@/components/User/project-estimation"
import { Sidebar } from "@/components/User/sidebar"
import { ThemeProvider } from "@/components/User/theme-provider"
import { ProjectProvider } from "@/context/project-context"

export default function Home() {
  const [selectedView, setSelectedView] = useState<string>("dashboard")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  return (
    <ThemeProvider>
      <ProjectProvider>
        <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
          <Sidebar
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
          <main className="flex-1 overflow-auto p-6">
            {selectedView === "dashboard" && (
              <ProjectDashboard
                onSelectProject={(id) => {
                  setSelectedProjectId(id)
                  setSelectedView("project")
                }}
              />
            )}
            {selectedView === "project" && selectedProjectId && <ProjectDetail projectId={selectedProjectId} />}
            {selectedView === "estimation" && selectedProjectId && <ProjectEstimation projectId={selectedProjectId} />}
          </main>
        </div>
      </ProjectProvider>
    </ThemeProvider>
  )
}
