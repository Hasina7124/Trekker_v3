// import React, { useState, useEffect, useRef } from 'react';
// import { PencilSquareIcon } from '@heroicons/react/16/solid';
// import { Input } from '@/components/ui/input';
// import ConversationItem from '@/components/ConversationItem.js';
// import Echo from '../../echo';
// import { usePage } from '@inertiajs/react';
// import { User, Users, Conversation, Message } from "@/types";
// import AppLayout from '@/layouts/app-layout';
//
// type ChatLayoutProps = {
//     children: React.ReactNode;
// }
//
// interface PageProps {
//     auth: {
//         user: User;
//         conversations: Conversation[];
//     };
//     selectedConversation?: Conversation | null;
//     messages?: Message[];
//     [key: string]: unknown; // Signature d'index principale
// }
//
//
// const ChatLayout = ({ children }: ChatLayoutProps) => {
//     const scrollContainerRef = useRef<HTMLDivElement>(null);
//     const [onlineUsers, setOnlineUsers] = useState<Record<number, User>>({});
//
//     // Chat variable
//     const page = usePage<PageProps>();
//     const  selectedConversation  = page.props.selectedConversation;
//     const  conversations  = page.props.auth.conversations;
//     const [localConversations, setLocalConversations] = useState<Conversation[]>(conversations || []);
//
//     const isUserOnline = (userId: number) => onlineUsers[userId];
//
//     const onSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
//         const search = ev.target.value.toLowerCase();
//         const filtered = conversations.filter((conversation) =>
//             conversation.name.toLowerCase().includes(search) ||
//             (conversation.is_user && conversation.email.toLowerCase().includes(search))
//         );
//         setLocalConversations(filtered);
//     };
//
//     useEffect(() => {
//         setLocalConversations(conversations);
//     }, [conversations]);
//
//     useEffect(() => {
//         Echo.join('Online')
//             .here((users: Users) => {
//                 const onlineUserObj = Object.fromEntries(
//                     users.map((user) => [user.id, user])
//                 );
//                 setOnlineUsers((prevOnlineUsers) => {
//                     return { ...prevOnlineUsers, ...onlineUserObj };
//                 });
//             })
//             .joining((user: User) => {
//                 setOnlineUsers((prevOnlineUsers) => {
//                     const updatedUsers = { ...prevOnlineUsers };
//                     updatedUsers[user.id] = user;
//                     return updatedUsers;
//                 });
//             })
//             .leaving((user: User) => {
//                 setOnlineUsers((prevOnlineUsers) => {
//                     const updated = { ...prevOnlineUsers };
//                     delete updated[user.id];
//                     return updated;
//                 });
//             })
//             .error((error: unknown) => {
//                 console.error('Echo error:', error);
//             });
//
//         return () => {
//             Echo.leave('Online');
//         };
//     }, []);
//
//     return (
//         <AppLayout>
//             <div className="flex-1 w-full flex overflow-hidden">
//                 <div
//                     className={`transition-all w-full sm:w-[260px] md:w-[340px] flex flex-col overflow-hidden shadow-lg ${
//                         selectedConversation ? '-ml-[100%]' : ''
//                     }`}
//                 >
//                     <div className="flex items-center justify-between py-2 px-3 text-xl font-medium">
//                         My conversations
//                         <div className="tooltip tooltip-left" data-tip="Create new Group">
//                             <button className="text-gray-400 hover:text-gray-200">
//                                 <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
//                             </button>
//                         </div>
//                     </div>
//                     <div className="p-3">
//                         <Input
//                             onChange={onSearch}
//                             placeholder="Filter users and groups"
//                             className="data-disabled:bg-gray-100 w-full"
//                         />
//                     </div>
//                     <div className="flex-1 overflow-auto">
//                         {localConversations.map((conversation) => (
//                             <ConversationItem
//                                 key={`${conversation.is_group ? 'group_' : 'user_'}${conversation.id}`}
//                                 conversation={conversation}
//                                 online={!!isUserOnline(conversation.id)}
//                                 selectedConversation={selectedConversation}
//                             />
//                         ))}
//                     </div>
//                 </div>
//                 <div className="flex-1 flex flex-col overflow-hidden">
//                     {children}
//                 </div>
//             </div>
//         </AppLayout>
//     );
// };
//
// export default ChatLayout;


import React, { useState, useEffect } from 'react';
import { PencilSquareIcon } from '@heroicons/react/16/solid';
import { Input } from '@/components/ui/input';
import ConversationItem from '@/components/ConversationItem.js';
import Echo from '../../echo';
import { usePage } from '@inertiajs/react';
import {User, Users, Conversation, Message} from "@/types";
import AppLayout from '@/layouts/app-layout';
import { log } from 'console';
import { useEventBus } from '@/EventBus';
import echo from '../../echo';

type ChatLayoutProps = {
    children: React.ReactNode;
}

interface PageProps {
    auth: {
        user: User;
        conversations: Conversation[];
    };
    selectedConversation?: Conversation | null;
    messages?: Message[];
    [key: string]: unknown; // Signature d'index principale
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
    const [localMessages, setLocalMessages] = useState<Message[]>([]);


    const page = usePage<PageProps>();

    const user = page.props.auth.user;

    console.log(user);
    const conversations = page.props.auth.conversations as Conversation[];
    const selectedConversations = page.props.selectedConversations as Conversation | null;

    // État local pour stocker les conversations affichées (filtrées ou triées)
    const [localConversations, setLocalConversations] = useState<Conversation[]>(conversations || []);

    // État pour suivre les utilisateurs en ligne
    const [onlineUsers, setOnlineUsers] = useState<Record<number, User>>({});

    // Vérifie si un utilisateur est en ligne via son ID
    const isUserOnline = (userId: number) => onlineUsers[userId];

    const {emit} = useEventBus();

    // Recherche dans les conversations par nom ou email
    const onSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const search = ev.target.value.toLowerCase();
        const filtered = conversations.filter((conversation) =>
            conversation.name.toLowerCase().includes(search) ||
            (conversation.is_user && conversation.email.toLowerCase().includes(search))
        );
        setLocalConversations(filtered);
    };

    useEffect(() => {
        conversations.forEach((conversation) => {
            let channel = `message.group.${conversation.id}`;
            if (conversation.is_user) {
                channel = `message.user.${
                    [Number(user.id), Number(conversation.id)]
                        .sort((a, b) => a - b)
                        .join("-")
                }`;
            }

            Echo.private(channel)
                .error((error: Error) => {
                    console.error('WebSocket Error:', error);
                })
                .listen("SocketMessage", (e: { message: Message }) => {
                    console.log("SocketMessage event:", e);
                    const message = e.message;

                    // Si la conversation avec l'expéditeur n'est pas sélectionnée
                    // alors afficher une notification

                    console.log('eeeeeeeemittt', message);
                    emit("message.created", message);
                    if (message.sender_id === user.id) {
                        return;
                    }
                });
        });
    }, [conversations, user.id]);

    // Met à jour l'état local lorsque les conversations changent
    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        console.log("localConversations mis à jour :", localConversations);
    }, [localConversations]);

    useEffect(() => {
        Echo.join('Online') // Canal Laravel Echo
            .here((users : Users) => {
                // Mapping des utilisateurs présents au moment de la connexion
                const onlineUserObj = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );
                setOnlineUsers((prevOnlineUsers)=>{
                    return {...prevOnlineUsers, ...onlineUserObj};
                });
            })
            .joining((user : User) => {
                // Quand un utilisateur se connecte
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers};
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                });
            })
            .leaving((user : User) => {
                // Quand un utilisateur se déconnecte
                setOnlineUsers((prevOnlineUsers) => {
                    const updated = { ...prevOnlineUsers };
                    delete updated[user.id];
                    return updated;
                });
            })
            .error((error : unknown) => {
                console.error('Echo error:', error);
            });

        // Nettoyage du canal à la destruction du composant
        return () => {
            Echo.leave('Online'); // ⚠️ correction : 'Online' avec majuscule
        };
    }, []);

    return (
        <AppLayout>
            <div className="flex-1 w-full flex overflow-hidden">
                <div
                    className={`transition-all w-full sm:w-[260px] md:w-[340px] flex flex-col overflow-hidden shadow-lg ${
                        selectedConversations ? '-ml-[100%]' : ''
                    }`}
                >
                    <div className="flex items-center justify-between py-2 px-3 text-xl font-medium">
                        My conversations
                        <div className="tooltip tooltip-left" data-tip="Create new Group">
                            <button className="text-gray-400 hover:text-gray-200">
                                <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
                            </button>
                        </div>
                    </div>
                    <div className="p-3">
                        <Input
                            onChange={onSearch}
                            placeholder="Filter users and groups"
                            className="data-disabled:bg-gray-100 w-full"
                        />
                    </div>
                    <div className="flex-1 overflow-auto">
                        {localConversations.map((conversation) => (
                            <ConversationItem
                                key={`${conversation.is_group ? 'group_' : 'user_'}${conversation.id}`}
                                conversation={conversation}
                                online={!!isUserOnline(conversation.id)}
                                selectedConversation={selectedConversations}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </AppLayout>
    );
};

export default ChatLayout;
