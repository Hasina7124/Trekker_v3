import React, { useState } from "react";
import axios from "axios";
import { Conversation } from '@/types';
import {
    PaperClipIcon,
    PhotoIcon,
    FaceSmileIcon,
    HandThumbUpIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/solid';
import NewMessageInput from './NewMessageInput';
import { useEventBus } from '@/EventBus';

type MessageInputProps = {
    conversation: Conversation | null;
};

const MessageInput = ({ conversation }: MessageInputProps) => {
    const {emit} = useEventBus();

    // État du message en cours de saisie
    const [newMessage, setNewMessage] = useState("");
    // Message d’erreur à afficher sous le champ d’input
    const [inputErrorMessage, setInputErrorMessage] = useState("");
    // Booléen de contrôle pendant l’envoi du message
    const [messageSending, setMessageSending] = useState(false);

    // Empêche les mises à jour inutiles qui peuvent provoquer une boucle
    const handleNewMessageChange = (val: string) => {
        setNewMessage((prev) => (prev !== val ? val : prev));
    };

    // Envoie du message
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Bloc de validation côté client
        if (newMessage.trim() === "") {
            setInputErrorMessage("Please enter a message");
            setTimeout(() => setInputErrorMessage(""), 3000);
            return;
        }

        if (!conversation?.id) {
            setInputErrorMessage("Please select a conversation");
            setTimeout(() => setInputErrorMessage(""), 3000);
            return;
        }

        // Préparation des données à envoyer
        const formData = new FormData();
        formData.append("message", newMessage);

        // Ajout du destinataire selon le type de conversation
        if (conversation.is_user) {
            formData.append("receiver_id", String(conversation.id));
        } else if (conversation.is_group) {
            formData.append("group_id", String(conversation.id));
        }

        try {
            setMessageSending(true);

            // Envoi de la requête au backend Laravel
            await axios.post<{ message?: string }>(route("chat.store"), formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
                        : 0;
                    console.log("Upload progress:", progress);
                }
            });
            emit('message.created', newMessage);

            // Réinitialisation de l’input après succès
            setNewMessage("");
        } catch (error: unknown) {
            // Gestion des erreurs selon leur type
            let errorMessage = "Failed to send message";

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error("Error:", error);
            setInputErrorMessage(errorMessage);
        } finally {
            setMessageSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-start border-t border-slate-700 py-3">
            {/* Boutons d’action : fichiers et images */}
            <div className="xs:flex-none xs:order-1 order-2 flex-1 p-2">
                <button type="button" className="relative p-1 text-gray-400 hover:text-gray-300">
                    <PaperClipIcon className="w-6" />
                    <input
                        type="file"
                        multiple
                        className="absolute inset-0 z-20 cursor-pointer opacity-0"
                    />
                </button>
                <button type="button" className="relative p-1 text-gray-400 hover:text-gray-300">
                    <PhotoIcon className="w-6" />
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 z-20 cursor-pointer opacity-0"
                    />
                </button>
            </div>

            {/* Zone de saisie et bouton d’envoi */}
            <div className="flex flex-1 items-center">
                <NewMessageInput
                    value={newMessage}
                    onChange={handleNewMessageChange}
                    onSend={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                />
                <button
                    type="submit"
                    className="btn btn-info rounded-l-none"
                    disabled={messageSending}
                >
                    {messageSending ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <>
                            <PaperAirplaneIcon className="w-6" />
                            <span className="hidden sm:inline">Send</span>
                        </>
                    )}
                </button>
            </div>

            {/* Boutons bonus : émojis et like */}
            <div className="xs:order-3 order-3 flex p-2">
                <button type="button" className="p-1 text-gray-400 hover:text-gray-300">
                    <FaceSmileIcon className="h-6 w-6" />
                </button>
                <button type="button" className="p-1 text-gray-400 hover:text-gray-300">
                    <HandThumbUpIcon className="h-6 w-6" />
                </button>
            </div>

            {/* Message d’erreur sous le formulaire */}
            {inputErrorMessage && (
                <div className="w-full px-3 text-red-400 text-sm pt-2">
                    {inputErrorMessage}
                </div>
            )}
        </form>
    );
};

export default MessageInput;
