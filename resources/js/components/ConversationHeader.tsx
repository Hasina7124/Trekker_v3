import {Link } from '@inertiajs/react';
import { ArrowLeftIcon} from '@heroicons/react/24/solid';
import UserAvatar from '@/components/ui/UserAvatar';
import GroupAvatar from '@/components/ui/GroupAvatar';
import { Conversation } from '@/types';

type conversationHeaderProps = {
    selectedConversation : Conversation;
}

const ConversationHeader = ({selectedConversation } : conversationHeaderProps) => {
    return (
        <>
            {selectedConversation && (
                <div className="p-3 flex justify-between items-center border-b border-slate-700">
                    <div>
                        <Link
                            href={route("chat.store")}
                            className="inline-block sm:hidden"
                        >
                            <ArrowLeftIcon className="w-6" />
                        </Link>
                        {selectedConversation.is_user && (
                            <UserAvatar user={selectedConversation.user}/>
                        )}
                        {selectedConversation.is_group && <GroupAvatar />}
                    </div>

                    <div className="">
                        <h3>{selectedConversation.name}</h3>
                        {selectedConversation.is_group && (
                            <p className="text-xs text-gray-500">
                                {selectedConversation.users.length} members
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default ConversationHeader;
