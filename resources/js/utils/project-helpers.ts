import type { Project, User } from '@/types'

export const getProjectUsers = (project: Project): User[] => {
    return project.project_users?.map(pu => pu.user).filter((user): user is User => user !== undefined) || []
}

export const isUserInProject = (project: Project, userId: number): boolean => {
    return project.project_users?.some(pu => pu.user?.id === userId) || false
} 