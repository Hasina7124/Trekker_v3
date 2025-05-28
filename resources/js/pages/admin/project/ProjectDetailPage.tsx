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

type AcceptedProposal = {
    id: string;
    value: string | number;
    type: string;
    status: string;
    project_id: string;
    proposer_id: string;
    validator_id?: string;
    validated_at?: string;
};

type AcceptedProposalsState = {
    goals: AcceptedProposal[];
    startDates: AcceptedProposal[];
    endDates: AcceptedProposal[];
    budgets: AcceptedProposal[];
} | null;

const statusColors = {
    active: 'bg-emerald-500',
    completed: 'bg-blue-500',
    pending: 'bg-amber-500',
    canceled: 'bg-rose-500',
};

export default function ProjectDetailPage() {
    const page = usePage<PageProps<ProjectDetailPageProps>>();
    const { project: currentProject, proposals: initialProposals } = page.props;
    const projectId = currentProject.id;

    const [mainTab, setMainTab] = useState<TabsValue>('objectives');
    const [subTab, setSubTab] = useState<SubTabValue>('time');
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction>('validate');
    const [confirmationTarget, setConfirmationTarget] = useState<ConfirmationTarget>('objective');
    const [itemToAction, setItemToAction] = useState('');
    const [editObjectiveOpen, setEditObjectiveOpen] = useState(false);
    const [editingObjective, setEditingObjective] = useState<Proposal>();

    const [proposals, setProposals] = useState({
        goal: [] as Proposal[],
        time: [] as Proposal[],
        budget: [] as Proposal[],
    });

    const [acceptedProposals, setAcceptedProposals] = useState<AcceptedProposalsState>(null);

    const [formValues, setFormValues] = useState({
        objective: '',
        startDate: '',
        endDate: '',
        budgetAmount: '',
    });

    useEffect(() => {
        if (initialProposals?.data) {
            setProposals({
                goal: initialProposals.data.filter((proposal: Proposal) => proposal.type === 'goal'),
                time: initialProposals.data.filter((proposal: Proposal) => ['start_date', 'end_date'].includes(proposal.type)),
                budget: initialProposals.data.filter((proposal: Proposal) => proposal.type === 'budget'),
            });
        }
    }, [initialProposals]);

    useEffect(() => {
        const fetchAcceptedProposals = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}/accepted-proposals`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    credentials: 'include'
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                setAcceptedProposals(await response.json());
            } catch (error) {
                console.error('Error loading accepted proposals:', error);
                toast.error('Error loading accepted proposals');
            }
        };

        fetchAcceptedProposals();
    }, [projectId]);

    const canActivateProject = acceptedProposals ? (
        acceptedProposals.goals.length > 0 &&
        acceptedProposals.startDates.length > 0 &&
        acceptedProposals.endDates.length > 0 &&
        acceptedProposals.budgets.length > 0
    ) : false;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not defined';
        const date = new Date(dateString);
        return format(date, "EEEE dd MMMM yyyy", { locale: fr }).replace(/^\w/, c => c.toUpperCase());
    };

    const formatBudget = (value: string | number): string => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(numericValue);
    };

    const renderStatusIcon = (status: ProposalStatus) => {
        const icons = {
            pending: <Clock className="h-4 w-4 text-amber-500" />,
            accepted: <Check className="h-4 w-4 text-emerald-500" />,
            rejected: <X className="h-4 w-4 text-rose-500" />,
        };
        return icons[status];
    };

    const fetchProposals = async (type?: 'goal' | 'time' | 'budget') => {
        try {
            const apiUrl = `/api/projects/${currentProject.id}/proposals${type ? `/${type}` : ''}`;
            const response = await fetch(apiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include'
            });

            if (!response.ok) throw new Error(await response.json().then(data => data.message || 'Failed to fetch proposals'));

            const data = await response.json();
            
            if (type) {
                setProposals(prev => ({
                    ...prev,
                    [type]: data.data.filter((p: Proposal) => type === 'time' ? ['start_date', 'end_date'].includes(p.type) : p.type === type)
                }));
            } else {
                setProposals({
                    goal: data.data.filter((p: Proposal) => p.type === 'goal'),
                    time: data.data.filter((p: Proposal) => ['start_date', 'end_date'].includes(p.type)),
                    budget: data.data.filter((p: Proposal) => p.type === 'budget'),
                });
            }
        } catch (error: any) {
            console.error('Error fetching proposals:', error);
            toast.error(error.message || 'Failed to fetch proposals');
        }
    };

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

            if (!response.ok) throw new Error(await response.json().then(data => data.message || 'Failed to add proposal'));

            setFormValues(prev => ({ ...prev, [type === 'goal' ? 'objective' : type === 'budget' ? 'budgetAmount' : type === 'start_date' ? 'startDate' : 'endDate']: '' }));
            
            if (type === 'goal') fetchProposals('goal');
            if (type === 'start_date' || type === 'end_date') fetchProposals('time');
            if (type === 'budget') fetchProposals('budget');

            toast.success('Proposal added successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add proposal');
        }
    };

    const updateProposalStatus = async (id: string, status: 'accepted' | 'rejected' | 'pending') => {
        try {
            const allProposals = [...proposals.goal, ...proposals.time, ...proposals.budget];
            const proposal = allProposals.find(p => p.id === id);
            if (!proposal) throw new Error('Proposal not found');

            if (status === 'accepted' && proposal.type !== 'goal') {
                const currentAccepted = acceptedProposals?.[
                    proposal.type === 'budget' ? 'budgets' : 
                    proposal.type === 'start_date' ? 'startDates' : 'endDates'
                ][0];

                if (currentAccepted) {
                    await fetch(`/api/projects/proposals/${currentAccepted.id}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ status: 'rejected' })
                    });
                }

                const otherProposals = proposal.type === 'budget' 
                    ? proposals.budget.filter(p => p.id !== id)
                    : proposals.time.filter(p => p.type === proposal.type && p.id !== id);

                for (const p of otherProposals) {
                    if (p.status !== 'rejected') {
                        await fetch(`/api/projects/proposals/${p.id}/status`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({ status: 'rejected' })
                        });
                    }
                }
            }

            const response = await fetch(`/api/projects/proposals/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update status');

            setAcceptedProposals(prev => {
                if (!prev) return prev;
                const newState = { ...prev };
                const key = proposal.type === 'goal' ? 'goals' : 
                          proposal.type === 'start_date' ? 'startDates' : 
                          proposal.type === 'end_date' ? 'endDates' : 'budgets';

                if (status === 'accepted') {
                    newState[key] = key === 'goals' ? [...prev[key], proposal] : [proposal];
                } else {
                    newState[key] = prev[key].filter(p => p.id !== id);
                }
                return newState;
            });

            await fetchProposals();
            toast.success(status === 'accepted' ? 'Proposal accepted' : status === 'rejected' ? 'Proposal rejected' : 'Proposal set to pending');
            setConfirmationOpen(false);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status');
        }
    };

    const deleteProposal = async (id: string) => {
        try {
            const response = await fetch(`/api/projects/proposals/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error(await response.json().then(data => data.message || 'Failed to delete proposal'));

            if (mainTab === 'objectives') fetchProposals('goal');
            else if (mainTab === 'constraints') fetchProposals(subTab === 'time' ? 'time' : 'budget');

            toast.success('Proposal deleted successfully');
        } catch (error: any) {
            console.error('Error deleting proposal:', error);
            toast.error(error.message || 'Failed to delete');
        }
    };

    const editProposal = async (id: string, value: string, type: string) => {
        try {
            const response = await fetch(`/api/projects/proposals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ value, type }),
            });

            if (!response.ok) throw new Error(await response.json().then(data => data.message || 'Failed to update proposal'));

            if (mainTab === 'objectives') fetchProposals('goal');
            else if (mainTab === 'constraints') fetchProposals(subTab === 'time' ? 'time' : 'budget');

            toast.success('Proposal updated successfully');
            setEditObjectiveOpen(false);
        } catch (error: any) {
            console.error('Error editing proposal:', error);
            toast.error(error.message || 'Failed to update');
        }
    };

    const openConfirmationDialog = (action: ConfirmationAction, target: ConfirmationTarget, id: string) => {
        setConfirmationAction(action);
        setConfirmationTarget(target);
        setItemToAction(id);
        setConfirmationOpen(true);
    };

    const handleConfirmAction = () => {
        if (confirmationAction === 'validate') updateProposalStatus(itemToAction, 'accepted');
        else if (confirmationAction === 'reject') updateProposalStatus(itemToAction, 'rejected');
        else deleteProposal(itemToAction);
        setConfirmationOpen(false);
    };

    const members: Member[] = [
        {
            id: 'mem1',
            name: 'Sarah Johnson',
            role: 'Project Manager',
            level: 'Senior',
            avatar: '/placeholder.svg?height=40&width=40',
        },
    ];

    useEffect(() => {
        if (mainTab === 'objectives') fetchProposals('goal');
        else if (mainTab === 'constraints') fetchProposals(subTab === 'time' ? 'time' : 'budget');
    }, [mainTab, subTab]);

    const activateProject = async () => {
        try {
            const response = await fetch(`/api/projects/${currentProject.id}/activate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error(await response.json().then(data => data.message || 'Failed to activate project'));
            toast.success('Project activated successfully');
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Failed to activate project');
        }
    };

    const rejectProject = async () => {
        try {
            const response = await fetch(`/api/projects/${currentProject.id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error(await response.json().then(data => data.message || 'Failed to reject project'));
            toast.success('Project rejected successfully');
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject project');
        }
    };

    return (
        <ProjectLayout>
            <div className="min-h-screen bg-slate-800 p-6 text-white">
                <div className="mx-auto max-w-7xl space-y-6">
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

                    <Card className="border-slate-700 bg-slate-900">
                        <CardHeader>
                            <CardTitle>Project Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-300">{currentProject.description}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-700 bg-slate-900">
                        <CardHeader>
                            <CardTitle>Validated Proposals</CardTitle>
                            <CardDescription className="text-slate-400">
                                Summary of all accepted proposals for this project
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {['goals', 'startDates', 'endDates', 'budgets'].map((type) => (
                                    <div key={type}>
                                        <h3 className="mb-3 text-lg font-medium">
                                            Accepted {type.replace('s', type === 'budgets' ? '' : ' ').replace(/([A-Z])/g, ' $1').trim()}
                                        </h3>
                                        <div className="space-y-2">
                                            {acceptedProposals && 
                                             acceptedProposals[type as keyof typeof acceptedProposals] && 
                                             acceptedProposals[type as keyof typeof acceptedProposals].length > 0 ? (
                                                acceptedProposals[type as keyof typeof acceptedProposals].map((item: AcceptedProposal) => (
                                                    <div key={item.id} className="rounded-md bg-slate-800 p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Check className="h-4 w-4 text-emerald-500" />
                                                                <span className="text-slate-200">
                                                                    {type === 'budgets' ? formatBudget(item.value) : 
                                                                     type.includes('Date') ? formatDate(String(item.value)) : item.value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-slate-400 italic">No accepted {type.toLowerCase().replace('s', '')}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {currentProject.status === 'pending' && (
                                    <div className="mt-6 flex justify-end gap-2">
                                        <Button onClick={rejectProject} className="bg-rose-600 hover:bg-rose-700">
                                            <X className="mr-2 h-4 w-4" /> Reject Project
                                        </Button>
                                        <Button
                                            onClick={activateProject}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            disabled={!canActivateProject}
                                        >
                                            <Check className="mr-2 h-4 w-4" /> Validate Project
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as TabsValue)} className="w-full">
                        <TabsList className="border-slate-700 bg-slate-900">
                            {['objectives', 'constraints', 'members'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    onClick={() => {
                                        setMainTab(tab as TabsValue);
                                        if (tab === 'objectives') fetchProposals('goal');
                                        else if (tab === 'constraints') fetchProposals('time');
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="objectives">
                            <Card className="border-slate-700 bg-slate-900">
                                <CardHeader>
                                    <CardTitle>Project Objectives</CardTitle>
                                    <CardDescription className="text-slate-400">Define and track project goals</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {proposals.goal.length > 0 ? (
                                            proposals.goal.map((objective) => (
                                                <div key={objective.id} className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3">
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
                                                                        className="h-8 w-8 border-emerald-700 hover:bg-emerald-900 hover:text-emerald-500"
                                                                        onClick={() => openConfirmationDialog('validate', 'objective', objective.id)}
                                                                    >
                                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-8 w-8 border-rose-700 hover:bg-rose-900 hover:text-rose-500"
                                                                        onClick={() => openConfirmationDialog('reject', 'objective', objective.id)}
                                                                    >
                                                                        <X className="h-4 w-4 text-rose-500" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 border-slate-700 hover:bg-slate-700"
                                                                onClick={() => openConfirmationDialog('delete', 'objective', objective.id)}
                                                            >
                                                                <Trash className="h-4 w-4 text-slate-400" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 border-slate-700 hover:bg-slate-700"
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

                                    {currentProject.status === 'pending' && (
                                        <div className="mt-4 flex gap-2">
                                            <Input
                                                placeholder="Add a new objective..."
                                                value={formValues.objective}
                                                onChange={(e) => setFormValues({...formValues, objective: e.target.value})}
                                                className="border-slate-700 bg-slate-800 text-white"
                                            />
                                            <Button 
                                                onClick={() => handleAddProposal('goal', formValues.objective)} 
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="constraints">
                            <Card className="border-slate-700 bg-slate-900">
                                <CardHeader>
                                    <CardTitle>Project Constraints</CardTitle>
                                    <CardDescription className="text-slate-400">Time and budget limitations for this project</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={subTab} onValueChange={(v) => setSubTab(v as SubTabValue)} className="w-full">
                                        <TabsList className="border-slate-700 bg-slate-800">
                                            {['time', 'budget'].map((tab) => (
                                                <TabsTrigger
                                                    key={tab}
                                                    value={tab}
                                                    onClick={() => {
                                                        setSubTab(tab as SubTabValue);
                                                        fetchProposals(tab as 'time' | 'budget');
                                                    }}
                                                >
                                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>

                                        <TabsContent value="time">
                                            <Card className="mt-4 border-slate-700 bg-slate-800">
                                                <CardContent className="pt-6">
                                                    <div className="space-y-4">
                                                        {['start_date', 'end_date'].map((dateType) => (
                                                            <div key={dateType}>
                                                                <h3 className="mb-3 text-lg font-medium">
                                                                    {dateType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Proposals
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {proposals.time.filter(p => p.type === dateType).length > 0 ? (
                                                                        proposals.time
                                                                            .filter(p => p.type === dateType)
                                                                            .map((proposal) => (
                                                                                <div key={proposal.id} className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3">
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
                                                                                                        className="h-8 w-8 border-emerald-700 hover:bg-emerald-900 hover:text-emerald-500"
                                                                                                        onClick={() => openConfirmationDialog('validate', dateType === 'start_date' ? 'startDate' : 'endDate', proposal.id)}
                                                                                                    >
                                                                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                                                                    </Button>
                                                                                                    <Button
                                                                                                        size="icon"
                                                                                                        variant="outline"
                                                                                                        className="h-8 w-8 border-rose-700 hover:bg-rose-900 hover:text-rose-500"
                                                                                                        onClick={() => openConfirmationDialog('reject', dateType === 'start_date' ? 'startDate' : 'endDate', proposal.id)}
                                                                                                    >
                                                                                                        <X className="h-4 w-4 text-rose-500" />
                                                                                                    </Button>
                                                                                                </>
                                                                                            )}
                                                                                            <Button
                                                                                                size="icon"
                                                                                                variant="outline"
                                                                                                className="h-8 w-8 border-slate-700 hover:bg-slate-700"
                                                                                                onClick={() => openConfirmationDialog('delete', dateType === 'start_date' ? 'startDate' : 'endDate', proposal.id)}
                                                                                            >
                                                                                                <Trash className="h-4 w-4 text-slate-400" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))
                                                                    ) : (
                                                                        <p className="text-gray-500 italic">No {dateType.replace('_', ' ')} proposals found</p>
                                                                    )}
                                                                </div>

                                                                {currentProject.status === 'pending' && (
                                                                    <div className="mt-4 flex gap-2">
                                                                        <Input
                                                                            type="date"
                                                                            value={dateType === 'start_date' ? formValues.startDate : formValues.endDate}
                                                                            onChange={(e) => setFormValues({...formValues, [dateType === 'start_date' ? 'startDate' : 'endDate']: e.target.value})}
                                                                            className="border-slate-700 bg-slate-800 text-white"
                                                                        />
                                                                        <Button
                                                                            onClick={() => handleAddProposal(dateType as 'start_date' | 'end_date', dateType === 'start_date' ? formValues.startDate : formValues.endDate)}
                                                                            className="bg-blue-600 hover:bg-blue-700"
                                                                        >
                                                                            <Plus className="mr-2 h-4 w-4" /> Add
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                {dateType === 'start_date' && <Separator className="my-4 bg-slate-700" />}
                                                            </div>
                                                        ))}
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
                                                                    {currentProject.budget
                                                                        ? `$${Number(currentProject.budget).toLocaleString()}`
                                                                        : 'Not set'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <Separator className="my-4 bg-slate-700" />
                                                        <h3 className="mb-3 text-lg font-medium">Budget Proposals</h3>

                                                        <div className="space-y-3">
                                                            {proposals.budget.length > 0 ? (
                                                                proposals.budget.map((proposal) => (
                                                                    <div key={proposal.id} className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-3">
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
                                                                                            className="h-8 w-8 border-emerald-700 hover:bg-emerald-900 hover:text-emerald-500"
                                                                                            onClick={() => openConfirmationDialog('validate', 'budget', proposal.id)}
                                                                                        >
                                                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="icon"
                                                                                            variant="outline"
                                                                                            className="h-8 w-8 border-rose-700 hover:bg-rose-900 hover:text-rose-500"
                                                                                            onClick={() => openConfirmationDialog('reject', 'budget', proposal.id)}
                                                                                        >
                                                                                            <X className="h-4 w-4 text-rose-500" />
                                                                                        </Button>
                                                                                    </>
                                                                                )}
                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="outline"
                                                                                    className="h-8 w-8 border-slate-700 hover:bg-slate-700"
                                                                                    onClick={() => openConfirmationDialog('delete', 'budget', proposal.id)}
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

                                                        {currentProject.status === 'pending' && (
                                                            <div className="mt-4 flex gap-2">
                                                                <Input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    placeholder="Enter amount"
                                                                    value={formValues.budgetAmount}
                                                                    onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setFormValues({...formValues, budgetAmount: e.target.value})}
                                                                    className="border-slate-700 bg-slate-800 text-white"
                                                                />
                                                                <Button
                                                                    onClick={() => handleAddProposal('budget', formValues.budgetAmount)}
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                    disabled={!formValues.budgetAmount || isNaN(parseFloat(formValues.budgetAmount))}
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
                                                            {member.name.split(' ').map(n => n[0]).join('')}
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

                <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
                    <DialogContent className="border-slate-700 bg-slate-900 text-white">
                        <DialogHeader>
                            <DialogTitle>
                                {confirmationAction === 'validate' ? 'Confirm Validation' :
                                 confirmationAction === 'reject' ? 'Confirm Rejection' : 'Confirm Deletion'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                {confirmationAction === 'validate' ? 'Are you sure you want to validate this item?' :
                                 confirmationAction === 'reject' ? 'Are you sure you want to reject this item?' :
                                 'Are you sure you want to delete this item?'}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setConfirmationOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleConfirmAction}
                                className={confirmationAction === 'validate' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                           confirmationAction === 'reject' ? 'bg-amber-600 hover:bg-amber-700' :
                                           'bg-rose-600 hover:bg-rose-700'}
                            >
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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
                            <Button variant="outline" onClick={() => setEditObjectiveOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() => editingObjective && editProposal(editingObjective.id, String(editingObjective.value), 'goal')}
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