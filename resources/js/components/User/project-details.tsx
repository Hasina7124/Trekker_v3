"use client"

import type { Project, Module, User } from "@/types"
import { ProgressTracker } from "@/components/User/progress-tracker"
import { ModuleCard } from "@/components/User/module-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/User/ui/tabs"
import { ScrollArea } from "@/components/User/ui/scroll-area"
import { Mail } from "lucide-react"

interface ProjectDetailsProps {
  project: Project
  onModuleSelect: (module: Module) => void
  currentUser: User
}

export function ProjectDetails({ project, onModuleSelect, currentUser }: ProjectDetailsProps) {
  const completedModules = project.modules.filter((module: Module) => module.completed)
  const pendingModules = project.modules.filter((module: Module) => !module.completed)

  const totalXP = project.modules.reduce((sum: number, module: Module) => sum + module.xp_rewards, 0)
  const earnedXP = completedModules.reduce((sum: number, module: Module) => sum + module.xp_rewards, 0)

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 h-full flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">{project.title}</h2>
        <p className="text-sm text-slate-400 mt-1">{project.description}</p>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-400">Chef de projet</h3>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              {project.projectManager.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{project.projectManager.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3 text-slate-400" />
                <p className="text-xs text-slate-400">{project.projectManager.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700">
        <ProgressTracker
          progress={project.progress}
          earnedXP={earnedXP}
          totalXP={totalXP}
          completedModules={completedModules.length}
          totalModules={project.modules.length}
        />
      </div>

      <Tabs defaultValue="pending" className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700">
              À faire ({pendingModules.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-slate-700">
              Achevés ({completedModules.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[calc(100vh-30rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {pendingModules.map((module: Module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  status={module.status || "locked"}
                  onClick={() => onModuleSelect(module)}
                />
              ))}
              {pendingModules.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-400">Tous les modules sont achevés !</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[calc(100vh-30rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {completedModules.map((module: Module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  status="completed"
                  onClick={() => onModuleSelect(module)}
                />
              ))}
              {completedModules.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-400">Aucun module achevé pour le moment.</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
