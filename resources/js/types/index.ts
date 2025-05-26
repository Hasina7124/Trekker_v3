export interface Membre {
    name: string;
}

export interface Module {
    id: number;
    part_id: number;
    title: string;
    description: string;
    xp_rewards: number;
    duration_hours: number;
    created_at: string;
    updated_at: string;
    tasks?: Task[];
}

export type TaskStatus = "en-cours" | "achevé";

export interface Task {
    id: number;
    module_id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    status: TaskStatus;
}

export interface Part {
    id: number;
    project_id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    modules?: Module[];
    progress?: number; // Calculé à partir des modules
}

export interface ProjectUser {
    id: number;
    project_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    user?: User;  // Pour les relations chargées
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Project {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'rejected' | 'completed';
    budget: number;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
    project_users?: ProjectUser[];  // La relation many-to-many avec les utilisateurs
    parts?: Part[]; // Les milestones du projet
    team?: User[];  // Pour l'affichage dans la carte de projet
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
} 