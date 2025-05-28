"use client"

import { initCsrf } from "@/services/auth"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Project, PaginatedResponse } from "@/types"
import { projectApi } from "@/services/api"

interface ProjectContextType {
  projects: PaginatedResponse<Project>
  loading: boolean
  error: string | null
  user: {
    id: number
    name: string
    email: string
  }
  getProjectById: (id: string) => Project | undefined
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  createProject: (data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  getManagerProjects: (page?: number) => Promise<void>
  loadProjects: (page?: number) => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// Données temporaires de l'utilisateur (à remplacer par l'authentification réelle)
const userData = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
}

const initialPaginationState: PaginatedResponse<Project> = {
  current_page: 1,
  data: [],
  first_page_url: "",
  from: 0,
  last_page: 1,
  last_page_url: "",
  links: [],
  next_page_url: null,
  path: "",
  per_page: 9,
  prev_page_url: null,
  to: 0,
  total: 0,
}

const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<PaginatedResponse<Project>>(initialPaginationState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getManagerProjects()
  }, [])

  const loadProjects = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await projectApi.getProjects(page)
      setProjects(response.data)
      setError(null)
    } catch (err) {
      setError("Erreur lors du chargement des projets")
      console.error("Erreur lors du chargement des projets:", err)
    } finally {
      setLoading(false)
    }
  }

  const getManagerProjects = async (page: number = 1) => {
    try {
      setLoading(true)
      // S'assurer que le cookie CSRF est initialisé avant de faire la requête
      try {
        await initCsrf()
      } catch (csrfError) {
        console.error("Erreur lors de l'initialisation du CSRF:", csrfError)
      }
      
      const response = await projectApi.getManagerProjects(page)
      setProjects(response.data)
      setError(null)
    } catch (err) {
      setError("Erreur lors du chargement des projets du manager")
      console.error("Erreur lors du chargement des projets du manager:", err)
    } finally {
      setLoading(false)
    }
  }

  const getProjectById = (id: string) => {
    return projects.data.find((p) => p.id.toString() === id)
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const response = await projectApi.updateProject(Number(id), updates)
      setProjects({
        ...projects,
        data: projects.data.map((p) => (p.id.toString() === id ? response.data : p))
      })
      setError(null)
    } catch (err) {
      setError("Erreur lors de la mise à jour du projet")
      console.error("Erreur lors de la mise à jour du projet:", err)
      throw err
    }
  }

  const createProject = async (data: Partial<Project>) => {
    try {
      const response = await projectApi.createProject(data)
      setProjects({
        ...projects,
        data: [...projects.data, response.data],
        total: projects.total + 1
      })
      setError(null)
    } catch (err) {
      setError("Erreur lors de la création du projet")
      console.error("Erreur lors de la création du projet:", err)
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await projectApi.deleteProject(Number(id))
      setProjects({
        ...projects,
        data: projects.data.filter((p) => p.id.toString() !== id),
        total: projects.total - 1
      })
      setError(null)
    } catch (err) {
      setError("Erreur lors de la suppression du projet")
      console.error("Erreur lors de la suppression du projet:", err)
      throw err
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        user: userData,
        getProjectById,
        updateProject,
        createProject,
        deleteProject,
        getManagerProjects,
        loadProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

const useProjects = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider")
  }
  return context
}

export { ProjectProvider, useProjects }
