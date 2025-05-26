import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { router } from "@inertiajs/react"
import { ProjectCreationDialog } from "@/components/Admin/project/project-creation-dialog"
import ProjectLayout from "@/layouts/admin/project/layout"
import type { Project } from "@/types"
import Pagination from "@/components/Pagination"
import { ProjectCard } from "@/components/Admin/project/project-card"

type PageProps = {
  projects: {
    data: Project[]
    links: any[]
  }
  filters: {
    status: string
    search: string
  }
  status: string
}

export default function ProjectsPage({ projects, filters, status }: PageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Pour la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get(
      route("project.index"),
      {
        search: searchQuery,
        status: activeTab,
      },
      {
        preserveState: true,
        replace: true,
        only: ["projects"],
        onStart: () => setIsLoading(true),
        onFinish: () => setIsLoading(false),
      },
    )
  }

  // Pour determiner quelle type de tabe est active
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.get(
      route("project.index"),
      {
        status: value,
      },
      {
        preserveState: true,
        replace: true,
        only: ["projects"],
      },
    )
  }

  return (
    <ProjectLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
            <p className="text-slate-400">Gérez vos quêtes et suivez leur progression</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Quête
          </Button>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Rechercher un projet..."
              className="pl-8 bg-white border-slate-700 dark:bg-black dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </form>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="bg-white border-slate-700 dark:bg-black dark:text-white">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="active">En cours</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.data
                .filter((p) => activeTab === "all" || p.status === activeTab)
                .map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
            </div>
          </TabsContent>

        </Tabs>

        <Pagination project={projects} />
        <ProjectCreationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>
    </ProjectLayout>
  )
}
