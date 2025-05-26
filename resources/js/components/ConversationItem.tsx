import { Link, usePage } from '@inertiajs/react';
import UserAvatar from './ui/UserAvatar';
import GroupAvatar from './ui/GroupAvatar';
import UserOptionsDropdown from './UserOptionsDropdown';
import { User, Conversation } from '@/types';
import { useRef } from 'react';

interface PageProps {
    auth: {
        user: User;
        conversations: Conversation[]; // Modifié pour refléter la structure réelle
    };
}

interface ConversationItemProps {
    conversation: Conversation;
    selectedConversation?: Conversation | null; // Rendre optionnel
    online?: boolean | null;
}

const ConversationItem = ({
                              conversation,
                              selectedConversation = null,
                              online = null,
                          }: ConversationItemProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { auth } = usePage<{ auth: PageProps["auth"] }>().props;

    const currentUser = auth.user;

    // Vérification de sécurité
    if (!conversation) return null;

    let userOptions = null;
    if (currentUser?.is_admin && conversation.is_user) {
        userOptions = <UserOptionsDropdown conversation={conversation} />;
    }

    let classes = 'border-transparent';

    if (selectedConversation) {
        const sameId = selectedConversation.id === conversation.id;
        const sameType = selectedConversation.is_group === conversation.is_group;
        if (sameId && sameType) {
            classes = 'border-blue-500 bg-black/20';
        }
    }
            classes = 'border-blue-500 bg-black/20';

    // Protection contre les valeurs null/undefined
    const lastMessageDate = conversation.last_message_date
        ? new Date(conversation.last_message_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <Link
            href={
                conversation.is_group
                    ? route('chat.group', conversation.id)
                    : route('chat.user', conversation.id)
            }
            preserveScroll={true} // Modifié de preserveState à preserveScroll
            className={
                `conversation-item flex items-center gap-2 p-2 text-black transition-all cursor-pointer border-l-4 hover:bg-gray-200 ${
                    classes
                } ${
                    conversation.is_user && currentUser?.is_admin ? 'pr-2' : 'pr-4'
                }`
            }
            key={conversation.id} // Ajout d'une clé unique
        >
            {conversation.is_user && (
                <UserAvatar
                    online={online}
                    user={conversation.user || {}} // Protection contre user null
                />
            )}
            {conversation.is_group && <GroupAvatar />}

            <div className={`flex-1 text-xs max-w-full overflow-hidden ${
                conversation.is_user && conversation.blocked_at ? 'opacity-50' : ''
            }`}>
                <div className="flex gap-1 justify-between items-center">
                    <h3 className="text-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                        {conversation.name || 'Unnamed'}
                    </h3>
                    {lastMessageDate && (
                        <span className="whitespace-nowrap text-black/30">
                            {lastMessageDate}
                        </span>
                    )}
                </div>

                {conversation.last_message && (
                    <p className="text-xs whitespace-nowrap overflow-hidden text-ellipsis text-black/75">
                        {conversation.last_message}
                    </p>
                )}
            </div>
            {userOptions}
        </Link>
    );
};

export default ConversationItem;
