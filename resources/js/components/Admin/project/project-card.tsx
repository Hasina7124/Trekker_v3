"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Compass, Map, Pencil, Trash2, Trophy, FileText, Edit, Trash } from "lucide-react"
import { Link } from "@inertiajs/react"
import type { Project } from "@/types"
import { ProjectEditDialog } from "./project-edit-dialog"
import { ProjectDeleteDialog } from "./project-delete-dialog"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const statusIcons = {
  pending: <Compass className="h-5 w-5 text-blue-400" />,
  active: <Map className="h-5 w-5 text-green-400" />,
  completed: <Trophy className="h-5 w-5 text-amber-400" />,
  rejected: <FileText className="h-5 w-5 text-red-400" />,
}

const statusColors = {
  pending: "bg-amber-500",
  active: "bg-emerald-500",
  completed: "bg-blue-500",
  rejected: "bg-rose-500",
}

const statusLabels = {
  pending: "En attente",
  active: "En cours",
  completed: "Terminé",
  rejected: "Rejeté",
}

type ProjectCardProps = {
  project: Project
  onUpdate: (project: Project) => void
  onDelete: (projectId: string | number) => void
}

export function ProjectCard({ project, onUpdate, onDelete }: ProjectCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const parseDate = (dateStr: string | null) => {
    if (!dateStr) return undefined;
    
    try {
      // Si la date est au format YYYY-MM-DD (venant de l'API)
      if (dateStr.includes('-')) {
        return new Date(dateStr);
      }
      
      // Si la date est au format DD/MM/YYYY
      const [day, month, year] = dateStr.split('/');
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Vérifier si la date est valide
      if (isNaN(parsedDate.getTime())) {
        return undefined;
      }
      
      return parsedDate;
    } catch (error) {
      console.error("Erreur lors du parsing de la date:", error);
      return undefined;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Non définie";
    const date = parseDate(dateStr);
    if (!date) return "Date invalide";
    try {
      return format(date, "EEEE dd MMMM yyyy", { locale: fr }).replace(/^\w/, c => c.toUpperCase());
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "Erreur de format";
    }
  };

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
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </div>
              <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                {statusLabels[project.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            <div className="absolute -bottom-3 right-6 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault()
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 border-rose-500 text-rose-500 hover:bg-rose-50"
                onClick={(e) => {
                  e.preventDefault()
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Date de début</span>
                <span>{formatDate(project.start_date)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Date de fin</span>
                <span>{formatDate(project.end_date)}</span>
              </div>
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
                    {statusIcons[project.status as keyof typeof statusIcons]}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <ProjectEditDialog
        project={project}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={onUpdate}
      />
      <ProjectDeleteDialog
        project={project}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={onDelete}
      />
    </>
  )
}
