'use client';

import { useEffect, useState } from 'react';
import { useProjects } from '@/context/project-context';
import { Project } from '@/types';
import { BarChart, Calendar, Clock, DollarSign } from 'lucide-react';

export function ManagerDashboard() {
    const { projects, loading, error, user, getManagerProjects } = useProjects();
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        getManagerProjects(currentPage);
    }, [currentPage]);

    const getProjectStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'completed':
                return 'bg-blue-500';
            case 'rejected':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60a5fa]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
                <p className="text-slate-400">
                    Bienvenue, {user.name}. Vous gérez actuellement {projects.total} projet(s).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">Projets actifs</h3>
                    </div>
                    <p className="text-2xl font-bold">
                        {projects.data.filter((p: Project) => p.status === 'active').length}
                    </p>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-medium">Projets en attente</h3>
                    </div>
                    <p className="text-2xl font-bold">
                        {projects.data.filter((p: Project) => p.status === 'pending').length}
                    </p>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-green-500" />
                        <h3 className="font-medium">Projets terminés</h3>
                    </div>
                    <p className="text-2xl font-bold">
                        {projects.data.filter((p: Project) => p.status === 'completed').length}
                    </p>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-purple-500" />
                        <h3 className="font-medium">Budget total</h3>
                    </div>
                    <p className="text-2xl font-bold">
                        {projects.data.reduce((sum: number, p: Project) => sum + (p.budget || 0), 0).toLocaleString()} €
                    </p>
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-medium">Mes projets</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Projet</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Budget</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Date de fin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.data.map((project: Project) => (
                                <tr key={project.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium">{project.title}</p>
                                            <p className="text-sm text-slate-400">{project.description}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getProjectStatusColor(
                                                project.status
                                            )}`}
                                        >
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {project.budget ? `${project.budget.toLocaleString()} €` : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm">
                                            {project.end_date
                                                ? new Date(project.end_date).toLocaleDateString('fr-FR')
                                                : '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {projects.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t border-slate-700">
                        {Array.from({ length: projects.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded-md transition-colors ${
                                    currentPage === page
                                        ? "bg-[#60a5fa] text-white"
                                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 