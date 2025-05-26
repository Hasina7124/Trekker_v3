import axios from 'axios';
import type { Project, PaginatedResponse } from '@/types';

// Configuration d'axios avec l'URL de base de l'API
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true  // Pour gérer les cookies CSRF de Laravel
});

// Intercepteur pour ajouter le token CSRF
api.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

export const projectApi = {
    // Récupérer tous les projets
    getProjects: (page: number = 1) => api.get<PaginatedResponse<Project>>('/projects', { params: { page } }),
    
    // Récupérer les projets du manager
    getManagerProjects: (page: number = 1) => api.get<PaginatedResponse<Project>>('/manager/projects', { params: { page } }),
    
    // Récupérer un projet spécifique
    getProject: (id: number) => api.get<Project>(`/projects/${id}`),
    
    // Mettre à jour un projet
    updateProject: (id: number, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data),
    
    // Créer un nouveau projet
    createProject: (data: Partial<Project>) => api.post<Project>('/projects', data),
    
    // Supprimer un projet
    deleteProject: (id: number) => api.delete(`/projects/${id}`),
}; 