import { usePage, Link } from '@inertiajs/react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Compass, FileText, Home, LogOut, Map, Settings, Trophy } from "lucide-react";

export function TrekkerSidebar() {
    const pathname = usePage().url;

    const isActive = (route: string) => pathname.split('?')[0] === route;

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-slate-700 absolute">
            <SidebarHeader className="flex items-center">
                <SidebarTrigger />
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/public")} tooltip="Tableau de bord">
                                    <Link href="/public">
                                        <Home className="h-5 w-5" />
                                        <span>Tableau de bord</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/projets")} tooltip="Projets">
                                    <Link href="/projets">
                                        <Map className="h-5 w-5" />
                                        <span>Projets</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Statuts</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.includes("status=pending")} tooltip="En attente">
                                    <Link href="/projets?status=pending">
                                        <Compass className="h-5 w-5 text-blue-400" />
                                        <span>En attente</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.includes("status=active")} tooltip="En cours">
                                    <Link href="/projets?status=active">
                                        <Map className="h-5 w-5 text-green-400" />
                                        <span>En cours</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.includes("status=completed")} tooltip="Terminés">
                                    <Link href="/projets?status=completed">
                                        <Trophy className="h-5 w-5 text-amber-400" />
                                        <span>Terminés</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.includes("status=rejected")} tooltip="Rejetés">
                                    <Link href="/projets?status=rejected">
                                        <FileText className="h-5 w-5 text-red-400" />
                                        <span>Rejetés</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
