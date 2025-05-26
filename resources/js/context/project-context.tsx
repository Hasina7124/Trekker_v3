import type { Message, Project } from '@/types';
import { createContext, useContext, useState, type ReactNode } from 'react';

// Sample data
const initialProjects: Project[] = [
    {
        id: 'project-1',
        name: 'E-commerce Platform Redesign',
        description: 'Redesign the user interface and improve the user experience of our e-commerce platform.',
        status: 'in_progress',
        progress: 65,
        deadline: '2025-08-15',
        budget: 25000,
        duration: 45,
        team: [
            { name: 'John Doe', role: 'Designer UI' },
            { name: 'Jane Smith', role: 'Développeur Frontend' },
            { name: 'Mike Johnson', role: 'Développeur Backend' },
            { name: 'Sarah Williams', role: 'Ingénieur QA' },
        ],
        milestones: [
            {
                id: 'milestone-1',
                name: 'Research & Planning',
                progress: 100,
                modules: [
                    {
                        id: 'module-1',
                        name: 'User Research',
                        progress: 100,
                        tasks: [
                            { id: 'task-1', name: 'Conduct user interviews', completed: true },
                            { id: 'task-2', name: 'Analyze user feedback', completed: true },
                            { id: 'task-3', name: 'Create user personas', completed: true },
                        ],
                    },
                    {
                        id: 'module-2',
                        name: 'Competitive Analysis',
                        progress: 100,
                        tasks: [
                            { id: 'task-4', name: 'Research competitors', completed: true },
                            { id: 'task-5', name: 'Identify market trends', completed: true },
                        ],
                    },
                ],
            },
            {
                id: 'milestone-2',
                name: 'Design Phase',
                progress: 75,
                modules: [
                    {
                        id: 'module-3',
                        name: 'Wireframing',
                        progress: 100,
                        tasks: [
                            { id: 'task-6', name: 'Create low-fidelity wireframes', completed: true },
                            { id: 'task-7', name: 'Review wireframes with stakeholders', completed: true },
                        ],
                    },
                    {
                        id: 'module-4',
                        name: 'UI Design',
                        progress: 50,
                        tasks: [
                            { id: 'task-8', name: 'Create style guide', completed: true },
                            { id: 'task-9', name: 'Design key pages', completed: false },
                            { id: 'task-10', name: 'Design responsive layouts', completed: false },
                        ],
                    },
                ],
            },
            {
                id: 'milestone-3',
                name: 'Development',
                progress: 20,
                modules: [
                    {
                        id: 'module-5',
                        name: 'Frontend Implementation',
                        progress: 40,
                        tasks: [
                            { id: 'task-11', name: 'Setup project structure', completed: true },
                            { id: 'task-12', name: 'Implement component library', completed: false },
                            { id: 'task-13', name: 'Build responsive layouts', completed: false },
                        ],
                    },
                    {
                        id: 'module-6',
                        name: 'Backend Integration',
                        progress: 0,
                        tasks: [
                            { id: 'task-14', name: 'API integration', completed: false },
                            { id: 'task-15', name: 'Authentication system', completed: false },
                        ],
                    },
                ],
            },
        ],
        messages: [
            {
                id: 'msg-1',
                sender: 'Admin',
                content: 'Please provide a detailed timeline for the project.',
                timestamp: '2025-05-15T10:30:00Z',
                isAdmin: true,
            },
            {
                id: 'msg-2',
                sender: 'Project Manager',
                content: "I've analyzed the requirements and created a timeline. We should be able to complete the project within 45 days.",
                timestamp: '2025-05-15T11:45:00Z',
                isAdmin: false,
            },
            {
                id: 'msg-3',
                sender: 'Admin',
                content: 'Looks good. Please proceed with the development phase.',
                timestamp: '2025-05-16T09:15:00Z',
                isAdmin: true,
            },
        ],
    },
    {
        id: 'project-2',
        name: 'Mobile App Development',
        description: 'Develop a new mobile application for iOS and Android platforms.',
        status: 'to_estimate',
        progress: 0,
        deadline: null,
        budget: null,
        duration: null,
        team: [
            { name: 'Alex Johnson', role: 'Mobile Developer' },
            { name: 'Emily Davis', role: 'UI/UX Designer' },
        ],
        milestones: [],
        messages: [
            {
                id: 'msg-1',
                sender: 'Admin',
                content: 'We need an estimation for this new mobile app project. Please review the requirements and provide your assessment.',
                timestamp: '2025-05-17T14:20:00Z',
                isAdmin: true,
            },
        ],
    },
    {
        id: 'project-3',
        name: 'Marketing Website Redesign',
        description: "Redesign the company's marketing website to improve conversion rates and user engagement.",
        status: 'pending',
        progress: 0,
        deadline: '2025-09-30',
        budget: 15000,
        duration: 30,
        team: [
            { name: 'Lisa Brown', role: 'Content Writer' },
            { name: 'David Wilson', role: 'Web Designer' },
        ],
        milestones: [],
        messages: [
            {
                id: 'msg-1',
                sender: 'Admin',
                content: "Your estimation has been received. We're reviewing it and will get back to you soon.",
                timestamp: '2025-05-16T16:45:00Z',
                isAdmin: true,
            },
            {
                id: 'msg-2',
                sender: 'Project Manager',
                content: "Thank you. I'm available if you need any clarification on the estimation details.",
                timestamp: '2025-05-16T17:10:00Z',
                isAdmin: false,
            },
        ],
    },
    {
        id: 'project-4',
        name: 'CRM System Integration',
        description: 'Integrate our existing systems with a new CRM solution to improve customer relationship management.',
        status: 'rejected',
        progress: 0,
        deadline: null,
        budget: 35000,
        duration: 60,
        team: [
            { name: 'Robert Taylor', role: 'Systems Analyst' },
            { name: 'Jennifer Moore', role: 'Database Administrator' },
        ],
        milestones: [],
        messages: [
            {
                id: 'msg-1',
                sender: 'Admin',
                content:
                    "We've reviewed your estimation for the CRM integration project. Unfortunately, the budget is higher than expected. We need to reconsider our approach.",
                timestamp: '2025-05-14T11:30:00Z',
                isAdmin: true,
            },
            {
                id: 'msg-2',
                sender: 'Project Manager',
                content:
                    'I understand. Would you like me to provide an alternative solution with a reduced scope to fit within the budget constraints?',
                timestamp: '2025-05-14T13:45:00Z',
                isAdmin: false,
            },
            {
                id: 'msg-3',
                sender: 'Admin',
                content: 'Yes, please provide an alternative proposal with reduced scope and budget.',
                timestamp: '2025-05-14T15:20:00Z',
                isAdmin: true,
            },
        ],
    },
];

// User data
const userData = {
    name: 'Alex Morgan',
    role: 'Project Manager',
    avatar: 'AM',
};

interface ProjectContextType {
    projects: Project[];
    user: typeof userData;
    getProjectById: (id: string) => Project | undefined;
    updateProject: (id: string, updates: Partial<Project>) => void;
    addMessageToProject: (id: string, message: Message) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);

    const getProjectById = (id: string) => {
        return projects.find((project) => project.id === id);
    };

    const updateProject = (id: string, updates: Partial<Project>) => {
        setProjects((prevProjects) => prevProjects.map((project) => (project.id === id ? { ...project, ...updates } : project)));
    };

    const addMessageToProject = (id: string, message: Message) => {
        setProjects((prevProjects) =>
            prevProjects.map((project) => {
                if (project.id === id) {
                    return {
                        ...project,
                        messages: [...(project.messages || []), message],
                    };
                }
                return project;
            }),
        );
    };

    return (
        <ProjectContext.Provider
            value={{
                projects,
                user: userData,
                getProjectById,
                updateProject,
                addMessageToProject,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
}
