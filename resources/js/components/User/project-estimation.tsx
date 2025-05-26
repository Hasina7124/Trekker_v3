"use client"

import { useState } from "react"
import { DollarSign, Clock, Send, AlertTriangle } from "lucide-react"
import { useProjects } from "@/context/project-context"

interface ProjectEstimationProps {
  projectId: string
}

export function ProjectEstimation({ projectId }: ProjectEstimationProps) {
  const { getProjectById, updateProject } = useProjects()
  const project = getProjectById(projectId)

  const [budget, setBudget] = useState<number>(project?.budget || 10000)
  const [duration, setDuration] = useState<number>(project?.duration || 30)
  const [note, setNote] = useState<string>("")

  if (!project) return <div>Project not found</div>

  const handleSubmitEstimation = () => {
    updateProject(projectId, {
      budget,
      duration,
      status: "pending",
    })

    // Add a message about the estimation
    if (note.trim()) {
      updateProject(projectId, {
        messages: [
          ...(project.messages || []),
          {
            id: `msg-${Date.now()}`,
            sender: "Project Manager",
            content: `Estimation submitted: $${budget.toLocaleString()} for ${duration} days. Note: ${note}`,
            timestamp: new Date().toISOString(),
            isAdmin: false,
          },
        ],
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Estimation</h1>
        <p className="text-slate-400 mt-1">{project.name}</p>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold mb-4">Create Estimation</h2>

          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-[#fbbf24]">Important</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Your estimation will be reviewed by the administrator. Once submitted, you'll need to wait for
                  approval before proceeding with the project planning.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Budget Estimation</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full pl-10 pr-3 py-2 bg-slate-800 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#60a5fa]"
                    />
                  </div>
                  <div className="mt-2">
                    <input
                      type="range"
                      min="5000"
                      max="100000"
                      step="1000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>$5,000</span>
                      <span>$100,000</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duration (days)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full pl-10 pr-3 py-2 bg-slate-800 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#60a5fa]"
                    />
                  </div>
                  <div className="mt-2">
                    <input
                      type="range"
                      min="7"
                      max="180"
                      step="1"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>7 days</span>
                      <span>180 days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes for Administrator</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain your estimation reasoning..."
                  className="w-full h-[180px] px-3 py-2 bg-slate-800 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#60a5fa]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-800 flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            Once submitted, your estimation will be reviewed by the administrator.
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-700 text-white font-medium rounded-md hover:bg-slate-600 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmitEstimation}
              className="px-4 py-2 bg-[#60a5fa] text-white font-medium rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Estimation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
