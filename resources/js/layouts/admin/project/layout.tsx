import { TrekkerSidebar } from '@/components/Admin/project/trekker-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';
import type React from 'react';

export const metadata = {
    title: 'Trekker - Administration',
    description: 'Plateforme de gestion de projets gamifiée',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppLayout>
                <SidebarProvider>
                    <div className="flex min-h-[calc(100vh-64px)]">
                        <main className="flex-1">{children}</main>
                    </div>
                </SidebarProvider>
            </AppLayout>
        </>
    );
}
