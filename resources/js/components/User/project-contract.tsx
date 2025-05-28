"use client"

import { useState, useEffect } from "react"
import { Check, X, Trash, Edit, Plus, Clock, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import type { Project, AcceptedProposals } from "@/types"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

type ProposalStatus = 'pending' | 'accepted' | 'rejected';
type ProposalType = 'goal' | 'start_date' | 'end_date' | 'budget';
type ActiveTabType = 'objectives' | 'time' | 'budget';

interface Proposal {
    id: number;
    value: string;
    status: ProposalStatus;
    type: ProposalType;
    project_id: number;
    proposer_id: number;
}

interface ProjectContractProps {
    project: Project;
    acceptedProposals: AcceptedProposals | null;
    isAdmin: boolean;
    onUpdateProposalStatus?: (id: string, status: string) => void;
}

export function ProjectContract({ project, acceptedProposals, isAdmin, onUpdateProposalStatus }: ProjectContractProps) {
    // États pour les nouvelles propositions
    const [newObjective, setNewObjective] = useState("");
    const [newStartDate, setNewStartDate] = useState("");
    const [newEndDate, setNewEndDate] = useState("");
    const [newBudget, setNewBudget] = useState("");

    // État pour les propositions en cours
    const [proposals, setProposals] = useState<{
        goal: Proposal[];
        time: Proposal[];
        budget: Proposal[];
    }>({
        goal: [],
        time: [],
        budget: []
    });

    // État pour l'onglet actif
    const [activeTab, setActiveTab] = useState<ActiveTabType>('objectives');

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
    const [editValue, setEditValue] = useState("");
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'delete' | 'accept' | 'reject';
        proposal: Proposal | null;
    }>({ type: 'delete', proposal: null });

    // État pour les propositions acceptées
    const [localAcceptedProposals, setLocalAcceptedProposals] = useState<AcceptedProposals>({
        goals: [],
        startDates: [],
        endDates: [],
        budgets: []
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatBudget = (value: string | number): string => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(numericValue);
    };

    const renderStatusIcon = (status: ProposalStatus) => {
        switch (status) {
            case 'accepted':
                return <Check className="h-4 w-4 text-emerald-500" />;
            case 'rejected':
                return <Ban className="h-4 w-4 text-rose-500" />;
            default:
                return <Clock className="h-4 w-4 text-amber-500" />;
        }
    };

    // Charger les propositions
    const fetchProposals = async (type: ProposalType) => {
        try {
            console.log('Début fetchProposals pour type:', type);
            console.log('URL:', `/api/projects/${project.id}/proposals/${type}`);
            
            const response = await fetch(`/api/projects/${project.id}/proposals/${type}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include'
            });
            
            console.log('Statut de la réponse:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Données brutes reçues:', data);
            
            // S'assurer que les données sont toujours un tableau
            const safeData = Array.isArray(data.data) ? data.data : [];
            console.log('Données sécurisées pour', type, ':', safeData);
            
            // Mise à jour de l'état en fonction du type
            if (type === 'goal') {
                setProposals(prev => ({ ...prev, goal: safeData }));
            } else if (type === 'budget') {
                setProposals(prev => ({ ...prev, budget: safeData }));
            } else if (type === 'start_date' || type === 'end_date') {
                // Pour les dates, on met à jour uniquement les propositions du type spécifique
                setProposals(prev => ({
                    ...prev,
                    time: prev.time.filter(p => p.type !== type).concat(safeData)
                }));
            }
            
            console.log('État des propositions après mise à jour:', proposals);
        } catch (error) {
            console.error('Erreur lors du chargement des propositions:', error);
        }
    };

    // Ajouter une nouvelle proposition
    const handleAddProposal = async (type: ProposalType, value: string) => {
        try {
            if (!value.trim()) {
                toast.error('La valeur ne peut pas être vide', {
                    description: 'Veuillez saisir une valeur valide pour continuer.'
                });
                return;
            }

            const response = await fetch(`/api/projects/${project.id}/proposals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
                body: JSON.stringify({ type, value }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Échec de l\'ajout');
            }

                // Recharger les propositions après l'ajout
                fetchProposals(type);
                // Réinitialiser le champ
                switch (type) {
                    case 'goal':
                        setNewObjective('');
                    toast.success('Objectif ajouté', {
                        description: 'Le nouvel objectif a été ajouté avec succès.'
                    });
                        break;
                    case 'start_date':
                        setNewStartDate('');
                    toast.success('Date de début ajoutée', {
                        description: 'La nouvelle date de début a été ajoutée avec succès.'
                    });
                        break;
                    case 'end_date':
                        setNewEndDate('');
                    toast.success('Date de fin ajoutée', {
                        description: 'La nouvelle date de fin a été ajoutée avec succès.'
                    });
                        break;
                    case 'budget':
                        setNewBudget('');
                    toast.success('Budget ajouté', {
                        description: 'Le nouveau budget a été ajouté avec succès.'
                    });
                        break;
                }
            
            // Fermer la modale si elle est ouverte
            if (editDialogOpen) {
                setEditDialogOpen(false);
            }
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout de la proposition:', error);
            toast.error('Erreur lors de l\'ajout', {
                description: error.message || 'Une erreur est survenue lors de l\'ajout de la proposition.'
            });
        }
    };

    // Initialisation des propositions acceptées lors du montage du composant
    useEffect(() => {
        if (acceptedProposals) {
            setLocalAcceptedProposals(acceptedProposals);
        }
    }, [acceptedProposals]);

    // Fonction pour mettre à jour les propositions acceptées localement
    const updateLocalAcceptedProposals = (proposal: Proposal, isAccepting: boolean) => {
        setLocalAcceptedProposals(prev => {
            const newProposals = { ...prev };
            
            // Convertir la proposition au format AcceptedProposal
            const acceptedProposal = {
                ...proposal,
                id: proposal.id.toString(),
                project_id: proposal.project_id.toString(),
                proposer_id: proposal.proposer_id.toString()
            };
            
            switch (proposal.type) {
                case 'goal':
                    if (isAccepting) {
                        newProposals.goals = [...(prev.goals || []), acceptedProposal];
                    } else {
                        newProposals.goals = (prev.goals || []).filter(p => p.id !== acceptedProposal.id);
                    }
                    break;
                case 'start_date':
                    if (isAccepting) {
                        newProposals.startDates = [...(prev.startDates || []), acceptedProposal];
                    } else {
                        newProposals.startDates = (prev.startDates || []).filter(p => p.id !== acceptedProposal.id);
                    }
                    break;
                case 'end_date':
                    if (isAccepting) {
                        newProposals.endDates = [...(prev.endDates || []), acceptedProposal];
                    } else {
                        newProposals.endDates = (prev.endDates || []).filter(p => p.id !== acceptedProposal.id);
                    }
                    break;
                case 'budget':
                    if (isAccepting) {
                        newProposals.budgets = [...(prev.budgets || []), acceptedProposal];
                    } else {
                        newProposals.budgets = (prev.budgets || []).filter(p => p.id !== acceptedProposal.id);
                    }
                    break;
            }
            
            return newProposals;
        });
    };

    // Mettre à jour le statut d'une proposition
    const handleUpdateStatus = async (id: string | number, status: ProposalStatus) => {
        try {
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
                const error = await response.json();
                throw new Error(error.message || 'Échec de la mise à jour du statut');
            }

            // Trouver la proposition concernée
            let updatedProposal: Proposal | undefined;
            if (activeTab === 'objectives') {
                updatedProposal = proposals.goal.find(p => p.id === id);
            } else if (activeTab === 'budget') {
                updatedProposal = proposals.budget.find(p => p.id === id);
            } else {
                updatedProposal = proposals.time.find(p => p.id === id);
            }

            if (updatedProposal) {
                // Mettre à jour les propositions acceptées localement
                if (status === 'accepted') {
                    updateLocalAcceptedProposals(updatedProposal, true);
                } else if (status === 'pending' && updatedProposal.status === 'accepted') {
                    updateLocalAcceptedProposals(updatedProposal, false);
                }
            }

            // Recharger les propositions après la mise à jour
            if (activeTab === 'time') {
                await fetchProposals('start_date');
                await fetchProposals('end_date');
            } else {
                const proposalType: ProposalType = activeTab === 'objectives' ? 'goal' : 'budget';
                await fetchProposals(proposalType);
            }
            
            const statusMessages = {
                pending: {
                    title: 'Remise en attente',
                    description: 'La proposition a été remise en attente avec succès.'
                },
                accepted: {
                    title: 'Proposition acceptée',
                    description: 'La proposition a été acceptée avec succès.'
                },
                rejected: {
                    title: 'Proposition rejetée',
                    description: 'La proposition a été rejetée avec succès.'
                }
            };
            
            toast.success(statusMessages[status].title, {
                description: statusMessages[status].description
            });
            setConfirmDialogOpen(false);
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            if (error.message.includes('propre proposition')) {
                toast.error('Action non autorisée', {
                    description: 'Vous ne pouvez pas modifier le statut de votre propre proposition.'
                });
            } else {
                toast.error('Erreur de mise à jour', {
                    description: error.message || 'Une erreur est survenue lors de la mise à jour du statut.'
                });
            }
        }
    };

    // Charger les propositions au montage
    useEffect(() => {
        console.log('Chargement initial des propositions...');
            fetchProposals('goal');
            fetchProposals('start_date');
            fetchProposals('end_date');
            fetchProposals('budget');
    }, [project.id]);

    // Log l'état des propositions à chaque rendu
    console.log('État actuel des propositions:', proposals);

    // Modifier le rendu du résumé pour utiliser localAcceptedProposals
    const renderAcceptedProposalsSummary = () => {
        if (!localAcceptedProposals) return null;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Résumé du contrat</CardTitle>
                    <CardDescription>Propositions acceptées pour ce projet</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {localAcceptedProposals.goals && localAcceptedProposals.goals.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Objectifs</h3>
                                {localAcceptedProposals.goals.map((goal, index) => (
                                    <p key={index} className="text-slate-200">{goal.value}</p>
                                ))}
                            </div>
                        )}
                        {localAcceptedProposals.startDates && localAcceptedProposals.startDates.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Date de début</h3>
                                {localAcceptedProposals.startDates.map((date, index) => (
                                    <p key={index} className="text-slate-200">{formatDate(date.value)}</p>
                                ))}
                            </div>
                        )}
                        {localAcceptedProposals.endDates && localAcceptedProposals.endDates.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Date de fin</h3>
                                {localAcceptedProposals.endDates.map((date, index) => (
                                    <p key={index} className="text-slate-200">{formatDate(date.value)}</p>
                                ))}
                            </div>
                        )}
                        {localAcceptedProposals.budgets && localAcceptedProposals.budgets.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Budget</h3>
                                {localAcceptedProposals.budgets.map((budget, index) => (
                                    <p key={index} className="text-slate-200">{formatBudget(budget.value)}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Fonction pour ouvrir le dialogue de modification
    const handleOpenEditDialog = (proposal: Proposal) => {
        setEditingProposal(proposal);
        setEditValue(proposal.value);
        setEditDialogOpen(true);
    };

    // Modifier une proposition
    const handleEditProposal = async () => {
        if (!editingProposal) return;

        try {
            if (!editValue.trim()) {
                toast.error('Valeur invalide', {
                    description: 'La nouvelle valeur ne peut pas être vide.'
                });
                return;
            }

            const response = await fetch(`/api/projects/proposals/${editingProposal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
                body: JSON.stringify({ value: editValue })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Échec de la modification');
            }

            // Recharger les propositions
            if (editingProposal.type === 'start_date' || editingProposal.type === 'end_date') {
                await fetchProposals('start_date');
                await fetchProposals('end_date');
            } else {
                await fetchProposals(editingProposal.type);
            }
            
            const typeMessages = {
                goal: {
                    title: 'Objectif modifié',
                    description: 'L\'objectif a été modifié avec succès.'
                },
                start_date: {
                    title: 'Date de début modifiée',
                    description: 'La date de début a été modifiée avec succès.'
                },
                end_date: {
                    title: 'Date de fin modifiée',
                    description: 'La date de fin a été modifiée avec succès.'
                },
                budget: {
                    title: 'Budget modifié',
                    description: 'Le budget a été modifié avec succès.'
                }
            };
            
            toast.success(typeMessages[editingProposal.type].title, {
                description: typeMessages[editingProposal.type].description
            });
            setEditDialogOpen(false);
            setEditingProposal(null);
            setEditValue('');
        } catch (error: any) {
            console.error('Erreur détaillée lors de la modification:', {
                error,
                proposal: editingProposal,
                value: editValue
            });
            if (error.message.includes('créateur')) {
                toast.error('Action non autorisée', {
                    description: 'Seul le créateur de la proposition peut la modifier.'
                });
            } else {
                toast.error('Erreur de modification', {
                    description: error.message || 'Une erreur est survenue lors de la modification.'
                });
            }
        }
    };

    // Supprimer une proposition
    const handleDeleteProposal = async (id: number, type: ProposalType) => {
        try {
            const response = await fetch(`/api/projects/proposals/${id}`, {
                method: 'DELETE',
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
                throw new Error(error.message || 'Échec de la suppression de la proposition');
            }

            // Mise à jour immédiate de l'état local
            if (type === 'start_date' || type === 'end_date') {
                setProposals(prev => ({
                    ...prev,
                    time: prev.time.filter(p => p.id !== id)
                }));
            } else {
                setProposals(prev => ({
                    ...prev,
                    [type === 'goal' ? 'goal' : 'budget']: prev[type === 'goal' ? 'goal' : 'budget'].filter(p => p.id !== id)
                }));
            }
            
            const typeMessages = {
                goal: {
                    title: 'Objectif supprimé',
                    description: 'L\'objectif a été supprimé avec succès.'
                },
                start_date: {
                    title: 'Date de début supprimée',
                    description: 'La date de début a été supprimée avec succès.'
                },
                end_date: {
                    title: 'Date de fin supprimée',
                    description: 'La date de fin a été supprimée avec succès.'
                },
                budget: {
                    title: 'Budget supprimé',
                    description: 'Le budget a été supprimé avec succès.'
                }
            };
            
            toast.success(typeMessages[type].title, {
                description: typeMessages[type].description
            });
            setConfirmDialogOpen(false);
            setConfirmAction({ type: 'delete', proposal: null });
        } catch (error: any) {
            console.error('Erreur lors de la suppression de la proposition:', error);
            if (error.message.includes('créateur')) {
                toast.error('Action non autorisée', {
                    description: 'Seul le créateur de la proposition peut la supprimer.'
                });
            } else {
                toast.error('Erreur de suppression', {
                    description: error.message || 'Une erreur est survenue lors de la suppression.'
                });
            }
        }
    };

    // Fonction pour ouvrir le dialogue de confirmation
    const handleConfirmAction = (type: 'delete' | 'accept' | 'reject', proposal: Proposal) => {
        setConfirmAction({ type, proposal });
        setConfirmDialogOpen(true);
    };

    // Fonction pour exécuter l'action confirmée
    const executeConfirmedAction = async () => {
        const { type, proposal } = confirmAction;
        if (!proposal) return;

        try {
            switch (type) {
                case 'delete':
                    await handleDeleteProposal(proposal.id, proposal.type);
                    break;
                case 'accept':
                    await handleUpdateStatus(proposal.id, 'accepted');
                    break;
                case 'reject':
                    await handleUpdateStatus(proposal.id, 'rejected');
                    break;
            }
            setConfirmDialogOpen(false);
        } catch (error) {
            console.error('Erreur lors de l\'exécution de l\'action:', error);
            toast.error('Une erreur est survenue lors de l\'exécution de l\'action');
        }
    };

    if (!acceptedProposals) {
        return (
            <Card className="border-slate-700 bg-slate-900">
                <CardHeader>
                    <CardTitle>Contrat du Projet</CardTitle>
                    <CardDescription className="text-slate-400">
                        Chargement des propositions acceptées...
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Résumé des propositions acceptées */}
            <Card className="border-slate-700 bg-slate-900">
                <CardHeader>
                    <CardTitle>Résumé du Contrat</CardTitle>
                    <CardDescription className="text-slate-400">
                        Résumé de toutes les propositions acceptées pour ce projet
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Objectifs validés */}
                        <div>
                            <h3 className="mb-3 text-lg font-medium">Objectifs Acceptés</h3>
                            <div className="space-y-2">
                                {localAcceptedProposals.goals && localAcceptedProposals.goals.length > 0 ? (
                                    localAcceptedProposals.goals.map(goal => (
                                        <div key={goal.id} className="rounded-md bg-slate-800 p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Check className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-slate-200">{goal.value}</span>
                                                </div>
                                                {isAdmin && project.status === 'pending' && (
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-amber-700 bg-slate-800 hover:bg-amber-900 hover:text-amber-500"
                                                        onClick={() => handleUpdateStatus(goal.id, 'pending')}
                                                        title="Remettre en attente"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 italic">Aucun objectif accepté pour le moment</p>
                                )}
                            </div>
                        </div>

                        {/* Dates de début validées */}
                        <div>
                            <h3 className="mb-3 text-lg font-medium">Dates de début acceptées</h3>
                            <div className="space-y-2">
                                {localAcceptedProposals.startDates && localAcceptedProposals.startDates.length > 0 ? (
                                    localAcceptedProposals.startDates.map(date => (
                                        <div key={date.id} className="rounded-md bg-slate-800 p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Check className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-slate-200">
                                                        {formatDate(date.value)}
                                                    </span>
                                                </div>
                                                {isAdmin && project.status === 'pending' && (
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-amber-700 bg-slate-800 hover:bg-amber-900 hover:text-amber-500"
                                                        onClick={() => handleUpdateStatus(date.id, 'pending')}
                                                        title="Remettre en attente"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 italic">Aucune date de début acceptée</p>
                                )}
                            </div>
                        </div>

                        {/* Dates de fin validées */}
                        <div>
                            <h3 className="mb-3 text-lg font-medium">Dates de fin acceptées</h3>
                            <div className="space-y-2">
                                {localAcceptedProposals.endDates && localAcceptedProposals.endDates.length > 0 && (
                                    localAcceptedProposals.endDates.map(date => (
                                        <div key={date.id} className="rounded-md bg-slate-800 p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Check className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-slate-200">
                                                        {formatDate(date.value)}
                                                    </span>
                                                </div>
                                                {isAdmin && project.status === 'pending' && (
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-amber-700 bg-slate-800 hover:bg-amber-900 hover:text-amber-500"
                                                        onClick={() => handleUpdateStatus(date.id, 'pending')}
                                                        title="Remettre en attente"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Budget validé */}
                        <div>
                            <h3 className="mb-3 text-lg font-medium">Budget Accepté</h3>
                            <div className="space-y-2">
                                {localAcceptedProposals.budgets && localAcceptedProposals.budgets.length > 0 && (
                                    localAcceptedProposals.budgets.map(budget => (
                                        <div key={budget.id} className="rounded-md bg-slate-800 p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Check className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-slate-200">
                                                        {formatBudget(budget.value)}
                                                    </span>
                                                </div>
                                                {isAdmin && project.status === 'pending' && (
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-amber-700 bg-slate-800 hover:bg-amber-900 hover:text-amber-500"
                                                        onClick={() => handleUpdateStatus(budget.id, 'pending')}
                                                        title="Remettre en attente"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gestion des propositions */}
            {(isAdmin || project.status === 'pending') && (
                <Card className="border-slate-700 bg-slate-900">
                    <CardHeader>
                        <CardTitle>Gestion des Propositions</CardTitle>
                        <CardDescription className="text-slate-400">
                            Gérer toutes les propositions du projet
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
                            <TabsList className="border-slate-700 bg-slate-800">
                                <TabsTrigger value="objectives">Objectifs</TabsTrigger>
                                <TabsTrigger value="time">Dates</TabsTrigger>
                                <TabsTrigger value="budget">Budget</TabsTrigger>
                            </TabsList>

                            {/* Objectifs */}
                            <TabsContent value="objectives">
                                <div className="space-y-4">
                                    {Array.isArray(proposals.goal) && proposals.goal.map((objective) => (
                                        <div
                                            key={objective.id}
                                            className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                {renderStatusIcon(objective.status)}
                                                <span className="text-slate-200">{objective.value}</span>
                                            </div>
                                            {project.status === 'pending' && (
                                                <div className="flex items-center gap-2">
                                                    {objective.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 border-emerald-700 bg-slate-800 hover:bg-emerald-900 hover:text-emerald-500"
                                                                onClick={() => handleConfirmAction('accept', objective)}
                                                            >
                                                                <Check className="h-4 w-4 text-emerald-500" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 border-rose-700 bg-slate-800 hover:bg-rose-900 hover:text-rose-500"
                                                                onClick={() => handleConfirmAction('reject', objective)}
                                                            >
                                                                <X className="h-4 w-4 text-rose-500" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                        onClick={() => handleOpenEditDialog(objective)}
                                                    >
                                                        <Edit className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                        onClick={() => handleConfirmAction('delete', objective)}
                                                    >
                                                        <Trash className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {project.status === 'pending' && (
                                        <div className="mt-4 flex gap-2">
                                            <Input
                                                placeholder="Ajouter un nouvel objectif..."
                                                value={newObjective}
                                                onChange={(e) => setNewObjective(e.target.value)}
                                                className="border-slate-700 bg-slate-800 text-white"
                                            />
                                            <Button 
                                                onClick={() => handleAddProposal('goal', newObjective)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Ajouter
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Dates */}
                            <TabsContent value="time">
                                <div className="space-y-6">
                                    {/* Dates de début */}
                                    <div>
                                        <h3 className="mb-3 text-lg font-medium">Dates de début proposées</h3>
                                        <div className="space-y-3">
                                            {Array.isArray(proposals.time) && proposals.time
                                                .filter(p => p.type === 'start_date')
                                                .map((date, index) => (
                                                    <div
                                                        key={`start_date_${date.id}_${index}`}
                                                        className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {renderStatusIcon(date.status)}
                                                            <span className="text-slate-200">
                                                                {formatDate(date.value)}
                                                            </span>
                                                        </div>
                                                        {project.status === 'pending' && (
                                                            <div className="flex items-center gap-2">
                                                                {date.status === 'pending' && (
                                                                    <>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="outline"
                                                                            className="h-8 w-8 border-emerald-700 bg-slate-800 hover:bg-emerald-900 hover:text-emerald-500"
                                                                            onClick={() => handleConfirmAction('accept', date)}
                                                                        >
                                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="outline"
                                                                            className="h-8 w-8 border-rose-700 bg-slate-800 hover:bg-rose-900 hover:text-rose-500"
                                                                            onClick={() => handleConfirmAction('reject', date)}
                                                                        >
                                                                            <X className="h-4 w-4 text-rose-500" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                    onClick={() => handleOpenEditDialog(date)}
                                                                >
                                                                    <Edit className="h-4 w-4 text-slate-400" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                    onClick={() => handleConfirmAction('delete', date)}
                                                                >
                                                                    <Trash className="h-4 w-4 text-slate-400" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>

                                        {project.status === 'pending' && (
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
                                                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="bg-slate-700" />

                                    {/* Dates de fin */}
                                    <div>
                                        <h3 className="mb-3 text-lg font-medium">Dates de fin proposées</h3>
                                        <div className="space-y-3">
                                            {Array.isArray(proposals.time) && proposals.time
                                                .filter(p => p.type === 'end_date')
                                                .map((date, index) => (
                                                    <div
                                                        key={`end_date_${date.id}_${index}`}
                                                        className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {renderStatusIcon(date.status)}
                                                            <span className="text-slate-200">
                                                                {formatDate(date.value)}
                                                            </span>
                                                        </div>
                                                        {project.status === 'pending' && (
                                                            <div className="flex items-center gap-2">
                                                                {date.status === 'pending' && (
                                                                    <>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="outline"
                                                                            className="h-8 w-8 border-emerald-700 bg-slate-800 hover:bg-emerald-900 hover:text-emerald-500"
                                                                            onClick={() => handleConfirmAction('accept', date)}
                                                                        >
                                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="outline"
                                                                            className="h-8 w-8 border-rose-700 bg-slate-800 hover:bg-rose-900 hover:text-rose-500"
                                                                            onClick={() => handleConfirmAction('reject', date)}
                                                                        >
                                                                            <X className="h-4 w-4 text-rose-500" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                    onClick={() => handleOpenEditDialog(date)}
                                                                >
                                                                    <Edit className="h-4 w-4 text-slate-400" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                                    onClick={() => handleConfirmAction('delete', date)}
                                                                >
                                                                    <Trash className="h-4 w-4 text-slate-400" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>

                                        {project.status === 'pending' && (
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
                                                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Budget */}
                            <TabsContent value="budget">
                                <div className="space-y-4">
                                    {Array.isArray(proposals.budget) && proposals.budget.map((budget) => (
                                        <div
                                            key={budget.id}
                                            className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                {renderStatusIcon(budget.status)}
                                                <span className="text-slate-200">
                                                    {formatBudget(budget.value)}
                                                </span>
                                            </div>
                                            {project.status === 'pending' && (
                                                <div className="flex items-center gap-2">
                                                    {budget.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 border-emerald-700 bg-slate-800 hover:bg-emerald-900 hover:text-emerald-500"
                                                                onClick={() => handleConfirmAction('accept', budget)}
                                                            >
                                                                <Check className="h-4 w-4 text-emerald-500" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 border-rose-700 bg-slate-800 hover:bg-rose-900 hover:text-rose-500"
                                                                onClick={() => handleConfirmAction('reject', budget)}
                                                            >
                                                                <X className="h-4 w-4 text-rose-500" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                        onClick={() => handleOpenEditDialog(budget)}
                                                    >
                                                        <Edit className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700"
                                                        onClick={() => handleConfirmAction('delete', budget)}
                                                    >
                                                        <Trash className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {project.status === 'pending' && (
                                        <div className="mt-4 flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Montant du budget..."
                                                value={newBudget}
                                                onChange={(e) => setNewBudget(e.target.value)}
                                                className="border-slate-700 bg-slate-800 text-white"
                                            />
                                            <Button
                                                onClick={() => handleAddProposal('budget', newBudget)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Ajouter
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

            {/* Dialogue de modification */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="bg-slate-900 text-white">
                    <DialogHeader>
                        <DialogTitle>Modifier la proposition</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Modifiez la valeur de votre proposition
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="border-slate-700 bg-slate-800 text-white"
                            type={editingProposal?.type === 'budget' ? 'number' : 
                                  editingProposal?.type === 'start_date' || editingProposal?.type === 'end_date' ? 'date' : 'text'}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleEditProposal} className="bg-blue-600 hover:bg-blue-700">
                            Sauvegarder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialogue de confirmation */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="bg-slate-900 text-white">
                    <DialogHeader>
                        <DialogTitle>
                            {confirmAction.type === 'delete' ? 'Confirmer la suppression' :
                             confirmAction.type === 'accept' ? 'Confirmer l\'acceptation' :
                             'Confirmer le refus'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {confirmAction.type === 'delete' ? 'Êtes-vous sûr de vouloir supprimer cette proposition ?' :
                             confirmAction.type === 'accept' ? 'Êtes-vous sûr de vouloir accepter cette proposition ?' :
                             'Êtes-vous sûr de vouloir refuser cette proposition ?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button 
                            onClick={executeConfirmedAction}
                            className={
                                confirmAction.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700' :
                                confirmAction.type === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                'bg-amber-600 hover:bg-amber-700'
                            }
                        >
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 