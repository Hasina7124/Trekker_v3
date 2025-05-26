"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Compass, Map, Pencil, Trash2, Trophy, FileText } from "lucide-react"
import { Link } from "@inertiajs/react"
import type { Project } from "@/types"
import { ProjectEditDialog } from "./project-edit-dialog"
import { ProjectDeleteDialog } from "./project-delete-dialog"

const statusIcons = {
  pending: <Compass className="h-5 w-5 text-blue-400" />,
  active: <Map className="h-5 w-5 text-green-400" />,
  completed: <Trophy className="h-5 w-5 text-amber-400" />,
  rejected: <FileText className="h-5 w-5 text-red-400" />,
}

const statusColors = {
  pending: "bg-blue-900 text-blue-400",
  active: "bg-green-900 text-green-400",
  completed: "bg-amber-900 text-amber-400",
  rejected: "bg-red-900 text-red-400",
}

const statusLabels = {
  pending: "En attente",
  active: "En cours",
  completed: "Terminé",
  rejected: "Rejeté",
}

export const ProjectCard = ({ project }: { project: Project }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on action buttons
    if ((e.target as HTMLElement).closest(".action-button")) {
      e.preventDefault()
    }
  }

  return (
    <>
      <Link href={`project/${project.id}`} onClick={handleCardClick}>
        <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer relative">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
            <Badge className={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 line-clamp-2 mb-4">{project.description}</p>

            <div className="flex items-center gap-2 mb-2 text-sm">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>Début : {project.start_date}</span>
            </div>
            <div className="flex items-center gap-2 mb-4 text-sm">
              <Calendar className="h-4 w-4 text-red-400" />
              <span>Fin : {project.end_date}</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progression</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                    {statusIcons[project.status]}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full action-button"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/20 action-button"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <ProjectEditDialog project={project} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

      <ProjectDeleteDialog project={project} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />
    </>
  )
}
