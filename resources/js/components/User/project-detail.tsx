"use client"

import { useState } from "react"
import { Calendar, DollarSign, User as UserIcon, Plus, Save, X } from "lucide-react"
import { useProjects } from "@/context/project-context"
import { StatusBadge } from "@/components/User/status-badge"
import { ProjectMilestone } from "@/components/User/project-milestone"
import { ProjectChat } from "@/components/User/project-chat"
import type { Project, ProjectUser, User, Part } from "@/types"
import { getProjectUsers, isUserInProject } from "@/utils/project-helpers"

interface ProjectDetailProps {
  projectId: string
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { getProjectById, updateProject } = useProjects()
  const project = getProjectById(projectId)
  const [activeTab, setActiveTab] = useState<string>("milestones")
  const [showAddPart, setShowAddPart] = useState(false)
  const [newPartTitle, setNewPartTitle] = useState("")
  const [newPartDescription, setNewPartDescription] = useState("")

  // Edit mode states
  const [editEndDate, setEditEndDate] = useState<string>(
    project?.end_date ? new Date(project.end_date).toISOString().split("T")[0] : "",
  )
  const [editBudget, setEditBudget] = useState<number>(project?.budget || 0)

  if (!project) return <div>Project not found</div>

  const isEditable = project.status === "pending"

  const tabs = [
    { label: "Parties", value: "milestones" },
    { label: "Utilisateurs", value: "users" },
    { label: "Chat", value: "chat" },
    { label: "Fichiers", value: "files" },
  ]

  const handleAddPart = () => {
    if (!newPartTitle.trim()) return

    const newPart = {
      title: newPartTitle,
      description: newPartDescription,
      project_id: Number(projectId)
    }

    updateProject(projectId, {
      parts: [...(project.parts || []), newPart]
    })

    setNewPartTitle("")
    setNewPartDescription("")
    setShowAddPart(false)
  }

  const handleSaveEndDate = () => {
    updateProject(projectId, {
      end_date: editEndDate
    })
  }

  const handleSaveBudget = () => {
    updateProject(projectId, {
      budget: editBudget
    })
  }

  const projectUsers = project.project_users?.map(pu => pu.user).filter((user): user is User => user !== undefined) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-slate-400 mt-1">{project.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-[#60a5fa]" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Date de fin</p>
            </div>
          </div>

          {isEditable ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#60a5fa]"
              />
              <button
                onClick={handleSaveEndDate}
                className="p-2 bg-green-500/20 text-[#34d399] rounded-md hover:bg-green-500/30 transition-colors"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className="font-medium">
              {project.end_date ? new Date(project.end_date).toLocaleDateString() : "Pas de date de fin"}
            </p>
          )}
        </div>

        <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Membres</p>
              <p className="font-medium">{projectUsers.length} membres</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="border-b border-slate-700">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.value
                    ? "border-b-2 border-[#60a5fa] text-[#60a5fa]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === "milestones" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Parties du Projet</h3>
                {isEditable && (
                  <button
                    onClick={() => setShowAddPart(!showAddPart)}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter une Partie</span>
                  </button>
                )}
              </div>

              {showAddPart && isEditable && (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h4 className="font-medium mb-2">Nouvelle Partie</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newPartTitle}
                      onChange={(e) => setNewPartTitle(e.target.value)}
                      placeholder="Titre de la partie"
                      className="w-full px-3 py-2 bg-slate-900 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#60a5fa]"
                    />
                    <textarea
                      value={newPartDescription}
                      onChange={(e) => setNewPartDescription(e.target.value)}
                      placeholder="Description de la partie"
                      className="w-full px-3 py-2 bg-slate-900 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#60a5fa]"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end mt-3">
                    <button
                      onClick={handleAddPart}
                      className="px-4 py-2 bg-[#60a5fa] text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setShowAddPart(false)}
                      className="px-4 py-2 bg-slate-700 text-white font-medium rounded-md hover:bg-slate-600 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {project.parts && project.parts.length > 0 ? (
                <div className="space-y-4">
                  {project.parts.map((part, index) => (
                    <ProjectMilestone
                      key={part.id}
                      milestone={part}
                      projectId={projectId}
                      index={index}
                      isLocked={index > 0 && project.parts && project.parts[index - 1].progress < 100}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                  <p>Aucune partie créée.</p>
                  <p className="text-sm mt-1">Créez votre première partie pour commencer à planifier votre projet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Membres</h3>
                {isEditable && (
                  <button
                    onClick={() => setShowAddPart(!showAddPart)}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter Membre</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#60a5fa] flex items-center justify-center">
                      <span className="font-bold text-white">{user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.role}</p>
                    </div>
                    {isEditable && (
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="p-1.5 bg-red-500/20 text-[#f87171] rounded-md hover:bg-red-500/30 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {projectUsers.length === 0 && (
                  <div className="col-span-3 py-6 text-center text-slate-400 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                    <p>Aucun membre ajouté.</p>
                    {isEditable && (
                      <p className="text-sm mt-1">Ajoutez des membres pour commencer à planifier votre projet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "chat" && <ProjectChat projectId={projectId} />}

          {activeTab === "files" && (
            <div className="py-8 text-center text-slate-400 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
              <p>Aucun fichier téléchargé.</p>
              <p className="text-sm mt-1">Téléchargez des fichiers pour les partager avec votre équipe.</p>
              <button className="mt-4 flex items-center gap-1 px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors mx-auto">
                <Plus className="h-4 w-4" />
                <span>Télécharger des fichiers</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
