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
    completed: boolean;
    status?: "locked" | "unlocked" | "completed";
}

export type TaskStatus = "en-cours" | "achevé";

export interface TaskDeliverable {
    type: "github" | "screenshot" | "document" | "other";
    url: string;
    description?: string;
    timestamp: string;
}

export interface TaskComment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: string;
}

export interface Task {
    id: number;
    module_id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    status: TaskStatus;
    assignedTo?: User;
    deliverables: TaskDeliverable[];
    comments: TaskComment[];
    estimatedHours: number;
    amount: number;
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
    progress: number;
    modules: Module[];
    projectManager: {
        name: string;
        email: string;
    };
    project_users?: ProjectUser[];
    parts?: Part[];
    Devs?: User[];
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

export interface PageProps<CustomProps = Record<string, unknown>> {
    props: CustomProps;
    url: string;
    version: string | null;
    scrollRegions: Array<{ top: number; left: number }>;
    rememberedState: Record<string, any>;
    errors: Record<string, string>;
    [key: string]: any;
} 