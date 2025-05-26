'use client';

import { ProjectDashboard } from '@/components/User/project-dashboard';
import { ProjectDetail } from '@/components/User/project-detail';
import { ProjectEstimation } from '@/components/User/project-estimation';
import { ThemeProvider } from '@/components/User/theme-provider';
import { ProjectProvider } from '@/context/project-context';
import { useState } from 'react';

export default function Home() {
    const [selectedView, setSelectedView] = useState<string>('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    return (
        <ThemeProvider>
            <ProjectProvider>
                <main className="flex-1 overflow-auto p-6">
                    <ProjectDashboard />
                    {selectedView === 'project' && selectedProjectId && <ProjectDetail projectId={selectedProjectId} />}
                    {selectedView === 'estimation' && selectedProjectId && <ProjectEstimation projectId={selectedProjectId} />}
                </main>
            </ProjectProvider>
        </ThemeProvider>
    );
}
