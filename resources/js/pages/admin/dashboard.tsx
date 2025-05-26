import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Acceuil',
        href: '/dashboard',
    },
];

const Dashboard = () => {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1>Administrateur</h1>
            </div>
        </>
    );
}

Dashboard.layout = (page : React.ReactNode) => <AppLayout children={page} breadcrumbs={breadcrumbs} />

export default Dashboard;
