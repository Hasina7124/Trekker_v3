import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Check, Clock, DollarSign, Edit, Plus, Trash, X } from 'lucide-react';
import { useState } from 'react';

import ProjectLayout from '@/layouts/admin/project/layout';
import { PageProps, Project } from '@/types';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Goal type
type GoalMinimal = {
    id: string;
    value: string;
    status: string;
};

// Project status types with corresponding colors
const statusColors = {
    active: 'bg-emerald-500',
    completed: 'bg-blue-500',
    pending: 'bg-amber-500',
    canceled: 'bg-rose-500',
};

// Types for objectives and their statuses
type ObjectiveStatus = 'pending' | 'accepted' | 'rejected';

// Types for date proposals
type DateProposal = {
    id: string;
    date: string;
    status: ObjectiveStatus;
};

// Types for budget proposals
type BudgetProposal = {
    id: string;
    amount: number;
    status: ObjectiveStatus;
};

// Types for members
type MemberRole = 'Project Manager' | 'Developer' | 'Designer' | 'Analyst' | 'Tester';
type Member = {
    id: string;
    name: string;
    role: MemberRole;
    level: string;
    avatar?: string;
};

// Types for confirmation modal
type ConfirmationAction = 'validate' | 'reject' | 'delete';
type ConfirmationTarget = 'objective' | 'startDate' | 'endDate' | 'budget';

type ProjectDetailPageProps = {
    project: Project;
};

export default function ProjectDetailPage() {
    const { project: currentProject } = usePage<PageProps<ProjectDetailPageProps>>().props;

    const projectId = currentProject.id;

    // State for confirmation modal
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction>('validate');
    const [confirmationTarget, setConfirmationTarget] = useState<ConfirmationTarget>('objective');
    const [itemToAction, setItemToAction] = useState('');

    // State for edit modals
    const [editObjectiveOpen, setEditObjectiveOpen] = useState(false);
    const [editStartDateOpen, setEditStartDateOpen] = useState(false);
    const [editEndDateOpen, setEditEndDateOpen] = useState(false);
    const [editBudgetOpen, setEditBudgetOpen] = useState(false);

    // State for edited items
    const [editingProposal, setEditingProposal] = useState<GoalMinimal | null>(null);
    const [editingStartDate, setEditingStartDate] = useState<DateProposal | null>(null);
    const [editingEndDate, setEditingEndDate] = useState<DateProposal | null>(null);
    const [editingBudget, setEditingBudget] = useState<BudgetProposal | null>(null);

    // Update the project data to have empty start and end dates initially
    const [project, setProject] = useState({ currentProject });

    // Contenir tout donné
    const [proposals, setProposals] = useState<GoalMinimal[]>([]);

    console.log(proposals);

    // Attendre objectif
    const [proposalType, setProposaltype] = useState<string>('goal');
    const [loading, setLoading] = useState(false); // Pour bloquer les cliques multiples
    const fetchData = async (type: string) => {
        setLoading(true);
        // récuperation des données
        try {
            // Construire l'url
            const url = new URL(`/project/${projectId}/proposal`, window.location.origin);

            if (proposalType) {
                url.searchParams.append('proposal_type', type);
            }

            const res = await fetch(url.toString());

            if (!res.ok) {
                console.error('Erreur HTTP:', res.status, res.statusText);
                // Tu peux throw ou gérer l'erreur ici
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            console.log(data);

            // Insérer les données
            setProposals((prev) => {
                const merged = [...prev, ...data.proposal];
                const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values());
                return unique;
            });
        } catch (error: any) {
            toast.error(error.title);
        }
    };
    // Ecouter le changement de proposaltype
    useEffect(() => {
        if (proposalType) {
            fetchData(proposalType);
        }
    }, [proposalType]);

    useEffect(() => {
        console.log('EEE', proposals);
    });

    // State for new objective input
    const [newProposal, setNewProposal] = useState<string>('');

    // Replace the timeConstraints state with separate states for start and end date proposals
    const [startDateProposals, setStartDateProposals] = useState<DateProposal[]>([
        { id: 'start1', date: '2023-11-15', status: 'pending' },
        { id: 'start2', date: '2023-12-01', status: 'pending' },
        { id: 'start3', date: '2024-01-05', status: 'rejected' },
    ]);

    const [endDateProposals, setEndDateProposals] = useState<DateProposal[]>([
        { id: 'end1', date: '2024-02-28', status: 'pending' },
        { id: 'end2', date: '2024-03-15', status: 'pending' },
        { id: 'end3', date: '2024-04-30', status: 'rejected' },
    ]);

    // State for budget proposals
    const [budgetProposals, setBudgetProposals] = useState<BudgetProposal[]>([
        { id: 'budget1', amount: 25000, status: 'pending' },
        { id: 'budget2', amount: 30000, status: 'pending' },
        { id: 'budget3', amount: 22000, status: 'rejected' },
    ]);

    // State for new constraint inputs
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');
    const [newBudgetAmount, setNewBudgetAmount] = useState<number | ''>('');

    // State for team members
    const [members] = useState<Member[]>([
        {
            id: 'mem1',
            name: 'Sarah Johnson',
            role: 'Project Manager',
            level: 'Senior',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            id: 'mem2',
            name: 'David Chen',
            role: 'Developer',
            level: 'Mid-level',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            id: 'mem3',
            name: 'Maria Garcia',
            role: 'Designer',
            level: 'Senior',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            id: 'mem4',
            name: 'James Wilson',
            role: 'Developer',
            level: 'Junior',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            id: 'mem5',
            name: 'Aisha Patel',
            role: 'Analyst',
            level: 'Mid-level',
            avatar: '/placeholder.svg?height=40&width=40',
        },
    ]);

    // Laravel API functions
    const apiBaseUrl = '/api';

    // Function to add a new objective
    const handleAddProposal = async () => {
        if (newProposal.trim()) {
            try {
                const response = await fetch(`/project/${projectId}/proposal`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ type: proposalType, value: newProposal }),
                });

                if (!response.ok) throw new Error('Failed to add objective');

                const data = await response.json();
                setProposals((prev) => [...prev, data.objective]);
                setNewProposal('');
                toast('Success', {
                    description: 'Objective added successfully',
                });
            } catch (error) {
                console.error('Error adding objective:', error);
                toast('Error', { description: 'Failed to add objective' });
            }
        }
    };

    // Function to update objective status
    const updateProposalStatus = async (id: string, status: ObjectiveStatus) => {
        try {
            const response = await fetch(`/project/proposal/${id}/updated`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete objective');
            }
            setProposals(proposals.map((obj) => (obj.id === id ? { ...obj, status } : obj)));

            toast('Success', {
                description: `Objective ${status === 'accepted' ? 'accepted' : 'rejected'}`,
            });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Function to delete an objective
    const deleteProposal = async (id: string) => {
        try {
            const response = await fetch(`/project/proposal/${id}/deleted`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete objective');
            }

            setProposals(proposals.filter((obj) => obj.id !== id));

            toast('Success', {
                description: 'Objective deleted successfully',
            });
        } catch (error) {
            toast('Error', { description: 'Failed to delete objective' });
        }
    };

    // Function to edit an objective
    const editObjective = async (id: string, value: string) => {
        try {
            const response = await fetch(`/project/proposal/${id}/updated`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ value }), // ✅ c'est ici que l'erreur venait
            });

            if (!response.ok) throw new Error('Failed to update objective');

            setProposals(proposals.map((obj) => (obj.id === id ? { ...obj, value } : obj)));

            toast('Success', {
                description: 'Objective updated successfully',
            });
        } catch (error: any) {
            toast.error(error?.title || 'Erreur lors de la mise à jour.');
        }
    };

    // Functions for start date proposals
    const handleAddStartDateProposal = async () => {
        if (newStartDate) {
            try {
                const response = await fetch(`${apiBaseUrl}/projects/${projectId}/start-date-proposals`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ date: newStartDate }),
                });

                if (!response.ok) throw new Error('Failed to add start date proposal');

                const data = await response.json();
                setStartDateProposals([...startDateProposals, data.proposal]);
                setNewStartDate('');

                toast('Success', {
                    description: 'Start date proposal added successfully',
                });
            } catch (error) {
                console.error('Error adding start date proposal:', error);
                toast('Error', { description: 'Failed to add start date proposal' });
            }
        }
    };

    const updateStartDateProposalStatus = async (id: string, status: ObjectiveStatus) => {
        try {
            const response = await fetch(`/project/proposal/${id}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) throw new Error('Failed to update start date proposal');

            // If accepting a proposal, update the project start date and reject all other proposals
            if (status === 'accepted') {
                const acceptedProposal = startDateProposals.find((proposal) => proposal.id === id);
                if (acceptedProposal) {
                    setProject({
                        ...project,
                        currentProject: {
                            ...project.currentProject,
                            start_date: acceptedProposal.date,
                        },
                    });

                    // Update project start date in Laravel
                    await fetch(`${apiBaseUrl}/projects/${projectId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ startDate: acceptedProposal.date }),
                    });
                }

                setStartDateProposals(
                    startDateProposals.map((proposal) =>
                        proposal.id === id
                            ? { ...proposal, status: 'accepted' }
                            : { ...proposal, status: proposal.status === 'pending' ? 'rejected' : proposal.status },
                    ),
                );
            } else {
                setStartDateProposals(startDateProposals.map((proposal) => (proposal.id === id ? { ...proposal, status } : proposal)));
            }

            toast('Success', {
                description: `Start date proposal ${status === 'accepted' ? 'accepted' : 'rejected'}`,
            });
        } catch (error) {
            console.error('Error updating start date proposal:', error);
            toast('Error', { description: 'Failed to update start date proposal' });
        }
    };

    const deleteStartDateProposal = async (id: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/projects/${projectId}/start-date-proposals/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error('Failed to delete start date proposal');

            setStartDateProposals(startDateProposals.filter((proposal) => proposal.id !== id));

            toast('Success', {
                description: 'Start date proposal deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting start date proposal:', error);
            toast('Error', { description: 'Failed to delete start date proposal' });
        }
    };

    const editStartDateProposal = async (id: string, date: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/projects/${projectId}/start-date-proposals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ date }),
            });

            if (!response.ok) throw new Error('Failed to update start date proposal');

            setStartDateProposals(startDateProposals.map((proposal) => (proposal.id === id ? { ...proposal, date } : proposal)));

            toast('Success', {
                description: 'Start date proposal updated successfully',
            });
        } catch (error) {
            console.error('Error updating start date proposal:', error);
            toast('Error', { description: 'Failed to update start date proposal' });
        }
    };

    // Functions for end date proposals
    const handleAddEndDateProposal = async () => {
        if (newEndDate) {
            try {
                const response = await fetch(`${apiBaseUrl}/projects/${projectId}/end-date-proposals`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ date: newEndDate }),
                });

                if (!response.ok) throw new Error('Failed to add end date proposal');

                const data = await response.json();
                setEndDateProposals([...endDateProposals, data.proposal]);
                setNewEndDate('');

                toast('Success', {
                    description: 'End date proposal added successfully',
                });
            } catch (error) {
                console.error('Error adding end date proposal:', error);
                toast('Error', { description: 'Failed to add end date proposal' });
            }
        }
    };

    const updateEndDateProposalStatus = async (id: string, status: ObjectiveStatus) => {
        try {
            const response = await fetch(`${apiBaseUrl}/projects/${projectId}/end-date-proposals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) throw new Error('Failed to update end date proposal');

            // If accepting a proposal, update the project end date and reject all other proposals
            if (status === 'accepted') {
                const acceptedProposal = endDateProposals.find((proposal) => proposal.id === id);
                if (acceptedProposal) {
                    setProject({
                        ...project,
                        currentProject: {
                            ...project.currentProject,
                            end_date: acceptedProposal.date,
                        },
                    });

                    // Update project end date in Laravel
                    await fetch(`${apiBaseUrl}/projects/${projectId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ endDate: acceptedProposal.date }),
                    });
                }

                setEndDateProposals(
                    endDateProposals.map((proposal) =>
                        proposal.id === id
                            ? { ...proposal, status: 'accepted' }
                            : { ...proposal, status: proposal.status === 'pending' ? 'rejected' : proposal.status },
                    ),
                );
            } else {
                setEndDateProposals(endDateProposals.map((proposal) => (proposal.id === id ? { ...proposal, status } : proposal)));
            }

            toast('Success', {
                description: `End date proposal ${status === 'accepted' ? 'accepted' : 'rejected'}`,
            });
        } catch (error) {
            console.error('Error updating end date proposal:', error);
            toast('Error', { description: 'Failed to update end date proposal' });
        }
    };

    const deleteEndDateProposal = async (id: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/projects/${projectId}/end-date-proposals/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error('Failed to delete end date proposal');

            setEndDateProposals(endDateProposals.filter((proposal) => proposal.id !== id));

            toast('Success', {
                description: 'End date proposal deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting end date proposal:', error);
            toast('Error', {
                description: 'Failed to delete end date proposal',
            });
        }
    };

    const editEndDateProposal = async (id: string, date: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/projects/${projectId}/end-date-proposals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ date }),
            });

            if (!response.ok) throw new Error('Failed to update end date proposal');

            setEndDateProposals(endDateProposals.map((proposal) => (proposal.id === id ? { ...proposal, date } : proposal)));

            toast('Success', {
                description: 'End date proposal updated successfully',
            });
        } catch (error) {
            console.error('Error updating end date proposal:', error);
            toast('Error', {
                description: 'Failed to update end date proposal',
            });
        }
    };

    // Functions for budget proposals
    const handleAddBudgetProposal = async () => {
        if (newBudgetAmount !== '') {
            try {
                const response = await fetch(`${apiBaseUrl}/projects/${projectId}/budget-proposals`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ amount: Number(newBudgetAmount) }),
                });

                if (!response.ok) throw new Error('Failed to add budget proposal');

                const data = await response.json();
                setBudgetProposals([...budgetProposals, data.proposal]);
                setNewBudgetAmount('');

                toast('Success', {
                    description: 'Budget proposal added successfully',
                });
            } catch (error) {
                console.error('Error adding budget proposal:', error);
                toast('Error', {
                    description: 'Failed to add budget proposal',
                });
            }
        }
    };

    const updateBudgetProposalStatus = async (id: string, status: ObjectiveStatus) => {
        try {
            const response = await fetch(`${apiBaseUrl}/projects/${projectId}/budget-proposals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) throw new Error('Failed to update budget proposal');

            // If accepting a proposal, update the project budget and reject all other proposals
            if (status === 'accepted') {
                const acceptedProposal = budgetProposals.find((proposal) => proposal.id === id);
                if (acceptedProposal) {
                    setProject({
                        ...project,
                        currentProject: {
                            ...project.currentProject,
                            budget: acceptedProposal.amount,
                        },
                    });

                    // Update project budget in Laravel
                    await fetch(`${apiBaseUrl}/projects/${projectId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ budget: acceptedProposal.amount }),
                    });
                }

                setBudgetProposals(
                    budgetProposals.map((proposal) =>
                        proposal.id === id
                            ? { ...proposal, status: 'accepted' }
                            : { ...proposal, status: proposal.status === 'pending' ? 'rejected' : proposal.status },
                    ),
                );
            } else {
                setBudgetProposals(budgetProposals.map((proposal) => (proposal.id === id ? { ...proposal, status } : proposal)));
            }

            toast('Success', {
                description: `Budget proposal ${status === 'accepted' ? 'accepted' : 'rejected'}`,
            });
        } catch (error) {
            console.error('Error updating budget proposal:', error);
            toast('Error', {
                description: 'Failed to update budget proposal',
            });
        }
    };

    const deleteBudgetProposal = async (id: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/projects/${projectId}/budget-proposals/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error('Failed to delete budget proposal');

            setBudgetProposals(budgetProposals.filter((proposal) => proposal.id !== id));

            toast('Success', {
                description: 'Budget proposal deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting budget proposal:', error);
            toast('Error', {
                description: 'Failed to delete budget proposal',
            });
        }
    };

    const editBudgetProposal = async (id: string, amount: number) => {
        try {
            const response = await fetch(`${apiBaseUrl}/projects/${projectId}/budget-proposals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) throw new Error('Failed to update budget proposal');

            setBudgetProposals(budgetProposals.map((proposal) => (proposal.id === id ? { ...proposal, amount } : proposal)));

            toast('Success', {
                description: 'Budget proposal updated successfully',
            });
        } catch (error) {
            console.error('Error updating budget proposal:', error);
            toast('Error', {
                description: 'Failed to update budget proposal',
            });
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
        switch (confirmationTarget) {
            case 'objective':
                if (confirmationAction === 'validate') {
                    updateProposalStatus(itemToAction, 'accepted');
                } else if (confirmationAction === 'reject') {
                    updateProposalStatus(itemToAction, 'rejected');
                } else if (confirmationAction === 'delete') {
                    deleteProposal(itemToAction);
                }
                break;
            case 'startDate':
                if (confirmationAction === 'validate') {
                    updateStartDateProposalStatus(itemToAction, 'accepted');
                } else if (confirmationAction === 'reject') {
                    updateStartDateProposalStatus(itemToAction, 'rejected');
                } else if (confirmationAction === 'delete') {
                    deleteStartDateProposal(itemToAction);
                }
                break;
            case 'endDate':
                if (confirmationAction === 'validate') {
                    updateEndDateProposalStatus(itemToAction, 'accepted');
                } else if (confirmationAction === 'reject') {
                    updateEndDateProposalStatus(itemToAction, 'rejected');
                } else if (confirmationAction === 'delete') {
                    deleteEndDateProposal(itemToAction);
                }
                break;
            case 'budget':
                if (confirmationAction === 'validate') {
                    updateBudgetProposalStatus(itemToAction, 'accepted');
                } else if (confirmationAction === 'reject') {
                    updateBudgetProposalStatus(itemToAction, 'rejected');
                } else if (confirmationAction === 'delete') {
                    deleteBudgetProposal(itemToAction);
                }
                break;
        }
        setConfirmationOpen(false);
    };

    // Edit modal handlers
    const openEditProposalModal = (proposal: GoalMinimal) => {
        setEditingProposal({ ...proposal });
        setEditObjectiveOpen(true);
    };

    const openEditStartDateModal = (proposal: DateProposal) => {
        setEditingStartDate({ ...proposal });
        setEditStartDateOpen(true);
    };

    const openEditEndDateModal = (proposal: DateProposal) => {
        setEditingEndDate({ ...proposal });
        setEditEndDateOpen(true);
    };

    const openEditBudgetModal = (proposal: BudgetProposal) => {
        setEditingBudget({ ...proposal });
        setEditBudgetOpen(true);
    };

    const handleSaveObjective = () => {
        if (editingProposal) {
            const value = typeof editingProposal.value === 'string';
            editObjective(editingProposal.id, editingProposal.value);
            setEditObjectiveOpen(false);
        }
    };

    const handleSaveStartDate = () => {
        if (editingStartDate) {
            editStartDateProposal(editingStartDate.id, editingStartDate.date);
            setEditStartDateOpen(false);
        }
    };

    const handleSaveEndDate = () => {
        if (editingEndDate) {
            editEndDateProposal(editingEndDate.id, editingEndDate.date);
            setEditEndDateOpen(false);
        }
    };

    const handleSaveBudget = () => {
        if (editingBudget) {
            editBudgetProposal(editingBudget.id, editingBudget.amount);
            setEditBudgetOpen(false);
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set';

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    // Render status icon based on objective status
    const renderStatusIcon = (status: ObjectiveStatus) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-amber-500" />;
            case 'accepted':
                return <Check className="h-4 w-4 text-emerald-500" />;
            case 'rejected':
                return <X className="h-4 w-4 text-rose-500" />;
        }
    };

    // Get confirmation dialog title and description
    const getConfirmationContent = () => {
        const actionText = confirmationAction === 'validate' ? 'validate' : confirmationAction === 'reject' ? 'reject' : 'delete';

        const targetText =
            confirmationTarget === 'objective'
                ? 'objective'
                : confirmationTarget === 'startDate'
                  ? 'start date proposal'
                  : confirmationTarget === 'endDate'
                    ? 'end date proposal'
                    : 'budget proposal';

        return {
            title: `Confirm ${actionText}`,
            description: `Are you sure you want to ${actionText} this ${targetText}?`,
        };
    };

    // Quand tu ouvres le formulaire : copie la valeur dans newProposal
    useEffect(() => {
        if (editingProposal) {
            setNewProposal(editingProposal.value); // Remplit l'input
        }
    }, [editingProposal]);

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
                                <h1 className="text-2xl font-bold">{project.currentProject.title}</h1>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-sm text-slate-400">Project ID: {project.currentProject.id}</span>
                                    <Badge className={`${statusColors[project.currentProject.status as keyof typeof statusColors]}`}>
                                        {project.currentProject.status.charAt(0).toUpperCase() + project.currentProject.status.slice(1)}
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
                            <p className="text-slate-300">{project.currentProject.description}</p>
                        </CardContent>
                    </Card>

                    {/* Project details tabs */}
                    <Tabs defaultValue="objectives" className="w-full">
                        <TabsList className="border-slate-700 bg-slate-900">
                            <TabsTrigger
                                value="objectives"
                                onClick={() => {
                                    setProposaltype('goal');
                                    setProposals([]);
                                }}
                            >
                                Objectives
                            </TabsTrigger>
                            <TabsTrigger
                                value="constraints"
                                onClick={() => {
                                    setProposaltype('time');
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
                                    <CardDescription className="text-slate-400">
                                        Manage the key objectives and deliverables for this project
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Objectives list */}
                                    <div className="space-y-3">
                                        {Array.isArray(proposals) && proposals.length > 0 ? (
                                            proposals.map((objective) => (
                                                <div key={objective.id} className="flex items-center justify-between rounded-md bg-slate-800 p-3">
                                                    <div className="flex items-center gap-3">
                                                        {renderStatusIcon(objective.status as ObjectiveStatus)}
                                                        <span className="text-slate-200">{objective.value}</span>
                                                    </div>
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
                                                                openEditProposalModal(objective);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4 text-slate-400" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="tetext-gray-500 italicxt">Aucune proposition trouvée</p>
                                        )}
                                    </div>

                                    {/* Add new objective */}
                                    <div className="mt-4 flex gap-2">
                                        <Input
                                            placeholder="Add a new objective..."
                                            value={newProposal}
                                            onChange={(e) => setNewProposal(e.target.value)}
                                            className="border-slate-700 bg-slate-800 text-white"
                                        />
                                        <Button onClick={handleAddProposal} className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="mr-2 h-4 w-4" /> Add
                                        </Button>
                                    </div>
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
                                    <Tabs defaultValue="time" className="w-full">
                                        <TabsList className="border-slate-700 bg-slate-800">
                                            <TabsTrigger
                                                value="time"
                                                onClick={() => {
                                                    setProposaltype('time');
                                                }}
                                            >
                                                Time
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="budget"
                                                onClick={() => {
                                                    setProposaltype('budget');
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
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="h-5 w-5 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm text-slate-400">Start Date</p>
                                                                <p className="text-slate-200">{formatDate(project.currentProject.start_date)}</p>
                                                            </div>
                                                        </div>
                                                        <Separator className="bg-slate-700" />
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="h-5 w-5 text-rose-500" />
                                                            <div>
                                                                <p className="text-sm text-slate-400">End Date</p>
                                                                <p className="text-slate-200">{formatDate(project.currentProject.end_date)}</p>
                                                            </div>
                                                        </div>

                                                        <Separator className="my-4 bg-slate-700" />
                                                        <h3 className="mb-3 text-lg font-medium">Start Date Proposals</h3>

                                                        {/* Start Date proposals list */}
                                                        <div className="space-y-3">
                                                            {Array.isArray(proposals) && proposals.length > 0 ? (
                                                                proposals.map((proposal) => (
                                                                    <div
                                                                        key={proposal.id}
                                                                        className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {renderStatusIcon(proposal.status as ObjectiveStatus)}
                                                                            <span className="text-slate-200">{formatDate(proposal.value)}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {proposal.status === 'pending' && (
                                                                                <>
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="outline"
                                                                                        className="h-8 w-8 border-emerald-700 bg-slate-800 hover:bg-emerald-900 hover:text-emerald-500"
                                                                                        onClick={() => {
                                                                                            alert(proposal.id);
                                                                                            openConfirmationDialog(
                                                                                                'validate',
                                                                                                'startDate',
                                                                                                proposal.id,
                                                                                            );
                                                                                        }}
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
                                                                            <Button
                                                                                size="icon"
                                                                                variant="outline"
                                                                                className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                                onClick={() =>
                                                                                    openEditStartDateModal(proposal.value as unknown as DateProposal)
                                                                                }
                                                                            >
                                                                                <Edit className="h-4 w-4 text-slate-400" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 italic">Aucune Date trouvée.</p>
                                                            )}
                                                        </div>

                                                        {/* Add new start date proposal */}
                                                        <div className="mt-4 flex gap-2">
                                                            <Input
                                                                type="date"
                                                                value={newStartDate}
                                                                onChange={(e) => setNewStartDate(e.target.value)}
                                                                className="border-slate-700 bg-slate-800 text-white"
                                                            />
                                                            <Button onClick={handleAddStartDateProposal} className="bg-blue-600 hover:bg-blue-700">
                                                                <Plus className="mr-2 h-4 w-4" /> Add
                                                            </Button>
                                                        </div>

                                                        <Separator className="my-4 bg-slate-700" />
                                                        <h3 className="mb-3 text-lg font-medium">End Date Proposals</h3>

                                                        {/* End Date proposals list */}
                                                        <div className="space-y-3">
                                                            {Array.isArray(proposals) && proposals.length > 0 ? (
                                                                endDateProposals.map((proposal) => (
                                                                    <div
                                                                        key={proposal.id}
                                                                        className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {renderStatusIcon(proposal.status)}
                                                                            <span className="text-slate-200">{formatDate(proposal.date)}</span>
                                                                        </div>
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
                                                                            <Button
                                                                                size="icon"
                                                                                variant="outline"
                                                                                className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                                onClick={() => openEditEndDateModal(proposal)}
                                                                            >
                                                                                <Edit className="h-4 w-4 text-slate-400" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 italic">Aucune date trouvée.</p>
                                                            )}
                                                        </div>

                                                        {/* Add new end date proposal */}
                                                        <div className="mt-4 flex gap-2">
                                                            <Input
                                                                type="date"
                                                                value={newEndDate}
                                                                onChange={(e) => setNewEndDate(e.target.value)}
                                                                className="border-slate-700 bg-slate-800 text-white"
                                                            />
                                                            <Button onClick={handleAddEndDateProposal} className="bg-blue-600 hover:bg-blue-700">
                                                                <Plus className="mr-2 h-4 w-4" /> Add
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="budget">
                                            <Card className="mt-4 border-slate-700 bg-slate-800">
                                                <CardContent className="pt-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <DollarSign className="h-5 w-5 text-emerald-500" />
                                                            <div>
                                                                <p className="text-sm text-slate-400">Total Budget</p>
                                                                <p className="text-slate-200">
                                                                    {project.currentProject &&
                                                                    project.currentProject.budget != null && // <-- check non null / non undefined
                                                                    !isNaN(Number(project.currentProject.budget)) &&
                                                                    project.currentProject.budget !== ''
                                                                        ? `$${Number(project.currentProject.budget).toLocaleString()}`
                                                                        : 'Not set'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <Separator className="my-4 bg-slate-700" />
                                                        <h3 className="mb-3 text-lg font-medium">Budget Proposals</h3>

                                                        {/* Budget proposals list */}
                                                        <div className="space-y-3">
                                                            {Array.isArray(proposals) && proposals.length > 0 ? (
                                                                proposals.map((proposal) => (
                                                                    <div
                                                                        key={proposal.id}
                                                                        className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {renderStatusIcon(proposal.status as ObjectiveStatus)}
                                                                            <span className="text-slate-200">${proposal.value.toLocaleString()}</span>
                                                                        </div>
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
                                                                            <Button
                                                                                size="icon"
                                                                                variant="outline"
                                                                                className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                                onClick={() => {
                                                                                    const parsedValue = JSON.parse(proposal.value);
                                                                                    openEditBudgetModal(parsedValue);
                                                                                }}
                                                                            >
                                                                                <Edit className="h-4 w-4 text-slate-400" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 italic">Aucune budget trouvée.</p>
                                                            )}
                                                        </div>

                                                        {/* Add new budget proposal */}
                                                        <div className="mt-4 flex gap-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="Enter amount"
                                                                value={newBudgetAmount}
                                                                onChange={(e) =>
                                                                    setNewBudgetAmount(e.target.value === '' ? '' : Number(e.target.value))
                                                                }
                                                                className="border-slate-700 bg-slate-800 text-white"
                                                            />
                                                            <Button onClick={handleAddBudgetProposal} className="bg-blue-600 hover:bg-blue-700">
                                                                <Plus className="mr-2 h-4 w-4" /> Add
                                                            </Button>
                                                        </div>
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
                            <DialogTitle>{getConfirmationContent().title}</DialogTitle>
                            <DialogDescription className="text-slate-400">{getConfirmationContent().description}</DialogDescription>
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
                                    name="value"
                                    value={newProposal}
                                    onChange={(e) => setNewProposal(e.target.value)}
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
                                    if (editingProposal) {
                                        editObjective(editingProposal.id, newProposal);
                                        setEditingProposal(null); // Ferme le modal
                                    }
                                }}
                            >
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Start Date Dialog */}
                <Dialog open={editStartDateOpen} onOpenChange={setEditStartDateOpen}>
                    <DialogContent className="border-slate-700 bg-slate-900 text-white">
                        <DialogHeader>
                            <DialogTitle>Edit Start Date Proposal</DialogTitle>
                            <DialogDescription className="text-slate-400">Update the proposed start date.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="start-date">Start Date</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={editingStartDate?.date || ''}
                                    onChange={(e) => setEditingStartDate((prev) => (prev ? { ...prev, date: e.target.value } : null))}
                                    className="border-slate-700 bg-slate-800 text-white"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditStartDateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveStartDate} className="bg-blue-600 hover:bg-blue-700">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit End Date Dialog */}
                <Dialog open={editEndDateOpen} onOpenChange={setEditEndDateOpen}>
                    <DialogContent className="border-slate-700 bg-slate-900 text-white">
                        <DialogHeader>
                            <DialogTitle>Edit End Date Proposal</DialogTitle>
                            <DialogDescription className="text-slate-400">Update the proposed end date.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="end-date">End Date</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={editingEndDate?.date || ''}
                                    onChange={(e) => setEditingEndDate((prev) => (prev ? { ...prev, date: e.target.value } : null))}
                                    className="border-slate-700 bg-slate-800 text-white"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditEndDateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveEndDate} className="bg-blue-600 hover:bg-blue-700">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Budget Dialog */}
                {/* <Dialog open={editBudgetOpen} onOpenChange={setEditBudgetOpen}>
                    <DialogContent className="border-slate-700 bg-slate-900 text-white">
                        <DialogHeader>
                            <DialogTitle>Edit Budget Proposal</DialogTitle>
                            <DialogDescription className="text-slate-400">Update the proposed budget amount.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="budget-amount">Budget Amount</Label>
                                <Input
                                    id="budget-amount"
                                    type="number"
                                    value={editingBudget?.amount || 0}
                                    onChange={(e) => setEditingBudget((prev) => (prev ? { ...prev, amount: Number(e.target.value) } : null))}
                                    className="border-slate-700 bg-slate-800 text-white"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditBudgetOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveBudget} className="bg-blue-600 hover:bg-blue-700">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog> */}
            </div>
        </ProjectLayout>
    );
}
