import { usePage} from '@inertiajs/react';
import ReactMarkdown from "react-markdown";
import React from 'react';
import UserAvatar from '@/components/ui/UserAvatar';
import {formatMessageDateLong} from "@/helpers";
import { User, Message } from '@/types';
import { PageProps } from '@inertiajs/core';

type MessageItemProp = {
    message : Message;
}

interface CustomPageProps extends PageProps{
    auth: {
        user: User;
    };
}

const MessageItem = ({message}: MessageItemProp) => {
    const currentUser: User = usePage<CustomPageProps>().props.auth.user;
    // console.log("sender id", message.sender_id);
    // console.log("sender", message.sender);
    return (
        <div className={
            'chat ' +
            (message.sender_id === currentUser.id
                    ? "chat-end"
                    : "chat-start"
            )
        }>
            <div className="chat-image avatar">
                <div className="rounded-full">
                    {<UserAvatar user={message.sender} />}
                </div>
            </div>

            <div className="chat-header">
                {message.sender_id !== currentUser.id
                    ? message.sender.name
                    : ""
                }
                <time className={"text-xs opacity-50"}>
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>

            <div className={
                "chat-bubble relative" + (
                    message.sender_id === currentUser.id
                        ? "chat-bubble-info"
                        : ""
                )
            }>
                <div className="chat-message">
                    <div className="chat-message-content">
                        <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>);
};

export default MessageItem;
