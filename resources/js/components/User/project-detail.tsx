'use client';

import { ProjectChat } from '@/components/User/project-chat';
import { ProjectPart } from '@/components/User/project-part';
import { StatusBadge } from '@/components/User/status-badge';
import { useProjects } from '@/context/project-context';
import { Dev, User as UserType } from '@/types';
import { Calendar, DollarSign, Plus, Save, User, X } from 'lucide-react';
import { useState } from 'react';

interface ProjectDetailProps {
    projectId: string;
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
    const { getProjectById, updateProject } = useProjects();
    const project = getProjectById(projectId);
    const [activeTab, setActiveTab] = useState<string>('parts');
    const [showAddPart, setShowAddPart] = useState(false);
    const [newPartName, setNewPartName] = useState('');

    // Edit mode states,
    const [editDeadline, setEditDeadline] = useState<string>(project?.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '');
    const [editBudget, setEditBudget] = useState<number>(project?.budget || 0);
    const [showAddDev, setShowAddDev] = useState(false);
    const [newDevName, setNewDevName] = useState('');
    const [newDevRole, setNewDevRole] = useState('');

    if (!project) return <div>Project not found</div>;

    const isEditable = project.status === 'pending';

    const tabs = [
        { label: 'Parts', value: 'parts' },
        { label: 'Membres', value: 'team' },
        { label: 'Chat', value: 'chat' },
        { label: 'Files', value: 'files' },
    ];

    const handleAddPart = () => {
        if (!newPartName.trim()) return;

        const newPart = {
            id: `part-${Date.now()}`,
            name: newPartName,
            progress: 0,
            modules: [],
        };

        updateProject(projectId, {
            parts: [...(project.parts || []), newPart],
        });

        setNewPartName('');
        setShowAddPart(false);
    };

    const handleSaveDeadline = () => {
        updateProject(projectId, {
            end_date: editDeadline || '',
        });
    };

    const handleSaveBudget = () => {
        updateProject(projectId, {
            budget: editBudget || '',
        });
    };

    const handleAddDev = () => {
        if (!newDevName.trim() || !newDevRole.trim()) return;

        const newDev: Dev = {
            name: newDevName,
            role: newDevRole,
        };

        updateProject(projectId, {
            devs: [...project.devs, newDev as UserType],
        });

        setNewDevName('');
        setNewDevRole('');
        setShowAddDev(false);
    };

    const handleRemoveDev = (index: number) => {
        const updatedDevs = [...project.devs];
        updatedDevs.splice(index, 1);
        updateProject(projectId, {
            devs: updatedDevs,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{project.title}</h1>
                        <StatusBadge status={project.status} />
                    </div>
                    <p className="mt-1 text-slate-400">{project.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-4">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                            <Calendar className="h-5 w-5 text-[#60a5fa]" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Deadline</p>
                        </div>
                    </div>

                    {isEditable ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={editDeadline}
                                onChange={(e) => setEditDeadline(e.target.value)}
                                className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 focus:ring-1 focus:ring-[#60a5fa] focus:outline-none"
                            />
                            <button
                                onClick={handleSaveDeadline}
                                className="rounded-md bg-green-500/20 p-2 text-[#34d399] transition-colors hover:bg-green-500/30"
                            >
                                <Save className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <p className="font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No deadline'}</p>
                    )}
                </div>

                <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-4">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                            <DollarSign className="h-5 w-5 text-[#34d399]" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Budget</p>
                        </div>
                    </div>

                    {isEditable ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={editBudget}
                                onChange={(e) => setEditBudget(Number(e.target.value))}
                                className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 focus:ring-1 focus:ring-[#60a5fa] focus:outline-none"
                            />
                            <button
                                onClick={handleSaveBudget}
                                className="rounded-md bg-green-500/20 p-2 text-[#34d399] transition-colors hover:bg-green-500/30"
                            >
                                <Save className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <p className="font-medium">{project.budget ? `$${project.budget.toLocaleString()}` : 'Not estimated'}</p>
                    )}
                </div>

                <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                            <User className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Membres</p>
                            <p className="font-medium">{project.devs.length} membres</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#1e293b] shadow-lg">
                <div className="border-b border-slate-700">
                    <div className="flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`px-4 py-3 font-medium transition-colors ${
                                    activeTab === tab.value ? 'border-b-2 border-[#60a5fa] text-[#60a5fa]' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4">
                    {activeTab === 'parts' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Project parts</h3>
                                <button
                                    onClick={() => setShowAddPart(!showAddPart)}
                                    className="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1 transition-colors hover:bg-slate-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Part</span>
                                </button>
                            </div>

                            {showAddPart && (
                                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                                    <h4 className="mb-2 font-medium">New Part</h4>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newPartName}
                                            onChange={(e) => setNewPartName(e.target.value)}
                                            placeholder="Part name"
                                            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 focus:ring-1 focus:ring-[#60a5fa] focus:outline-none"
                                        />
                                        <button
                                            onClick={handleAddPart}
                                            className="rounded-md bg-[#60a5fa] px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => setShowAddPart(false)}
                                            className="rounded-md bg-slate-700 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {project.parts && project.parts.length > 0 ? (
                                <div className="space-y-4">
                                    {project.parts.map((part, index) => (
                                        <ProjectPart
                                            key={part.id}
                                            part={part}
                                            projectId={projectId}
                                            index={index}
                                            isLocked={index > 0 && project.parts && project.parts[index - 1].progress < 100}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/50 py-8 text-center text-slate-400">
                                    <p>No parts created yet.</p>
                                    <p className="mt-1 text-sm">Create your first part to start planning your project.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Membres</h3>
                                {isEditable && (
                                    <button
                                        onClick={() => setShowAddDev(!showAddDev)}
                                        className="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1 transition-colors hover:bg-slate-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Ajouter Membre</span>
                                    </button>
                                )}
                            </div>

                            {showAddDev && isEditable && (
                                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                                    <h4 className="mb-2 font-medium">Nouveau Membre</h4>
                                    <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                                        <input
                                            type="text"
                                            value={newDevName}
                                            onChange={(e) => setNewDevName(e.target.value)}
                                            placeholder="Nom du membre"
                                            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 focus:ring-1 focus:ring-[#60a5fa] focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={newDevRole}
                                            onChange={(e) => setNewDevRole(e.target.value)}
                                            placeholder="Rôle du membre"
                                            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 focus:ring-1 focus:ring-[#60a5fa] focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={handleAddDev}
                                            className="rounded-md bg-[#60a5fa] px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                                        >
                                            Ajouter
                                        </button>
                                        <button
                                            onClick={() => setShowAddDev(false)}
                                            className="rounded-md bg-slate-700 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-600"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {project.devs.map((dev, index) => (
                                    <div key={index} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#60a5fa]">
                                            <span className="font-bold text-white">{dev.name.charAt(0)}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{dev.name}</p>
                                            <p className="text-sm text-slate-400">{dev.role}</p>
                                        </div>
                                        {isEditable && (
                                            <button
                                                onClick={() => handleRemoveDev(index)}
                                                className="rounded-md bg-red-500/20 p-1.5 text-[#f87171] transition-colors hover:bg-red-500/30"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {project.devs.length === 0 && (
                                    <div className="col-span-3 rounded-lg border border-dashed border-slate-700 bg-slate-800/50 py-6 text-center text-slate-400">
                                        <p>Aucun membre ajouté.</p>
                                        {isEditable && <p className="mt-1 text-sm">Ajoutez des membres pour commencer à planifier votre projet.</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && <ProjectChat projectId={projectId} />}

                    {activeTab === 'files' && (
                        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/50 py-8 text-center text-slate-400">
                            <p>No files uploaded yet.</p>
                            <p className="mt-1 text-sm">Upload files to share with your team.</p>
                            <button className="mx-auto mt-4 flex items-center gap-1 rounded-md bg-slate-800 px-4 py-2 transition-colors hover:bg-slate-700">
                                <Plus className="h-4 w-4" />
                                <span>Upload Files</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
