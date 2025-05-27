"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Plus, Lock } from "lucide-react"
import { useProjects } from "@/context/project-context"
import { ProgressBar } from "@/components/User/progress-bar"
import { ProjectModule } from "@/components/User/project-module"
import type { Part } from "@/types"

interface ProjectMilestoneProps {
  milestone: Part
  projectId: string
  index: number
  isLocked: boolean
}

export function ProjectMilestone({ milestone, projectId, index, isLocked }: ProjectMilestoneProps) {
  const { getProjectById, updateProject } = useProjects()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddModule, setShowAddModule] = useState(false)
  const [newModuleName, setNewModuleName] = useState("")

  const progress = milestone.progress || 0

  const handleAddModule = () => {
    if (!newModuleName.trim()) return

    const project = getProjectById(projectId)
    if (!project || !project.parts) return

    const newModule = {
      id: Date.now(),
      part_id: milestone.id,
      title: newModuleName,
      description: "",
      xp_rewards: 0,
      duration_hours: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedParts = project.parts.map((p: Part) => {
      if (p.id === milestone.id) {
        return {
          ...p,
          modules: [...(p.modules || []), newModule],
        }
      }
      return p
    })

    updateProject(projectId, { parts: updatedParts })

    setNewModuleName("")
    setShowAddModule(false)
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="font-medium">{index + 1}</span>
          </div>
          <div>
              <h4 className="font-medium">{milestone.title}</h4>
              <p className="text-sm text-slate-400">{milestone.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-400">{progress}%</div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-slate-700 rounded-md transition-colors"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-3 bg-slate-900 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#60a5fa] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium">Modules</h5>
            {!isLocked && (
              <button
                onClick={() => setShowAddModule(!showAddModule)}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Ajouter Module</span>
              </button>
            )}
          </div>

          {milestone.modules && milestone.modules.length > 0 ? (
            <div className="space-y-2">
              {milestone.modules.map((module) => (
                <div
                  key={module.id}
                  className="bg-slate-700 rounded-md p-3 flex items-center justify-between"
                >
                  <div>
                    <h6 className="font-medium">{module.title}</h6>
                    <p className="text-sm text-slate-400">{module.description}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-[#60a5fa]">{module.xp_rewards} XP</span>
                    <span className="text-slate-400 ml-2">{module.duration_hours}h</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-4">
              <p>Aucun module dans cette partie.</p>
              {!isLocked && (
                <p className="text-sm mt-1">Ajoutez des modules pour commencer le développement.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
