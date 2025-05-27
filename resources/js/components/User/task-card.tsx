"use client"

import { useState } from "react"
import type { Task, User, TaskStatus, TaskDeliverable, TaskComment } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Github,
  ImageIcon,
  FileText,
  MessageSquare,
  UserPlus,
  Check,
  DollarSign,
  HourglassIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface TaskCardProps {
  task: Task
  currentUser: User
  isProjectManager: boolean
  onAssign: () => void
  onStatusChange: (status: TaskStatus) => void
  selected: boolean
  onSelect: () => void
  onAddComment: (comment: string) => void
  newComment: string
  onNewCommentChange: (comment: string) => void
}

export function TaskCard({
  task,
  currentUser,
  isProjectManager,
  onAssign,
  onStatusChange,
  selected,
  onSelect,
  onAddComment,
  newComment,
  onNewCommentChange,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Déterminer si l'utilisateur peut valider la tâche
  const canValidateTask = task.status === "achevé" && isProjectManager

  // Vérifier si la tâche est assignée à l'utilisateur actuel
  const isAssignedToCurrentUser = task.assignedTo?.id === currentUser.id

  // Vérifier si la tâche peut être assignée
  const canBeAssigned = task.status === "inactive" && !task.assignedTo

  // Vérifier si l'utilisateur peut soumettre la tâche pour validation
  const canSubmitForValidation = task.status === "en-cours" && isAssignedToCurrentUser

  // Obtenir l'icône de statut
  const getStatusIcon = () => {
    switch (task.status) {
      case "validé":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "achevé":
        return <CheckCircle className="h-5 w-5 text-amber-500" />
      case "attente-validation":
        return <HourglassIcon className="h-5 w-5 text-purple-500" />
      case "en-cours":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />
    }
  }

  // Obtenir la couleur de la bordure en fonction du statut
  const getBorderColor = () => {
    switch (task.status) {
      case "validé":
        return "border-emerald-500/30 bg-emerald-500/5"
      case "achevé":
        return "border-amber-500/30 bg-amber-500/5"
      case "attente-validation":
        return "border-purple-500/30 bg-purple-500/5"
      case "en-cours":
        return "border-blue-500/30 bg-blue-500/5"
      default:
        return "border-slate-700 bg-slate-800/50"
    }
  }

  // Obtenir le texte du statut
  const getStatusText = () => {
    switch (task.status) {
      case "validé":
        return "Validé"
      case "achevé":
        return "Achevé"
      case "attente-validation":
        return "Attente validation"
      case "en-cours":
        return "En cours"
      default:
        return "Inactive"
    }
  }

  // Obtenir l'icône pour le type de livrable
  const getDeliverableIcon = (type: string) => {
    switch (type) {
      case "github":
        return <Github className="h-4 w-4" />
      case "screenshot":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Formater la date relative
  const formatRelativeDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr })
  }

  return (
    <div
      className={`rounded-lg border ${getBorderColor()} p-4 transition-all duration-200 ${selected ? "ring-2 ring-slate-400" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-medium text-white">{task.name}</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">{task.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white -mr-2"
          onClick={() => {
            setExpanded(!expanded)
            if (!expanded) onSelect()
          }}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <div className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">{getStatusText()}</div>
        {task.assignedTo && (
          <div className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            {task.assignedTo.name}
          </div>
        )}
        <div className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
          {task.estimatedHours}h estimées
        </div>
        <div className="px-2 py-0.5 rounded-full text-xs bg-green-800/30 text-green-400 flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span>{task.amount}€</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Actions disponibles */}
            <div className="mt-4 flex flex-wrap gap-2">
              {canBeAssigned && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-slate-800 border-slate-600 hover:bg-slate-700"
                  onClick={onAssign}
                >
                  <UserPlus className="mr-1 h-3.5 w-3.5" />
                  S'assigner cette tâche
                </Button>
              )}

              {canSubmitForValidation && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-purple-500/20 text-purple-500 border-purple-500/30 hover:bg-purple-500/30"
                  onClick={() => onStatusChange("attente-validation")}
                >
                  <HourglassIcon className="mr-1 h-3.5 w-3.5" />
                  Soumettre pour validation
                </Button>
              )}

              {canValidateTask && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/30"
                  onClick={() => onStatusChange("validé")}
                >
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  Valider
                </Button>
              )}

              {task.status === "attente-validation" && !isProjectManager && (
                <div className="text-xs text-purple-400 flex items-center">
                  En attente de validation par le chef de projet
                </div>
              )}
            </div>

            {/* Livrables */}
            {task.deliverables.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Livrables</h4>
                <div className="space-y-2">
                  {task.deliverables.map((deliverable, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-md bg-slate-800 border border-slate-700"
                    >
                      <div className="rounded-full bg-slate-700 p-1.5">{getDeliverableIcon(deliverable.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-300 truncate">{deliverable.description || "Livrable"}</div>
                        <div className="text-xs text-slate-400">{formatRelativeDate(deliverable.timestamp)}</div>
                      </div>
                      <a
                        href={deliverable.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        Voir
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commentaires */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Commentaires</h4>
              {task.comments.length > 0 ? (
                <div className="space-y-3 mb-3">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="p-3 rounded-md bg-slate-800 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-slate-300">{comment.userName}</div>
                        <div className="text-xs text-slate-500">{formatRelativeDate(comment.timestamp)}</div>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 mb-3">Aucun commentaire pour le moment</div>
              )}

              {/* Formulaire de commentaire */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ajouter un commentaire..."
                  className="min-h-[80px] bg-slate-800 border-slate-700 resize-none"
                  value={newComment}
                  onChange={(e) => onNewCommentChange(e.target.value)}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={() => onAddComment(newComment)} disabled={!newComment.trim()}>
                  <MessageSquare className="mr-1 h-3.5 w-3.5" />
                  Commenter
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
