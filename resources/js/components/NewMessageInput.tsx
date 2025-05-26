import React, { useEffect, useRef, useCallback } from 'react';

type NewMessageInputProps = {
    value: string;
    onChange: (data: string) => void;
    onSend: () => void;
};

export default function NewMessageInput({ value, onChange, onSend }: NewMessageInputProps) {
    const input = useRef<HTMLTextAreaElement>(null);

    // Fonction pour ajuster la hauteur automatiquement
    const adjustHeight = useCallback(() => {
        if (!input.current) return;
        input.current.style.height = "auto";
        input.current.style.height = `${input.current.scrollHeight}px`;
    }, []);

    // Envoi du message avec Entrée (sans Shift)
    const onInputKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            onSend();
        }
    };

    // Mise à jour de la valeur uniquement
    const onChangeEvent = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(ev.target.value);
        // Ne pas appeler adjustHeight ici pour éviter les re-rendus infinis
    };

    // Ajustement de la hauteur uniquement après les mises à jour
    useEffect(() => {
        adjustHeight();
    }, [value, adjustHeight]);

    return (
        <textarea
            ref={input}
            value={value}
            rows={1}
            placeholder="Type your message..."
            onKeyDown={onInputKeyDown}
            onChange={onChangeEvent}
            className="input input-bordered w-full rounded-r-none resize-none overflow-y-auto max-h-40"
        />
    );
}
