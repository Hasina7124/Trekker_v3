'use client';

import { ProgressBar } from '@/components/User/progress-bar';
import { ProjectCard } from '@/components/User/project-card';
import { useProjects } from '@/context/project-context';
import { AlertTriangle, BarChart, Bell, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import { useState } from 'react';

interface ProjectDashboardProps {
    onSelectProject: (id: string) => void;
}

export function ProjectDashboard() {
    const { projects, user } = useProjects();
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    const filters = [
        { label: 'All', value: 'all' },
        { label: 'To Estimate', value: 'to_estimate' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Pending', value: 'pending' },
        { label: 'Rejected', value: 'rejected' },
    ];

    const filteredProjects = selectedFilter === 'all' ? projects : projects.filter((project) => project.status === selectedFilter);

    // Calculate stats
    // const totalProjects = projects.length
    // const completedProjects = projects.filter((p) => p.progress === 100).length
    // const toEstimateProjects = projects.filter((p) => p.status === "to_estimate").length
    // const inProgressProjects = projects.filter((p) => p.status === "in_progress").length

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Project Dashboard</h1>
                    <p className="mt-1 text-slate-400">Welcome back, {user.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative rounded-full p-2 transition-colors hover:bg-slate-800">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#f87171]"></span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#60a5fa]">
                            <span className="font-bold text-white">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-slate-400">Project Manager</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-400">Total Projects</h3>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                            <Briefcase className="h-4 w-4 text-[#60a5fa]" />
                        </div>
                    </div>
                    {/* <p className="mt-2 text-3xl font-bold">{totalProjects}</p> */}
                    <div className="mt-4 flex items-center text-xs text-[#34d399]">
                        <span>+2 new this month</span>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-400">Completed</h3>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                            <CheckCircle2 className="h-4 w-4 text-[#34d399]" />
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-bold">{completedProjects}</p>
                    <div className="mt-4 flex items-center text-xs">
                        <ProgressBar value={(completedProjects / totalProjects) * 100} className="h-1.5 flex-1" />
                        <span className="ml-2 text-slate-400">{Math.round((completedProjects / totalProjects) * 100)}%</span>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-400">To Estimate</h3>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
                            <Clock className="h-4 w-4 text-[#fbbf24]" />
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-bold">{toEstimateProjects}</p>
                    <div className="mt-4 flex items-center text-xs text-[#fbbf24]">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        <span>Requires attention</span>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-400">In Progress</h3>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                            <BarChart className="h-4 w-4 text-[#60a5fa]" />
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-bold">{inProgressProjects}</p>
                    <div className="mt-4 flex items-center text-xs text-slate-400">
                        <span>Active development</span>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#1e293b] shadow-lg">
                <div className="border-b border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Your Projects</h2>
                        <div className="flex items-center gap-2">
                            {filters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setSelectedFilter(filter.value)}
                                    className={`rounded-md px-3 py-1 text-sm transition-colors ${
                                        selectedFilter === filter.value ? 'bg-slate-800 text-[#60a5fa]' : 'hover:bg-slate-800/50'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} onClick={() => onSelectProject(project.id)} />
                    ))}

                    {filteredProjects.length === 0 && (
                        <div className="col-span-3 py-8 text-center text-slate-400">No projects found matching the selected filter.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
