import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { Project } from "@/types"
import { router } from "@inertiajs/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { toast } from "sonner"

type ProjectEditDialogProps = {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (project: Project) => void
}

export function ProjectEditDialog({ project, open, onOpenChange, onUpdate }: ProjectEditDialogProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    start_date: project.start_date,
    end_date: project.end_date,
    status: project.status,
  })

  const parseDate = (dateStr: string | null) => {
    if (!dateStr) return undefined;
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const [startDate, setStartDate] = useState<Date | undefined>(
    project.start_date ? parseDate(project.start_date) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    project.end_date ? parseDate(project.end_date) : undefined
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  type valueType = "pending" | "active" | "completed" | "rejected"
  const handleStatusChange = (value: valueType) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      setFormData((prev) => ({ ...prev, start_date: format(date, "yyyy-MM-dd") }))
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      setFormData((prev) => ({ ...prev, end_date: format(date, "yyyy-MM-dd") }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await axios.put(`/api/projects/${project.id}`, formData)
      toast.success("Projet mis à jour avec succès")
      onUpdate(response.data.project)
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du projet")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
            <DialogDescription>
              Modifiez les détails du projet. Cliquez sur sauvegarder lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date de fin</Label>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal cursor-not-allowed opacity-70",
                    !endDate && "text-muted-foreground"
                  )}
                  disabled
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "EEEE dd MMMM yyyy", { locale: fr }).replace(/^\w/, c => c.toUpperCase()) : "Sélectionner"}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={handleStatusChange} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="active">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sauvegarde en cours..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
