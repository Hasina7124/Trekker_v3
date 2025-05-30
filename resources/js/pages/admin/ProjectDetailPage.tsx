import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectLayout from '@/layouts/admin/project/layout';
import { PageProps, Project } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Check, Clock, DollarSign, Edit, Plus, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
type Proposal = {
    id: string;
    value: string | number;
    status: string;
    type: string;
    project_id: string;
    proposer_id: string;
    validator_id?: string;
    validated_at?: string;
};

type ProposalStatus = 'pending' | 'accepted' | 'rejected';
type MemberRole = 'Project Manager' | 'Developer' | 'Designer' | 'Analyst' | 'Tester';
type ConfirmationAction = 'validate' | 'reject' | 'delete';
type ConfirmationTarget = 'objective' | 'startDate' | 'endDate' | 'budget';

type Member = {
    id: string;
    name: string;
    role: MemberRole;
    level: string;
    avatar?: string;
};

type ProjectDetailPageProps = {
    project: Project;
    proposals?: {
        data: Proposal[];
        meta: {
            total: number;
            project_id: string;
        };
    };
};

type TabsValue = 'objectives' | 'constraints' | 'members';
type SubTabValue = 'time' | 'budget';

const statusColors = {
    active: 'bg-emerald-500',
    completed: 'bg-blue-500',
    pending: 'bg-amber-500',
    canceled: 'bg-rose-500',
};

interface TabsProps {
    value: TabsValue | SubTabValue;
    onValueChange: (value: TabsValue | SubTabValue) => void;
    children: React.ReactNode;
    className?: string;
}

export default function ProjectDetailPage() {
    const page = usePage<PageProps<ProjectDetailPageProps>>();
    const currentProject = page.props.project as Project;
    const initialProposals = page.props.proposals;
    const projectId = currentProject.id;

    // State management
    const [mainTab, setMainTab] = useState<TabsValue>('objectives');
    const [subTab, setSubTab] = useState<SubTabValue>('time');
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction>('validate');
    const [confirmationTarget, setConfirmationTarget] = useState<ConfirmationTarget>('objective');
    const [itemToAction, setItemToAction] = useState('');
    const [editObjectiveOpen, setEditObjectiveOpen] = useState(false);
    const [editingObjective, setEditingObjective] = useState<Proposal | undefined>();

    // Proposals state
    const [proposals, setProposals] = useState<{
        goal: Proposal[];
        time: Proposal[];
        budget: Proposal[];
    }>({
        goal: [],
        time: [],
        budget: []
    });

    // State pour les propositions validées
    const [acceptedProposals, setAcceptedProposals] = useState<{
        goals: Proposal[];
        startDates: Proposal[];
        endDates: Proposal[];
        budgets: Proposal[];
    } | null>(null);

    // Initialiser les propositions avec les données initiales
    useEffect(() => {
        if (initialProposals?.data) {
            // Séparer les propositions par type
            const goalProposals = initialProposals.data.filter((p: Proposal) => p.type === 'goal');
            const timeProposals = initialProposals.data.filter((p: Proposal) => ['start_date', 'end_date'].includes(p.type));
            const budgetProposals = initialProposals.data.filter((p: Proposal) => p.type === 'budget');

            // Mettre à jour l'état
            setProposals({
                goal: goalProposals,
                time: timeProposals,
                budget: budgetProposals
            });

            console.log('Propositions chargées:', {
                objectifs: goalProposals,
                temps: timeProposals,
                budget: budgetProposals
            });
        }
    }, [initialProposals]);

    // Séparer les propositions de temps par type
    const startDateProposals = proposals.time.filter(p => p.type === 'start_date');
    const endDateProposals = proposals.time.filter(p => p.type === 'end_date');

    // Charger les propositions acceptées
    useEffect(() => {
        const fetchAcceptedProposals = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}/accepted-proposals`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Propositions acceptées reçues:', data);
                setAcceptedProposals(data);
            } catch (error) {
                console.error('Erreur lors du chargement des propositions acceptées:', error);
                toast.error('Erreur lors du chargement des propositions acceptées');
            }
        };

        fetchAcceptedProposals();
    }, [projectId]);

    // Vérifier si le projet peut être activé
    const canActivateProject = acceptedProposals ? (
        acceptedProposals.goals.length > 0 &&
        acceptedProposals.startDates.length > 0 &&
        acceptedProposals.endDates.length > 0 &&
        acceptedProposals.budgets.length > 0
    ) : false;

    // Fonction utilitaire pour vérifier si les propositions sont chargées
    const areProposalsLoaded = () => {
        return acceptedProposals !== null;
    };

    // Fonction pour obtenir le nombre de propositions acceptées en toute sécurité
    const getAcceptedProposalsCount = (type: 'goals' | 'startDates' | 'endDates' | 'budgets') => {
        return acceptedProposals ? acceptedProposals[type].length : 0;
    };

    // Form states
    const [newObjective, setNewObjective] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');
    const [newBudgetAmount, setNewBudgetAmount] = useState('');

    // State for new inputs
    const [newProposal, setNewProposal] = useState('');

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Non définie';
        const date = new Date(dateString);
        return format(date, "EEEE dd MMMM yyyy", { locale: fr }).replace(/^\w/, c => c.toUpperCase());
    };

    // Handle budget input change
    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Accepte uniquement les chiffres et le point décimal
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setNewBudgetAmount(value);
        }
    };

    // Format budget for display
    const formatBudget = (value: string | number): string => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(numericValue);
    };

    // Render status icon
    const renderStatusIcon = (status: ProposalStatus) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-amber-500" />;
            case 'accepted':
                return <Check className="h-4 w-4 text-emerald-500" />;
            case 'rejected':
                return <X className="h-4 w-4 text-rose-500" />;
        }
    };

    // Fetch proposals function
    const fetchProposals = async (type?: 'goal' | 'time' | 'budget') => {
        try {
            const apiUrl = `/api/projects/${currentProject.id}/proposals${type ? `/${type}` : ''}`;
            console.log('Fetching proposals from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch proposals');
            }

            const data = await response.json();
            
            // Mise à jour de l'état en fonction du type
            if (type) {
                setProposals(prev => ({
                    ...prev,
                    [type]: data.data.filter((p: Proposal) => {
                        if (type === 'time') {
                            return ['start_date', 'end_date'].includes(p.type);
                        }
                        return p.type === type;
                    })
                }));
            } else {
                // Si aucun type n'est spécifié, organiser toutes les propositions
                const goalProposals = data.data.filter((p: Proposal) => p.type === 'goal');
                const timeProposals = data.data.filter((p: Proposal) => ['start_date', 'end_date'].includes(p.type));
                const budgetProposals = data.data.filter((p: Proposal) => p.type === 'budget');

                setProposals({
                    goal: goalProposals,
                    time: timeProposals,
                    budget: budgetProposals
                });
            }

            console.log('Propositions récupérées:', {
                type,
                données: data.data
            });
        } catch (error: any) {
            console.error('Erreur lors de la récupération des propositions:', error);
            toast.error(error.message || 'Échec de la récupération des propositions');
        }
    };

    // Handle adding a new proposal
    const handleAddProposal = async (type: 'goal' | 'start_date' | 'end_date' | 'budget', value: string) => {
        try {
            const response = await fetch(`/api/projects/${currentProject.id}/proposals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ type, value }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add proposal');
            }

            // Clear form fields
            if (type === 'goal') setNewObjective('');
            if (type === 'start_date') setNewStartDate('');
            if (type === 'end_date') setNewEndDate('');
            if (type === 'budget') setNewBudgetAmount('');

            // Refresh data
            if (type === 'goal') fetchProposals('goal');
            if (type === 'start_date' || type === 'end_date') fetchProposals('time');
            if (type === 'budget') fetchProposals('budget');

            toast.success('Proposal added successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add proposal');
        }
    };

    // Handle updating proposal status
    const updateProposalStatus = async (id: string, status: 'accepted' | 'rejected' | 'pending') => {
        try {
            // Trouver la proposition dans l'état local
            let updatedProposal: Proposal | undefined;
            let proposalType: 'goal' | 'start_date' | 'end_date' | 'budget' | undefined;

            console.log('Début updateProposalStatus:', { id, status });

            // Chercher dans les objectifs
            updatedProposal = proposals.goal.find(p => p.id === id);
            if (updatedProposal) {
                proposalType = 'goal';
            }

            // Chercher dans les dates
            if (!updatedProposal) {
                updatedProposal = proposals.time.find(p => p.id === id);
                if (updatedProposal) {
                    proposalType = updatedProposal.type as 'start_date' | 'end_date';
                }
            }

            // Chercher dans le budget
            if (!updatedProposal) {
                updatedProposal = proposals.budget.find(p => p.id === id);
                if (updatedProposal) {
                    proposalType = 'budget';
                }
            }

            console.log('Proposition trouvée:', { updatedProposal, proposalType });

            if (!updatedProposal || !proposalType) {
                throw new Error('Proposition non trouvée');
            }

            // Vérification supplémentaire pour les propositions uniques
            if (status === 'accepted') {
                const existingAccepted = acceptedProposals ? {
                    start_date: acceptedProposals.startDates.length > 0,
                    end_date: acceptedProposals.endDates.length > 0,
                    budget: acceptedProposals.budgets.length > 0
                } : { start_date: false, end_date: false, budget: false };

                // Si une proposition du même type est déjà acceptée, on la rejette d'abord
                if (proposalType !== 'goal' && existingAccepted[proposalType as keyof typeof existingAccepted]) {
                    console.log('Une proposition du même type est déjà acceptée, rejet en cours...');
                    const currentAccepted = proposalType === 'budget' 
                        ? acceptedProposals?.budgets[0]
                        : proposalType === 'start_date'
                            ? acceptedProposals?.startDates[0]
                            : acceptedProposals?.endDates[0];

                    if (currentAccepted) {
                        await fetch(`/api/projects/proposals/${currentAccepted.id}/status`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            credentials: 'include',
                            body: JSON.stringify({ status: 'rejected' })
                        });
                    }
                }

                // Rejeter toutes les autres propositions du même type
                if (proposalType !== 'goal') {
                    console.log('Tentative de rejet des autres propositions du même type');
                    
                    const otherProposals = proposalType === 'budget' 
                        ? proposals.budget.filter(p => p.id !== id)
                        : proposals.time.filter(p => p.type === proposalType && p.id !== id);

                    console.log('Autres propositions à rejeter:', otherProposals);

                    for (const proposal of otherProposals) {
                        if (proposal.status !== 'rejected') {
                            console.log('Rejet de la proposition:', proposal.id);
                            try {
                                const rejectResponse = await fetch(`/api/projects/proposals/${proposal.id}/status`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json',
                                        'X-Requested-With': 'XMLHttpRequest',
                                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify({ status: 'rejected' })
                                });

                                if (!rejectResponse.ok) {
                                    console.error('Erreur lors du rejet:', await rejectResponse.json());
                                }
                            } catch (error) {
                                console.error('Erreur lors du rejet de la proposition:', error);
                            }
                        }
                    }
                }
            }

            // Mettre à jour le statut de la proposition sélectionnée
            console.log('Mise à jour du statut de la proposition principale:', id);
            const response = await fetch(`/api/projects/proposals/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du statut');
            }

            // Mettre à jour l'état local des propositions acceptées
            setAcceptedProposals(prev => {
                if (!prev) return prev;
                console.log('Mise à jour des propositions acceptées:', { prev, proposalType, status });
                
                const newState = { ...prev };

                if (status === 'accepted') {
                    // Ajouter la proposition aux propositions acceptées
                    switch (proposalType) {
                        case 'goal':
                            newState.goals = [...prev.goals, updatedProposal!];
                            break;
                        case 'start_date':
                            // Remplacer l'ancienne date de début par la nouvelle
                            newState.startDates = [updatedProposal!];
                            break;
                        case 'end_date':
                            // Remplacer l'ancienne date de fin par la nouvelle
                            newState.endDates = [updatedProposal!];
                            break;
                        case 'budget':
                            // Remplacer l'ancien budget par le nouveau
                            newState.budgets = [updatedProposal!];
                            break;
                    }
                } else if (status === 'pending' || status === 'rejected') {
                    // Retirer la proposition des propositions acceptées
                    switch (proposalType) {
                        case 'goal':
                            newState.goals = prev.goals.filter(p => p.id !== id);
                            break;
                        case 'start_date':
                            newState.startDates = prev.startDates.filter(p => p.id !== id);
                            break;
                        case 'end_date':
                            newState.endDates = prev.endDates.filter(p => p.id !== id);
                            break;
                        case 'budget':
                            newState.budgets = prev.budgets.filter(p => p.id !== id);
                            break;
                    }
                }

                console.log('Nouvel état des propositions acceptées:', newState);
                return newState;
            });

            // Mettre à jour l'état des propositions
            await fetchProposals();

            toast.success(
                status === 'accepted' ? 'Proposition acceptée' :
                status === 'rejected' ? 'Proposition rejetée' :
                'Proposition remise en attente'
            );

            setConfirmationOpen(false);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            toast.error('Erreur lors de la mise à jour du statut');
        }
    };

    // Handle deleting a proposal
    const deleteProposal = async (id: string) => {
        try {
            const apiUrl = `/api/projects/proposals/${id}`;
            console.log('Deleting proposal:', { apiUrl });

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete proposal');
            }

            // Refresh data
            if (mainTab === 'objectives') fetchProposals('goal');
            else if (mainTab === 'constraints') {
                if (subTab === 'time') fetchProposals('time');
                else if (subTab === 'budget') fetchProposals('budget');
            }

            toast.success('Proposal deleted successfully');
        } catch (error: any) {
            console.error('Erreur lors de la suppression:', error);
            toast.error(error.message || 'Échec de la suppression');
        }
    };

    // Handle editing a proposal
    const editProposal = async (id: string, value: string, type: string) => {
        try {
            const apiUrl = `/api/projects/proposals/${id}`;
            console.log('Editing proposal:', { apiUrl, value, type });

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ value, type }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update proposal');
            }

            // Refresh data
            if (mainTab === 'objectives') fetchProposals('goal');
            else if (mainTab === 'constraints') {
                if (subTab === 'time') fetchProposals('time');
                else if (subTab === 'budget') fetchProposals('budget');
            }

            toast.success('Proposal updated successfully');
            setEditObjectiveOpen(false);
        } catch (error: any) {
            console.error('Erreur lors de la modification:', error);
            toast.error(error.message || 'Échec de la modification');
        }
    };

    // Confirmation dialog handlers
    const openConfirmationDialog = (action: ConfirmationAction, target: ConfirmationTarget, id: string) => {
        setConfirmationAction(action);
        setConfirmationTarget(target);
        setItemToAction(id);
        setConfirmationOpen(true);
    };

    const handleConfirmAction = () => {
        switch (confirmationAction) {
            case 'validate':
            case 'reject':
                updateProposalStatus(itemToAction, confirmationAction === 'validate' ? 'accepted' : 'rejected');
                break;
            case 'delete':
                deleteProposal(itemToAction);
                break;
        }
        setConfirmationOpen(false);
    };

    // Team members data
    const members: Member[] = [
        {
            id: 'mem1',
            name: 'Sarah Johnson',
            role: 'Project Manager',
            level: 'Senior',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        // ... other members
    ];

    // Load initial data
    useEffect(() => {
        if (mainTab === 'objectives') {
            fetchProposals('goal');
        } else if (mainTab === 'constraints') {
            if (subTab === 'time') {
                fetchProposals('time');
            } else if (subTab === 'budget') {
                fetchProposals('budget');
            }
        }
    }, [mainTab, subTab]);

    // Load data when component mounts
    useEffect(() => {
        fetchProposals('goal');
    }, []);

    // Handle tab changes with type assertion
    const handleMainTabChange = (value: string) => {
        setMainTab(value as TabsValue);
    };

    const handleSubTabChange = (value: string) => {
        setSubTab(value as SubTabValue);
    };

    // Fonction pour activer le projet
    const activateProject = async () => {
        try {
            const response = await fetch(`/api/projects/${currentProject.id}/activate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to activate project');
            }

            toast.success('Project activated successfully');
            // Recharger la page pour mettre à jour le statut
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Failed to activate project');
        }
    };

    // Fonction pour rejeter le projet
    const rejectProject = async () => {
        try {
            const response = await fetch(`/api/projects/${currentProject.id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to reject project');
            }

            toast.success('Projet rejeté avec succès');
            // Recharger la page pour mettre à jour le statut
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Échec du rejet du projet');
        }
    };

    return (
        <ProjectLayout>
            <div className="min-h-screen bg-slate-800 p-6 text-white">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header with back button and project title */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/projects">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">{currentProject.title}</h1>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-sm text-slate-400">Project ID: {currentProject.id}</span>
                                    <Badge className={`${statusColors[currentProject.status as keyof typeof statusColors]}`}>
                                        {currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project description */}
                    <Card className="border-slate-700 bg-slate-900">
                        <CardHeader>
                            <CardTitle>Project Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-300">{currentProject.description}</p>
                        </CardContent>
                    </Card>

                    {/* Validated Proposals Summary Card */}
                    <Card className="border-slate-700 bg-slate-900">
                        <CardHeader>
                            <CardTitle>Validated Proposals</CardTitle>
                            <CardDescription className="text-slate-400">
                                Summary of all accepted proposals for this project
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Validated Objectives */}
                                <div>
                                    <h3 className="mb-3 text-lg font-medium">Accepted Objectives</h3>
                                    <div className="space-y-2">
                                        {getAcceptedProposalsCount('goals') > 0 && acceptedProposals ? (
                                            acceptedProposals.goals.map(goal => (
                                                <div key={goal.id} className="rounded-md bg-slate-800 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                            <span className="text-slate-200">{goal.value}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 italic">Aucun objectif accepté</p>
                                        )}
                                    </div>
                                </div>

                                {/* Validated Time Constraints - Start Date */}
                                <div>
                                    <h3 className="mb-3 text-lg font-medium">Accepted Start Dates</h3>
                                    <div className="space-y-2">
                                        {getAcceptedProposalsCount('startDates') > 0 && acceptedProposals ? (
                                            acceptedProposals.startDates.map(time => (
                                                <div key={time.id} className="rounded-md bg-slate-800 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                            <span className="text-slate-200">
                                                                {formatDate(String(time.value))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 italic">Aucune date de début acceptée</p>
                                        )}
                                    </div>
                                </div>

                                {/* Validated Time Constraints - End Date */}
                                <div>
                                    <h3 className="mb-3 text-lg font-medium">Accepted End Dates</h3>
                                    <div className="space-y-2">
                                        {getAcceptedProposalsCount('endDates') > 0 && acceptedProposals ? (
                                            acceptedProposals.endDates.map(time => (
                                                <div key={time.id} className="rounded-md bg-slate-800 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                            <span className="text-slate-200">
                                                                {formatDate(String(time.value))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 italic">Aucune date de fin acceptée</p>
                                        )}
                                    </div>
                                </div>

                                {/* Validated Budget */}
                                <div>
                                    <h3 className="mb-3 text-lg font-medium">Accepted Budget</h3>
                                    <div className="space-y-2">
                                        {getAcceptedProposalsCount('budgets') > 0 && acceptedProposals ? (
                                            acceptedProposals.budgets.map(budget => (
                                                <div key={budget.id} className="rounded-md bg-slate-800 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                            <span className="text-slate-200">
                                                                {formatBudget(budget.value)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 italic">Aucun budget accepté</p>
                                        )}
                                    </div>
                                </div>

                                {/* Project Action Buttons */}
                                {currentProject.status === 'pending' && (
                                    <div className="mt-6 flex justify-end gap-2">
                                        <Button
                                            onClick={rejectProject}
                                            className="bg-rose-600 hover:bg-rose-700"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Rejeter le projet
                                        </Button>
                                        <Button
                                            onClick={activateProject}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            disabled={!canActivateProject}
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            Valider le projet
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project details tabs */}
                    <Tabs 
                        value={mainTab} 
                        onValueChange={handleMainTabChange} 
                        className="w-full"
                    >
                        <TabsList className="border-slate-700 bg-slate-900">
                            <TabsTrigger
                                value="objectives"
                                onClick={() => {
                                    handleMainTabChange('objectives');
                                    fetchProposals('goal');
                                }}
                            >
                                Objectives
                            </TabsTrigger>
                            <TabsTrigger
                                value="constraints"
                                onClick={() => {
                                    handleMainTabChange('constraints');
                                    handleSubTabChange('time');
                                    fetchProposals('time');
                                }}
                            >
                                Constraints
                            </TabsTrigger>
                            <TabsTrigger value="members">Members</TabsTrigger>
                        </TabsList>

                        {/* Objectives tab */}
                        <TabsContent value="objectives">
                            <Card className="border-slate-700 bg-slate-900">
                                <CardHeader>
                                    <CardTitle>Project Objectives</CardTitle>
                                    <CardDescription className="text-slate-400">Define and track project goals</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Liste des objectifs */}
                                        {proposals.goal.filter(obj => obj.type === 'goal').length > 0 ? (
                                            proposals.goal.filter(obj => obj.type === 'goal').map((objective) => (
                                                <div
                                                    key={objective.id}
                                                    className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {renderStatusIcon(objective.status as ProposalStatus)}
                                                        <span className="text-slate-200">{objective.value}</span>
                                                    </div>
                                                    {currentProject.status === 'pending' && (
                                                        <div className="flex items-center gap-2">
                                                            {objective.status === 'pending' && (
                                                                <>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-8 w-8 border-emerald-700 bg-slate-800 hover:bg-emerald-900 hover:text-emerald-500"
                                                                        onClick={() => openConfirmationDialog('validate', 'objective', objective.id)}
                                                                    >
                                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-8 w-8 border-rose-700 bg-slate-800 hover:bg-rose-900 hover:text-rose-500"
                                                                        onClick={() => openConfirmationDialog('reject', 'objective', objective.id)}
                                                                    >
                                                                        <X className="h-4 w-4 text-rose-500" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                onClick={() => openConfirmationDialog('delete', 'objective', objective.id)}
                                                            >
                                                                <Trash className="h-4 w-4 text-slate-400" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                onClick={() => {
                                                                    setEditingObjective(objective);
                                                                    setEditObjectiveOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4 text-slate-400" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No objectives found</p>
                                        )}
                                    </div>

                                    {/* Add new objective - Only show when project is pending */}
                                    {currentProject.status === 'pending' && (
                                        <div className="mt-4 flex gap-2">
                                            <Input
                                                placeholder="Add a new objective..."
                                                value={newObjective}
                                                onChange={(e) => setNewObjective(e.target.value)}
                                                className="border-slate-700 bg-slate-800 text-white"
                                            />
                                            <Button onClick={() => handleAddProposal('goal', newObjective)} className="bg-blue-600 hover:bg-blue-700">
                                                <Plus className="mr-2 h-4 w-4" /> Add
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Constraints tab */}
                        <TabsContent value="constraints">
                            <Card className="border-slate-700 bg-slate-900">
                                <CardHeader>
                                    <CardTitle>Project Constraints</CardTitle>
                                    <CardDescription className="text-slate-400">Time and budget limitations for this project</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={subTab} onValueChange={handleSubTabChange} className="w-full">
                                        <TabsList className="border-slate-700 bg-slate-800">
                                            <TabsTrigger
                                                value="time"
                                                onClick={() => {
                                                    handleSubTabChange('time');
                                                    fetchProposals('time');
                                                }}
                                            >
                                                Time
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="budget"
                                                onClick={() => {
                                                    handleSubTabChange('budget');
                                                    fetchProposals('budget');
                                                }}
                                            >
                                                Budget
                                            </TabsTrigger>
                                        </TabsList>

                                        {/* Time tab */}
                                        <TabsContent value="time">
                                            <Card className="mt-4 border-slate-700 bg-slate-800">
                                                <CardContent className="pt-6">
                                                    <div className="space-y-4">
                                                        <h3 className="mb-3 text-lg font-medium">Start Date Proposals</h3>

                                                        {/* Start Date proposals list */}
                                                        <div className="space-y-3">
                                                            {proposals.time.filter((p) => p.type === 'start_date').length > 0 ? (
                                                                proposals.time
                                                                    .filter((p) => p.type === 'start_date')
                                                                    .map((proposal) => (
                                                                        <div
                                                                            key={proposal.id}
                                                                            className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                {renderStatusIcon(proposal.status as ProposalStatus)}
                                                                                <span className="text-slate-200">
                                                                                    {formatDate(String(proposal.value))}
                                                                                </span>
                                                                            </div>
                                                                            {currentProject.status === 'pending' && (
                                                                                <div className="flex items-center gap-2">
                                                                                    {proposal.status === 'pending' && (
                                                                                        <>
                                                                                            <Button
                                                                                                size="icon"
                                                                                                variant="outline"
                                                                                                className="h-8 w-8 border-emerald-700 bg-slate-800 hover:bg-emerald-900 hover:text-emerald-500"
                                                                                                onClick={() =>
                                                                                                    openConfirmationDialog('validate', 'startDate', proposal.id)
                                                                                                }
                                                                                            >
                                                                                                <Check className="h-4 w-4 text-emerald-500" />
                                                                                            </Button>
                                                                                            <Button
                                                                                                size="icon"
                                                                                                variant="outline"
                                                                                                className="h-8 w-8 border-rose-700 bg-slate-800 hover:bg-rose-900 hover:text-rose-500"
                                                                                                onClick={() =>
                                                                                                    openConfirmationDialog('reject', 'startDate', proposal.id)
                                                                                                }
                                                                                            >
                                                                                                <X className="h-4 w-4 text-rose-500" />
                                                                                            </Button>
                                                                                        </>
                                                                                    )}
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="outline"
                                                                                        className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                                        onClick={() =>
                                                                                            openConfirmationDialog('delete', 'startDate', proposal.id)
                                                                                        }
                                                                                    >
                                                                                        <Trash className="h-4 w-4 text-slate-400" />
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                            ) : (
                                                                <p className="text-gray-500 italic">No start date proposals found</p>
                                                            )}
                                                        </div>

                                                        {/* Add new start date proposal - Only show when project is pending */}
                                                        {currentProject.status === 'pending' && (
                                                            <div className="mt-4 flex gap-2">
                                                                <Input
                                                                    type="date"
                                                                    value={newStartDate}
                                                                    onChange={(e) => setNewStartDate(e.target.value)}
                                                                    className="border-slate-700 bg-slate-800 text-white"
                                                                />
                                                                <Button
                                                                    onClick={() => handleAddProposal('start_date', newStartDate)}
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    <Plus className="mr-2 h-4 w-4" /> Add
                                                                </Button>
                                                            </div>
                                                        )}

                                                        <Separator className="my-4 bg-slate-700" />
                                                        <h3 className="mb-3 text-lg font-medium">End Date Proposals</h3>

                                                        {/* End Date proposals list */}
                                                        <div className="space-y-3">
                                                            {proposals.time.filter((p) => p.type === 'end_date').length > 0 ? (
                                                                proposals.time
                                                                    .filter((p) => p.type === 'end_date')
                                                                    .map((proposal) => (
                                                                        <div
                                                                            key={proposal.id}
                                                                            className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                {renderStatusIcon(proposal.status as ProposalStatus)}
                                                                                <span className="text-slate-200">
                                                                                    {formatDate(String(proposal.value))}
                                                                                </span>
                                                                            </div>
                                                                            {currentProject.status === 'pending' && (
                                                                                <div className="flex items-center gap-2">
                                                                                    {proposal.status === 'pending' && (
                                                                                        <>
                                                                                            <Button
                                                                                                size="icon"
                                                                                                variant="outline"
                                                                                                className="h-8 w-8 border-emerald-700 bg-slate-800 hover:bg-emerald-900 hover:text-emerald-500"
                                                                                                onClick={() =>
                                                                                                    openConfirmationDialog('validate', 'endDate', proposal.id)
                                                                                                }
                                                                                            >
                                                                                                <Check className="h-4 w-4 text-emerald-500" />
                                                                                            </Button>
                                                                                            <Button
                                                                                                size="icon"
                                                                                                variant="outline"
                                                                                                className="h-8 w-8 border-rose-700 bg-slate-800 hover:bg-rose-900 hover:text-rose-500"
                                                                                                onClick={() =>
                                                                                                    openConfirmationDialog('reject', 'endDate', proposal.id)
                                                                                                }
                                                                                            >
                                                                                                <X className="h-4 w-4 text-rose-500" />
                                                                                            </Button>
                                                                                        </>
                                                                                    )}
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="outline"
                                                                                        className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                                        onClick={() =>
                                                                                            openConfirmationDialog('delete', 'endDate', proposal.id)
                                                                                        }
                                                                                    >
                                                                                        <Trash className="h-4 w-4 text-slate-400" />
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                            ) : (
                                                                <p className="text-gray-500 italic">No end date proposals found</p>
                                                            )}
                                                        </div>

                                                        {/* Add new end date proposal - Only show when project is pending */}
                                                        {currentProject.status === 'pending' && (
                                                            <div className="mt-4 flex gap-2">
                                                                <Input
                                                                    type="date"
                                                                    value={newEndDate}
                                                                    onChange={(e) => setNewEndDate(e.target.value)}
                                                                    className="border-slate-700 bg-slate-800 text-white"
                                                                />
                                                                <Button
                                                                    onClick={() => handleAddProposal('end_date', newEndDate)}
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    <Plus className="mr-2 h-4 w-4" /> Add
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Budget tab */}
                                        <TabsContent value="budget">
                                            <Card className="mt-4 border-slate-700 bg-slate-800">
                                                <CardContent className="pt-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <DollarSign className="h-5 w-5 text-emerald-500" />
                                                            <div>
                                                                <p className="text-sm text-slate-400">Total Budget</p>
                                                                <p className="text-slate-200">
                                                                    {currentProject.budget
                                                                        ? `$${Number(currentProject.budget).toLocaleString()}`
                                                                        : 'Not set'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <Separator className="my-4 bg-slate-700" />
                                                        <h3 className="mb-3 text-lg font-medium">Budget Proposals</h3>

                                                        {/* Budget proposals list */}
                                                        <div className="space-y-3">
                                                            {proposals.budget.length > 0 ? (
                                                                proposals.budget.map((proposal) => (
                                                                    <div
                                                                        key={proposal.id}
                                                                        className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {renderStatusIcon(proposal.status as ProposalStatus)}
                                                                            <span className="text-slate-200">${proposal.value}</span>
                                                                        </div>
                                                                        {currentProject.status === 'pending' && (
                                                                            <div className="flex items-center gap-2">
                                                                                {proposal.status === 'pending' && (
                                                                                    <>
                                                                                        <Button
                                                                                            size="icon"
                                                                                            variant="outline"
                                                                                            className="h-8 w-8 border-emerald-700 bg-slate-800 hover:bg-emerald-900 hover:text-emerald-500"
                                                                                            onClick={() =>
                                                                                                openConfirmationDialog('validate', 'budget', proposal.id)
                                                                                            }
                                                                                        >
                                                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="icon"
                                                                                            variant="outline"
                                                                                            className="h-8 w-8 border-rose-700 bg-slate-800 hover:bg-rose-900 hover:text-rose-500"
                                                                                            onClick={() =>
                                                                                                openConfirmationDialog('reject', 'budget', proposal.id)
                                                                                            }
                                                                                        >
                                                                                            <X className="h-4 w-4 text-rose-500" />
                                                                                        </Button>
                                                                                    </>
                                                                                )}
                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="outline"
                                                                                    className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                                    onClick={() =>
                                                                                        openConfirmationDialog('delete', 'budget', proposal.id)
                                                                                    }
                                                                                >
                                                                                    <Trash className="h-4 w-4 text-slate-400" />
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 italic">No budget proposals found</p>
                                                            )}
                                                        </div>

                                                        {/* Add new budget proposal - Only show when project is pending */}
                                                        {currentProject.status === 'pending' && (
                                                            <div className="mt-4 flex gap-2">
                                                                <Input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    placeholder="Enter amount"
                                                                    value={newBudgetAmount}
                                                                    onChange={handleBudgetChange}
                                                                    className="border-slate-700 bg-slate-800 text-white"
                                                                />
                                                                <Button
                                                                    onClick={() => handleAddProposal('budget', newBudgetAmount)}
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                    disabled={!newBudgetAmount || isNaN(parseFloat(newBudgetAmount))}
                                                                >
                                                                    <Plus className="mr-2 h-4 w-4" /> Add
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Members tab */}
                        <TabsContent value="members">
                            <Card className="border-slate-700 bg-slate-900">
                                <CardHeader>
                                    <CardTitle>Project Team</CardTitle>
                                    <CardDescription className="text-slate-400">Members assigned to this project</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {members.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between rounded-md bg-slate-800 p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={member.avatar || '/placeholder.svg'} alt={member.name} />
                                                        <AvatarFallback className="bg-blue-700">
                                                            {member.name
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{member.name}</p>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <Badge variant="outline" className="border-slate-600 text-xs">
                                                                {member.level}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Confirmation Dialog */}
                <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
                    <DialogContent className="border-slate-700 bg-slate-900 text-white">
                        <DialogHeader>
                            <DialogTitle>
                                {confirmationAction === 'validate'
                                    ? 'Confirm Validation'
                                    : confirmationAction === 'reject'
                                      ? 'Confirm Rejection'
                                      : 'Confirm Deletion'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                {confirmationAction === 'validate'
                                    ? 'Are you sure you want to validate this item?'
                                    : confirmationAction === 'reject'
                                      ? 'Are you sure you want to reject this item?'
                                      : 'Are you sure you want to delete this item?'}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setConfirmationOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmAction}
                                className={
                                    confirmationAction === 'validate'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : confirmationAction === 'reject'
                                          ? 'bg-amber-600 hover:bg-amber-700'
                                          : 'bg-rose-600 hover:bg-rose-700'
                                }
                            >
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Objective Dialog */}
                <Dialog open={editObjectiveOpen} onOpenChange={setEditObjectiveOpen}>
                    <DialogContent className="border-slate-700 bg-slate-900 text-white">
                        <DialogHeader>
                            <DialogTitle>Edit Objective</DialogTitle>
                            <DialogDescription className="text-slate-400">Make changes to the objective description.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="objective-description">Description</Label>
                                <Input
                                    id="objective-description"
                                    value={editingObjective?.value || ''}
                                    onChange={(e) => editingObjective && setEditingObjective({ ...editingObjective, value: e.target.value })}
                                    className="border-slate-700 bg-slate-800 text-white"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditObjectiveOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (editingObjective) {
                                        editProposal(editingObjective.id, String(editingObjective.value), 'goal');
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ProjectLayout>
    );
}
