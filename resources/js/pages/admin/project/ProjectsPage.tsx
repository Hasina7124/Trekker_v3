import type React from "react"
import { useState, useEffect } from "react"
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
import axios from "axios"

type PageProps = {
  projects?: {
    data: Project[]
    links: any[]
  }
  filters?: {
    status: string
    search: string
  }
  status?: string[]
}

export default function ProjectsPage({ projects: initialProjects, filters: initialFilters, status: initialStatus }: PageProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search || "")
  const [activeTab, setActiveTab] = useState(initialFilters?.status || "all")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [projects, setProjects] = useState(initialProjects)
  const [filters, setFilters] = useState(initialFilters)
  const [status, setStatus] = useState(initialStatus)

  // Fonction pour mettre à jour un projet dans la liste
  const updateProject = (updatedProject: Project) => {
    if (projects) {
      const updatedProjects = {
        ...projects,
        data: projects.data.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        )
      }
      setProjects(updatedProjects)
    }
  }

  // Fonction pour supprimer un projet de la liste
  const removeProject = (projectId: string | number) => {
    if (projects) {
      const updatedProjects = {
        ...projects,
        data: projects.data.filter(project => project.id !== projectId)
      }
      setProjects(updatedProjects)
    }
  }

  // Charger les données
  const loadProjects = async (params: { search?: string; status?: string }) => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/projects", { params })
      setProjects(response.data.projects)
      setFilters(response.data.filters)
      setStatus(response.data.status)
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Pour la recherche
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await loadProjects({ search: searchQuery, status: activeTab })
  }

  // Pour determiner quelle type de tabe est active
  const handleTabChange = async (value: string) => {
    setActiveTab(value)
    await loadProjects({ status: value, search: searchQuery })
  }

  // Charger les données initiales si elles ne sont pas fournies
  useEffect(() => {
    if (!initialProjects) {
      loadProjects({ status: activeTab, search: searchQuery })
    }
  }, [])

  if (!projects) {
    return <div>Chargement...</div>
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
                  <ProjectCard 
                    key={project.id} 
                    project={project}
                    onUpdate={updateProject}
                    onDelete={removeProject}
                  />
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
