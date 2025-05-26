import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useEventBus } from '@/EventBus';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, Conversation, type NavItem, type SharedData, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChartArea, FolderOpenDot, LucideBellRing, Menu, MessageSquareMore, Users, WalletMinimal } from 'lucide-react';
import { useEffect, useState } from 'react';
import Echo from '../echo';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

interface PageProps {
    auth: {
        user: User;
        conversations: Conversation[]; // Modifié pour refléter la structure réelle
    };
}

interface SocketMessage {
    message: {
        id: string;
        content: string;
        sender_id: string;
        sender: {
            id: string;
            name: string;
        };
        group_id?: string;
        attachments?: Array<{
            id: string;
            url: string;
        }>;
    };
}

interface NotificationPayload {
    user: {
        id: string;
        name: string;
    };
    group_id?: string;
    message: string;
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = usePage<{ auth: PageProps['auth'] }>().props;
    const conversations = auth.conversations || ([] as Conversation[]);
    const getInitials = useInitials();
    const user = page.props.auth.user;

    const { emit } = useEventBus();

    const [state, setState] = useState(false);

    // Gestion des canaux Echo pour les messages en temps réel
    useEffect(() => {
        conversations.forEach((conversation) => {
            // Détermine le canal en fonction du type de conversation (groupe ou utilisateur)
            let channel = `message.group.${conversation.id}`;

            if (conversation?.is_user) {
                const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
                const conversationId = typeof conversation.id === 'string' ? parseInt(conversation.id) : conversation.id;

                channel = `message.user.${[userId, conversationId].sort((a, b) => a - b).join('-')}`;
            }

            // Abonnement au canal et écoute des événements
            Echo.private(channel).error((error: unknown) => {
                console.error(error);
            });
        });

        // Nettoyage: désabonnement des canaux lors du démontage du composant
        return () => {
            conversations.forEach((conversation) => {
                let channel = `message.group.${conversation.id}`;

                if (conversation.is_user) {
                    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
                    const conversationId = typeof conversation.id === 'string' ? parseInt(conversation.id) : conversation.id;

                    channel = `message.user.${[userId, conversationId].sort((a, b) => a - b).join('-')}`;
                }
                Echo.leave(channel);
            });
        };
    }, [conversations, user.id, emit]);

    // Configuration de la navigation en fonction du rôle utilisateur
    const isAdmin = auth.user.role === 'admin';

    const mainNavItems: NavItem[] = isAdmin
        ? [
              {
                  title: 'Dashboard',
                  href: '/admin/dashboard',
                  icon: ChartArea,
              },
              {
                  title: 'Projects',
                  href: '/admin/project',
                  icon: FolderOpenDot,
              },
              {
                  title: 'Users',
                  href: '/admin/user',
                  icon: Users,
              },
              {
                  title: 'Wallet',
                  href: '/wallet',
                  icon: WalletMinimal,
              },
          ]
        : [
              {
                  title: 'Dashboard',
                  href: '/user/dashboard',
                  icon: ChartArea,
              },
              {
                  title: 'Projects',
                  href: '/manager/project',
                  icon: FolderOpenDot,
              },
              {
                  title: 'Wallet',
                  href: '/wallet',
                  icon: WalletMinimal,
              },
          ];

    const rightNavItems: NavItem[] = [
        {
            title: 'Chat',
            href: '/chat',
            icon: MessageSquareMore,
        },
        {
            title: '',
            href: '#',
            icon: LucideBellRing,
        },
    ];

    return (
        <>
            <div className="border-sidebar-border/80 relative border-b">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Menu mobile */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo */}
                    <Link href="/admin/dashboard" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Navigation desktop */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                page.url === item.href && activeItemStyles,
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                            {item.title}
                                        </Link>
                                        {page.url === item.href && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Navigation droite (icônes) */}
                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider key={item.title} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        navigationMenuTriggerStyle(),
                                                        page.url === item.href && activeItemStyles,
                                                        'h-9 cursor-pointer px-3',
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>

                        {/* Menu utilisateur */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Fil d'Ariane */}
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
