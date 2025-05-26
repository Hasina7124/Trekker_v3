"use client"

import type { Project } from "@/types/project"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ProjectListProps {
  projects: Project[]
  selectedProjectId: string | undefined
  onSelectProject: (project: Project) => void
}

export function ProjectList({ projects, selectedProjectId, onSelectProject }: ProjectListProps) {
  // Grouper les projets par statut
  const groupedProjects = {
    "en-cours": projects.filter((p) => p.status === "en-cours"),
    "en-attente": projects.filter((p) => p.status === "en-attente"),
    achevé: projects.filter((p) => p.status === "achevé"),
  }

  // Traduire les statuts pour l'affichage
  const statusLabels = {
    "en-cours": "En cours",
    "en-attente": "En attente",
    achevé: "Achevés",
  }

  // Couleurs des badges par statut
  const statusColors = {
    "en-cours": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
    "en-attente": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    achevé: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Projets</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        {Object.entries(groupedProjects).map(([status, projectsInGroup]) => (
          <div key={status} className="py-2">
            <div className="px-4 py-2">
              <h3 className="text-sm font-medium text-slate-400">
                {statusLabels[status as keyof typeof statusLabels]} ({projectsInGroup.length})
              </h3>
            </div>
            <div className="space-y-1 px-1">
              {projectsInGroup.map((project) => (
                <button
                  key={project.id}
                  className={cn(
                    "w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors",
                    selectedProjectId === project.id
                      ? "bg-slate-700/70 text-white"
                      : "text-slate-300 hover:bg-slate-700/40 hover:text-white",
                  )}
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex-1 truncate">
                    <div className="font-medium">{project.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="text-xs text-slate-400 truncate">
                        {project.modules.filter((m) => m.completed).length}/{project.modules.length} modules
                      </div>
                      <Badge variant="outline" className={statusColors[project.status as keyof typeof statusColors]}>
                        {statusLabels[project.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
