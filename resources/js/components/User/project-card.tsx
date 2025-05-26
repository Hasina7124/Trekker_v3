"use client"

import { ChevronRight } from "lucide-react"
import { StatusBadge } from "@/components/User/status-badge"
import { ProgressBar } from "@/components/User/progress-bar"
import type { Project } from "@/types"

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div
      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <StatusBadge status={project.status} />
          <h3 className="text-lg font-bold mt-2">{project.title}</h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{project.description}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-[#60a5fa] transition-colors">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-400">Status</span>
          <span className="font-medium capitalize">{project.status}</span>
        </div>
        <ProgressBar value={project.status === 'completed' ? 100 : project.status === 'active' ? 50 : 0} />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.team?.slice(0, 3).map((member, index) => (
              <div
                key={index}
                className="h-6 w-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs"
              >
                {member.name.charAt(0)}
              </div>
            ))}
            {project.team && project.team.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">
                +{project.team.length - 3}
              </div>
            )}
          </div>
          <span className="text-slate-400">{project.team?.length || 0} membres</span>
        </div>
        <div className="text-slate-400">
          {project.end_date ? (
            <span>Due {new Date(project.end_date).toLocaleDateString()}</span>
          ) : (
            <span>No deadline</span>
          )}
        </div>
      </div>
    </div>
  )
}
