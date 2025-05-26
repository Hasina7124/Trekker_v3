'use client';

import { ProgressBar } from '@/components/User/progress-bar';
import { StatusBadge } from '@/components/User/status-badge';
import type { Project } from '@/types';
import { ChevronRight } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <div
            className="group cursor-pointer rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-slate-600"
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div>
                    <StatusBadge status={project.status} />
                    <h3 className="mt-2 text-lg font-bold">{project.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">{project.description}</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 transition-colors group-hover:bg-[#60a5fa]">
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {project.devs.slice(0, 3).map((member, index) => (
                            <div
                                key={index}
                                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-700 text-xs"
                            >
                                {member.name.charAt(0)}
                            </div>
                        ))}
                        {project.devs.length > 3 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-700 text-xs">
                                +{project.devs.length - 3}
                            </div>
                        )}
                    </div>
                    <span className="text-slate-400">{project.devs.length} membres</span>
                </div>
                <div className="text-slate-400">
                    {project.end_date ? <span>Due {new Date(project.end_date).toLocaleDateString()}</span> : <span>No deadline</span>}
                </div>
            </div>
        </div>
    );
}
