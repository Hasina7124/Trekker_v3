"use client"

import { useState } from "react"
import type { Module, Task, User, TaskComment, ProjectManager } from "@/types/project"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCard } from "@/components/task-card"
import { ChevronLeft, Star, Unlock, Lock } from "lucide-react"

interface ModuleDetailsProps {
  module: Module
  onBack: () => void
  currentUser: User
  isTeamLead: boolean
  projectManager: ProjectManager
}

export function ModuleDetails({ module, onBack, currentUser, isTeamLead, projectManager }: ModuleDetailsProps) {
  const [localModule, setLocalModule] = useState<Module>(module)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newComment, setNewComment] = useState("")

  // Filtrer les tâches par statut
  const inactiveTasks = localModule.tasks.filter((task) => task.status === "inactive")
  const inProgressTasks = localModule.tasks.filter((task) => task.status === "en-cours")
  const waitingValidationTasks = localModule.tasks.filter((task) => task.status === "attente-validation")
  const completedTasks = localModule.tasks.filter((task) => task.status === "achevé" || task.status === "validé")

  // Calculer le montant total du module
  const totalAmount = localModule.tasks.reduce((sum, task) => sum + task.amount, 0)

  // Vérifier si l'utilisateur est le chef de projet
  const isProjectManager = currentUser.role === "project_manager" || currentUser.name === projectManager.name

  // Gérer le déverrouillage du module (pour le chef d'équipe)
  const handleUnlockModule = () => {
    if (isTeamLead && localModule.status === "locked") {
      setLocalModule({
        ...localModule,
        status: "unlocked",
        unlockedBy: currentUser,
      })
    }
  }

  // Gérer l'assignation d'une tâche
  const handleAssignTask = (taskId: string) => {
    setLocalModule((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "en-cours",
              assignedTo: currentUser,
            }
          : task,
      ),
    }))
  }

  // Gérer le changement de statut d'une tâche
  const handleChangeTaskStatus = (
    taskId: string,
    newStatus: "inactive" | "en-cours" | "attente-validation" | "achevé" | "validé",
  ) => {
    setLocalModule((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)),
    }))
  }

  // Gérer l'ajout d'un commentaire
  const handleAddComment = (taskId: string) => {
    if (!newComment.trim()) return

    const comment: TaskComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      content: newComment,
      timestamp: new Date().toISOString(),
    }

    setLocalModule((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              comments: [...task.comments, comment],
            }
          : task,
      ),
    }))

    setNewComment("")
  }

  // Déterminer si le module est verrouillé, déverrouillé ou terminé
  const moduleStatus = localModule.status || (localModule.completed ? "completed" : "locked")

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 h-full flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white -ml-2" onClick={onBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-500">{localModule.xp} XP</span>
            <span className="mx-1 text-slate-500">|</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-green-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6" />
              <path d="M12 18v2" />
              <path d="M12 6v2" />
            </svg>
            <span className="text-sm font-medium text-green-500">{totalAmount}€</span>
          </div>
        </div>
        <div className="mt-2">
          <h2 className="text-lg font-semibold text-white">{localModule.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                moduleStatus === "completed"
                  ? "bg-emerald-500/20 text-emerald-500"
                  : moduleStatus === "unlocked"
                    ? "bg-amber-500/20 text-amber-500"
                    : "bg-slate-700 text-slate-400",
              )}
            >
              {moduleStatus === "completed" ? "Achevé" : moduleStatus === "unlocked" ? "Déverrouillé" : "Verrouillé"}
            </div>
            {moduleStatus === "locked" && isTeamLead && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 bg-slate-800 border-slate-600 hover:bg-slate-700 hover:text-white"
                onClick={handleUnlockModule}
              >
                <Unlock className="mr-1 h-3 w-3" />
                Déverrouiller
              </Button>
            )}
          </div>
        </div>
      </div>

      {moduleStatus === "locked" && !isTeamLead ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="rounded-full bg-slate-700 p-4">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-white">Module verrouillé</h3>
          <p className="mt-2 text-sm text-slate-400 text-center max-w-md">
            Ce module est actuellement verrouillé. Seul le chef d'équipe peut le déverrouiller pour permettre à l'équipe
            d'y accéder.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="inactive" className="flex-1 flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inactive" className="data-[state=active]:bg-slate-700">
                À faire ({inactiveTasks.length})
              </TabsTrigger>
              <TabsTrigger value="in-progress" className="data-[state=active]:bg-slate-700">
                En cours ({inProgressTasks.length})
              </TabsTrigger>
              <TabsTrigger value="waiting-validation" className="data-[state=active]:bg-slate-700">
                En attente ({waitingValidationTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-slate-700">
                Achevés ({completedTasks.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="inactive" className="flex-1 p-0 m-0">
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <div className="p-4 space-y-4">
                {inactiveTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    isTeamLead={isTeamLead}
                    isProjectManager={isProjectManager}
                    onAssign={() => handleAssignTask(task.id)}
                    onStatusChange={(status) => handleChangeTaskStatus(task.id, status)}
                    selected={selectedTask?.id === task.id}
                    onSelect={() => setSelectedTask(task)}
                    onAddComment={(comment) => {
                      setNewComment(comment)
                      handleAddComment(task.id)
                    }}
                    newComment={selectedTask?.id === task.id ? newComment : ""}
                    onNewCommentChange={setNewComment}
                  />
                ))}
                {inactiveTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400">Aucune tâche inactive dans ce module.</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="in-progress" className="flex-1 p-0 m-0">
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <div className="p-4 space-y-4">
                {inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    isTeamLead={isTeamLead}
                    isProjectManager={isProjectManager}
                    onAssign={() => handleAssignTask(task.id)}
                    onStatusChange={(status) => handleChangeTaskStatus(task.id, status)}
                    selected={selectedTask?.id === task.id}
                    onSelect={() => setSelectedTask(task)}
                    onAddComment={(comment) => {
                      setNewComment(comment)
                      handleAddComment(task.id)
                    }}
                    newComment={selectedTask?.id === task.id ? newComment : ""}
                    onNewCommentChange={setNewComment}
                  />
                ))}
                {inProgressTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400">Aucune tâche en cours dans ce module.</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="waiting-validation" className="flex-1 p-0 m-0">
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <div className="p-4 space-y-4">
                {waitingValidationTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    isTeamLead={isTeamLead}
                    isProjectManager={isProjectManager}
                    onAssign={() => handleAssignTask(task.id)}
                    onStatusChange={(status) => handleChangeTaskStatus(task.id, status)}
                    selected={selectedTask?.id === task.id}
                    onSelect={() => setSelectedTask(task)}
                    onAddComment={(comment) => {
                      setNewComment(comment)
                      handleAddComment(task.id)
                    }}
                    newComment={selectedTask?.id === task.id ? newComment : ""}
                    onNewCommentChange={setNewComment}
                  />
                ))}
                {waitingValidationTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    Aucune tâche en attente de validation dans ce module.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="completed" className="flex-1 p-0 m-0">
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <div className="p-4 space-y-4">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    isTeamLead={isTeamLead}
                    isProjectManager={isProjectManager}
                    onAssign={() => handleAssignTask(task.id)}
                    onStatusChange={(status) => handleChangeTaskStatus(task.id, status)}
                    selected={selectedTask?.id === task.id}
                    onSelect={() => setSelectedTask(task)}
                    onAddComment={(comment) => {
                      setNewComment(comment)
                      handleAddComment(task.id)
                    }}
                    newComment={selectedTask?.id === task.id ? newComment : ""}
                    onNewCommentChange={setNewComment}
                  />
                ))}
                {completedTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400">Aucune tâche achevée dans ce module.</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// Utilitaire pour les classes conditionnelles
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
