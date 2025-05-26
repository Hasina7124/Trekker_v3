import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export type User  = {
    id: number;
    name: string;
    email: string;
    phone : string;
    adress : string;
    avatar?: string ;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    experience: number;
    role:string;
}

interface BaseConversation {
    id: number;
    name: string;
    is_group: boolean;
    is_user: boolean;
    created_at: string; // Laravel envoie des dates au format ISO (string)
    updated_at: string;
    last_message: string | null;
    last_message_date: string | null;
}

interface UserConversation extends BaseConversation {
    user: User;
    is_group: false;
    is_user: true;
    is_admin: boolean;
    blocked_at: string | null;
    email: string;
    avatar:string;
}

interface GroupConversation extends BaseConversation {
    is_group: true;
    is_user: false;
    description: string | null;
    owner_id: number;
    users: User[]; // tu peux typer `User` si tu veux plus loin
    user_ids: number[];
}

export type Conversation = UserConversation | GroupConversation;

export type Users = User[];

interface Message {
    id: number;
    message: string;
    sender_id: number;
    receiver_id: number;
    sender : User;
    group_id: number;
    conversation_id : number;
    attachments : ChatAttachment;
    created_at: string;
    updated_at: string;
}

interface MessageUser {
    data : Message[];
}

interface ChatAttachment {
    id: number;
    message_id : number;
    name : string;
    mime : string;
    size : string;
    url : string;
    created_at: string;
    updated_at: string;
}

interface Wallet  {
    id: number;
    user_id : number;
    balance : number;
    updated_at: string;
}


// A vérifier
export interface TaskComment {
    id: string
    userId: string
    userName: string
    content: string
    timestamp: string
}

export interface TaskDeliverable {
    type: "github" | "screenshot" | "document" | "other"
    url: string
    description?: string
    timestamp: string
}

export interface Task {
    id: number
    name: string
    description: string
    status: "inactive" | "en-cours" | "attente-validation" | "achevé" | "validé"
    module_id: number
    assignee_id: number | null
    estimated_hours: number
    amount: number
    deliverables: TaskDeliverable[]
    comments: TaskComment[]
    assignedTo?: User
}

export interface NewTask extends Omit<Task, 'id'> {
    id?: number
}

export interface Module {
    id: number
    title: string
    description: string
    xp_rewards: number
    project_id: number
    duration_hours: number
    status?: "locked" | "unlocked" | "completed"
    tasks: Task[]
    completed: boolean
    unlockedBy?: User
}

export interface ProjectManager {
    name: string
    email: string
}

export interface ProjectProposal {
    id: number;
    project_id: number;
    proposer_id: number;
    type: 'budget' | 'start_date' | 'end_date' | 'goal';
    value: Record<string, any>;
    status: 'pending' | 'accepted' | 'rejected'; // adapte selon tes statuts possibles
    validator_id: number | null;
    validated_at: string | null; // ou `Date | null` si tu utilises des objets Date
}


export type PageProps<T = {}> = T & {
    auth?: {
      user?: {
        id: number;
        name: string;
        email: string;
      };
    };
    flash?: {
      success?: string;
      error?: string;
    };
    errors?: Record<string, string>;
  };
  

export interface Goal {
    id: string;
    project_id: number;
    proposer_id: number;
    type: 'budget' | 'start_date' | 'end_date' | 'goal';
    value: string;
    status: 'pending' | 'accepted' | 'rejected'; // adapte selon tes statuts possibles
    validator_id: number | null;
    validated_at: string | null; // ou `Date | null` si tu utilises des objets Date
}

export interface Project {
    id: number
    title: string
    status: "pending" | "active" | "completed" | "rejected"
    progress: number
    description: string
    admin_id: number
    manager_id: number
    start_date: string | null
    end_date: string | null
    modules: Module[]
    proposals: ProjectProposal[]
    budget: number | null
    devs: User[]
    parts: Part[]
}

interface PaginatedResponse<T = any> {
    current_page: number
    data: T[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: Array<{
        url: string | null
        label: string
        active: boolean
    }>
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
}

export interface Part {
    id: string
    name: string
    progress: number
    modules: Module[]
  }
