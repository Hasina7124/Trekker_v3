"use client"

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { PlusCircle, MinusCircle, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import AppLayout from '@/layouts/app-layout';
import { useForm, usePage } from '@inertiajs/react';
import {Wallet as WalletType} from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import Echo from '@/echo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Typer l'event
interface BalanceUpdatedEvent {
    wallet: WalletType;
}

export type TransactionRequest = {
    amount: number | '';
};

interface IndexProps extends InertiaPageProps{
    wallet: WalletType;
    errors?: Partial<Record<keyof TransactionRequest, string>>;
    flash?: {
        success?: string;
        error?: string;
    };
}


const Index: React.FC<IndexProps> = () => {
    const { props } = usePage<IndexProps>();
    const { wallet, errors, flash } = props;
// State pour la balance
    const [balance, setBalance] = useState(wallet.balance);
    const { data, setData, post, processing, reset, recentlySuccessful } = useForm<TransactionRequest>(
        {
            amount: 0,
        }
    );

    // Retour conter client
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Récupère le bouton qui a déclenché la soumission
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
        const action = submitter?.value; // "deposit" ou "withdraw"

        if (action === "deposit") {
            post(`/wallet/deposit`, {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        } else if (action === "withdraw") {
            post(`/wallet/withdraw`, {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Si vide, on remet à 0 (car amount est number, pas string)
        setData('amount', val === '' ? '' : Number(val));
    };

    useEffect(() => {
        // S'abonne au channel privé du wallet
        const channel = `wallet.${wallet.id}`;

        // Écoute l'événement de mise à jour
        Echo.private(channel)
            .listen('.balance.updated', (event : BalanceUpdatedEvent) => {
            // Met à jour le state avec la nouvelle valeur
            setBalance(event.wallet.balance);

            // Notification optionnelle
            console.log('Balance updated:', event.wallet.balance);
        });

        // Nettoyage à la destruction du composant
        return () => {
            Echo.leave(`wallet.${wallet.id}`);
        };
    }, [wallet.id]); // Dépendance pour éviter les réabonnements

    return (
        <AppLayout>
            <div className="space-y-4">
                {flash?.success && (
                    <Alert variant="default" className={"bg-green-400"}>
                        <AlertTitle>Succès</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert variant="destructive" className={"bg-red-400"}>
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}
            </div>
            <form onSubmit={handleSubmit}>
                <Card className="mx-auto w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                            <Wallet className="h-6 w-6" />
                            Mon Portefeuille
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg bg-slate-100 p-4 text-center">
                            <p className="mb-1 text-sm text-slate-500">Solde actuel</p>
                            <p className="text-3xl font-bold">{wallet.balance}</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="amount" className="text-sm font-medium">
                                Montant
                            </label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Entrez un montant"
                                value={data.amount}
                                onChange={ handleChange }
                                className="w-full"
                            />
                            {errors.amount && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.amount}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" value="deposit">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {processing ? 'Traitement...' : 'Déposer'}
                        </Button>
                        <Button
                            type="submit"
                            // onClick={handleSubmit}
                            className="flex-1 bg-rose-600 hover:bg-rose-700"
                            disabled={
                                (data.amount !== "" && data.amount > balance)
                            }
                            value="withdraw"
                        >
                            <MinusCircle className="mr-2 h-4 w-4" />
                            Retirer
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </AppLayout>
    );
};
export default Index;
