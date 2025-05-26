"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Plus, CheckCircle, Circle } from "lucide-react"
import { useProjects } from "@/context/project-context"
import { ProgressBar } from "@/components/progress-bar"
import type { Module, Task } from "@/types"

interface ProjectModuleProps {
  module: Module
  projectId: string
  milestoneId: string
  index: number
}

export function ProjectModule({ module, projectId, milestoneId, index }: ProjectModuleProps) {
  const { getProjectById, updateProject } = useProjects()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState("")

  const handleAddTask = () => {
    if (!newTaskName.trim()) return

    const project = getProjectById(projectId)
    if (!project || !project.milestones) return

    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      completed: false,
    }

    const updatedMilestones = project.milestones.map((milestone) => {
      if (milestone.id === milestoneId) {
        return {
          ...milestone,
          modules: milestone.modules?.map((m) => {
            if (m.id === module.id) {
              return {
                ...m,
                tasks: [...(m.tasks || []), newTask],
              }
            }
            return m
          }),
        }
      }
      return milestone
    })

    updateProject(projectId, { milestones: updatedMilestones })

    setNewTaskName("")
    setShowAddTask(false)
  }

  const toggleTaskStatus = (taskId: string) => {
    const project = getProjectById(projectId)
    if (!project || !project.milestones) return

    const updatedMilestones = project.milestones.map((milestone) => {
      if (milestone.id === milestoneId) {
        return {
          ...milestone,
          modules: milestone.modules?.map((m) => {
            if (m.id === module.id) {
              const updatedTasks = m.tasks?.map((task) => {
                if (task.id === taskId) {
                  return { ...task, completed: !task.completed }
                }
                return task
              })

              // Calculate new progress
              const completedTasks = updatedTasks?.filter((t) => t.completed).length || 0
              const totalTasks = updatedTasks?.length || 0
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              return {
                ...m,
                tasks: updatedTasks,
                progress,
              }
            }
            return m
          }),
        }
      }
      return milestone
    })

    // Update milestone progress based on modules
    const updatedMilestonesWithProgress = updatedMilestones.map((milestone) => {
      if (milestone.id === milestoneId) {
        const totalModules = milestone.modules?.length || 0
        const moduleProgressSum = milestone.modules?.reduce((sum, m) => sum + m.progress, 0) || 0
        const milestoneProgress = totalModules > 0 ? Math.round(moduleProgressSum / totalModules) : 0

        return {
          ...milestone,
          progress: milestoneProgress,
        }
      }
      return milestone
    })

    updateProject(projectId, { milestones: updatedMilestonesWithProgress })
  }

  return (
    <div className="bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
      <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-600 text-white text-sm font-medium">
            {index + 1}
          </div>
          <h5 className="font-medium">{module.name}</h5>
        </div>

        <div className="flex items-center gap-2">
          <ProgressBar value={module.progress} className="w-24 h-1.5" />
          <span className="text-xs text-slate-400">{module.progress}%</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 pt-0 border-t border-slate-600">
          <div className="space-y-3">
            {module.tasks && module.tasks.length > 0 ? (
              <div className="space-y-2 pt-2">
                {module.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-600 transition-colors"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTaskStatus(task.id)
                      }}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-[#34d399]" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                    <span className={`text-sm ${task.completed ? "line-through text-slate-400" : ""}`}>
                      {task.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 text-center text-sm text-slate-400 bg-slate-700 rounded-md">
                <p>No tasks created yet.</p>
              </div>
            )}

            {showAddTask ? (
              <div className="bg-slate-600 rounded-md p-2 border border-slate-500">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Task name"
                    className="flex-1 px-2 py-1 text-sm bg-slate-700 rounded-md border border-slate-500 focus:outline-none focus:ring-1 focus:ring-[#60a5fa]"
                  />
                  <button
                    onClick={handleAddTask}
                    className="px-2 py-1 text-xs bg-[#60a5fa] text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="px-2 py-1 text-xs bg-slate-500 text-white font-medium rounded-md hover:bg-slate-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAddTask(true)
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-600 rounded-md hover:bg-slate-500 transition-colors w-full justify-center"
              >
                <Plus className="h-3 w-3" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
