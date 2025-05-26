import ChatLayout from "@/layouts/chat/ChatLayout";
import { ReactNode, useEffect, useState, useRef, useCallback, createContext } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { Conversation, Message, MessageUser } from '@/types';
import ConverstionHeader from "@/components/ConversationHeader";
import MessageItem from "@/components/MessageItem";
import MessageInput from "@/components/MessageInput";
import { useEventBus } from '@/EventBus';

type homeProps = {
    messages: MessageUser;
    selectedConversation: Conversation;
};

// For the message
type MessageContextType = {
    messages: string[];
    addMessage: (message: string) => void;
    clearMessages: () => void;
};

const Home = ({ messages, selectedConversation }: homeProps) => {


    const { on, off } = useEventBus();
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const messagesCtrRef = useRef<HTMLDivElement>(null);

    const messageCreated = useCallback((message: Message) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id === message.group_id
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id === message.sender_id || selectedConversation.id === message.receiver_id)
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
    }, [selectedConversation]);


    useEffect(() => {
        on('message.created', messageCreated);
        return () => {
            off('message.created', messageCreated);
        };
    }, [messageCreated]);


    useEffect(() => {
        if (messages?.data) {
            setLocalMessages([...messages.data].reverse());
        } else {
            setLocalMessages([]);
        }
    }, [messages]);

    useEffect(() => {
        if (messagesCtrRef.current) {
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
        }
    }, [localMessages]);

    return (
        <>
            {!messages && (
                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className="text-2xl md:text-4xl p-16 text-slate-200">
                        Please select conversation to see messages
                    </div>
                    <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block" />
                </div>
            )}
            {messages && (
                <div className="flex flex-col h-full">
                    <ConverstionHeader selectedConversation={selectedConversation} />

                    <div className="flex-1 overflow-y-auto p-5" ref={messagesCtrRef}>
                        {localMessages.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-200">No message found</div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {localMessages.map((message) => (
                                    <MessageItem key={message.id} message={message} />
                                ))}
                            </div>
                        )}
                    </div>

                    <MessageInput conversation={selectedConversation} />
                </div>
            )}
        </>
    );
};

Home.layout = (page: ReactNode) => <ChatLayout>{page}</ChatLayout>;

export default Home;
