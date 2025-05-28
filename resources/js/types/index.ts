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
    progress: number;
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
    status: 'todo' | 'in_progress' | 'done';
    assignee_id?: number;
}

export interface Part {
    id: number;
    title: string;
    description: string;
    progress: number;
    project_id: number;
}

export interface ProjectUser {
    id: number;
    project_id: number;
    user_id: number;
    role: string;
    user?: User;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface Project {
    id: number;
    title: string;
    description: string;
    status: string;
    admin_id: number;
    manager_id: number;
    end_date?: string;
    budget?: number;
    parts?: Part[];
    project_users?: ProjectUser[];
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

export interface AcceptedProposal {
    id: string;
    value: string;
}

export interface AcceptedProposals {
    goals: AcceptedProposal[];
    startDates: AcceptedProposal[];
    endDates: AcceptedProposal[];
    budgets: AcceptedProposal[];
} 