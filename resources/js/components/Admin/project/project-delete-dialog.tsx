"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Project } from "@/types"
import axios from "axios"
import { toast } from "sonner"

type ProjectDeleteDialogProps = {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (projectId: string | number) => void
}

export function ProjectDeleteDialog({ project, open, onOpenChange, onDelete }: ProjectDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await axios.delete(`/api/projects/${project.id}`)
      toast.success("Projet supprimé avec succès")
      onDelete(project.id)
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du projet")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Elle supprimera définitivement le projet
            <span className="font-semibold"> {project.title} </span>
            et toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
