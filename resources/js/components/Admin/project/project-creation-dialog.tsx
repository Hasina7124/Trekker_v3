"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
    ArrowLeft,
    ArrowRight,
    Award,
    CheckCircle2,
    Flag,
    Map,
    Scroll,
    Users,
    Trash2,
    CalendarIcon, Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useForm, usePage } from '@inertiajs/react';
import {User} from '@/types';
import useFeedback from '@/hooks/useFeedback';

interface ProjectCreationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Nouvelle interface pour typer les données du formulaire
type ProjectFormData = {
    title: string
    description: string
    manager_id: string
}

type InertiaPageProps = {
    flash?: {
        success?: string
        error?: string
    },
    errors?: {
        title?: string[]
        description?: string[]
        manager_id?: string[]
    }
}

export function ProjectCreationDialog({ open, onOpenChange }: ProjectCreationDialogProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Attends la valeurs de users
    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try{
            const res = await fetch('/admin/users?page=${page}');
            const data = await res.json();

            if(page === 1) {
                setUsers(data.data);
            } else {
                setUsers(prev => [...prev, ...data.data]);
            }

            setCurrentPage(data.current_page);
            setHasMore(data.current_page < data.last_page);
        } catch(error) {
            console.error("User load error : ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleLoadMore = () => {
        if(!loading && hasMore) {
            fetchUsers(currentPage + 1);
        }
    };

    const { props } = usePage<InertiaPageProps>();

    // Alerter l'utilisateur
    const successMessage = props.flash?.success ?? null;
    const errorMessage = props.flash?.error ?? null;

    useFeedback(successMessage, errorMessage);

    // Gestion des erreurs par étape
    const [clientErrors, setClientErrors] = useState<{ [key: string]: string }>({});

    // Initialisation du formulaire avec useForm
    const { data, setData, post, processing, errors } = useForm<ProjectFormData>({
        title: '',
        description: '',
        manager_id: '',
    });

    const [step, setStep] = useState(1);
    const totalSteps = 2;

    const nextStep = () => {
        const newErrors: { [key: string]: string } = {};

        if (step === 1) {
            if (data.title.trim().length < 7) {
                newErrors.title = "Le nom doit contenir au moins 7 caractères.";
            }
            if (!data.description.trim().match(/\w+[.!?]/)) {
                newErrors.description = "Veuillez entrer une description complète.";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors);
            return;
        }

        setClientErrors({});
        setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // Nouvelle fonction de soumission
    const handleSubmit = () => {
        const newErrors: { [key: string]: string } = {};

        if (step === 2) {
            if (!data.manager_id) {
                newErrors.manager_id = "Veuillez sélectionner un chef de projet.";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors);
            return;
        }

        // Envoi POST via Inertia
        post(route('project.store'), {
            onSuccess: () => {
                onOpenChange(false);
                setData({
                    title: '',
                    description: '',
                    manager_id: ''
                });
                setStep(1);
            },
            preserveScroll: true
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] bg-slate-800 border-slate-700 text-white p-0">
                <DialogHeader className="p-6 pb-2 border-b border-slate-700">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <Scroll className="h-5 w-5" />
                        </div>
                        Nouvelle Quête
                    </DialogTitle>
                </DialogHeader>

                {/* Barre de progression */}
                <div className="px-6 pt-4">
                    <div className="flex justify-between mb-2">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        i + 1 === step
                                            ? "bg-blue-500 text-white"
                                            : i + 1 < step
                                                ? "bg-green-500 text-white"
                                                : "bg-slate-700 text-slate-400"
                                    }`}
                                >
                                    {i + 1 < step ? <CheckCircle2 className="h-5 w-5" /> : <span>{i + 1}</span>}
                                </div>
                                <span className="text-xs mt-1 text-slate-400">
                                    {i === 0 && "Informations"}
                                    {i === 1 && "Chef de projet"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Contenu du formulaire par étapes */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <Scroll className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Informations de base</h2>
                                    <p className="text-sm text-slate-400">Définissez votre quête</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Nom de la quête</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ex: Projet Avalanche"
                                        className="bg-slate-900 border-slate-700"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                    {(clientErrors.title || errors.title) && (
                                        <p className="text-red-500 text-sm">{clientErrors.title || errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Décrivez votre projet en quelques lignes..."
                                        className="min-h-[120px] bg-slate-900 border-slate-700"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    {(clientErrors.description || errors.description) && (
                                        <p className="text-red-500 text-sm">{clientErrors.description || errors.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Chef de projet</h2>
                                    <p className="text-sm text-slate-400">Choisissez qui dirigera cette quête</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <RadioGroup value={data.manager_id || ""} onValueChange={(value) => setData('manager_id', value)}>
                                    {users.map((leader) => (
                                        <div
                                            key={leader.id}
                                            className={`flex items-center gap-4 p-4 rounded-lg border ${
                                                data.manager_id === String(leader.id)
                                                    ? "border-blue-500 bg-slate-900/50"
                                                    : "border-slate-700 bg-slate-900/30"
                                            } hover:bg-slate-900/70 transition-colors cursor-pointer`}
                                            onClick={() => setData('manager_id', String(leader.id))}
                                        >
                                            <RadioGroupItem value={String(leader.id)} id={`leader-${leader.id}`} className="sr-only" />
                                            <Avatar className="h-12 w-12 border-2 border-slate-700">
                                                <AvatarImage src={leader.avatar || "/placeholder.svg"} alt={leader.name} />
                                                <AvatarFallback className="bg-slate-700">
                                                    {leader.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">{leader.name}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Award className="h-4 w-4 text-amber-400" />
                                                    <p className="font-medium">{leader.experience}</p>
                                                </div>
                                            </div>
                                            <div
                                                className={`w-5 h-5 rounded-full ${
                                                    data.manager_id === String(leader.id)
                                                        ? "bg-blue-500 ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500"
                                                        : "bg-slate-700"
                                                }`}
                                            />
                                        </div>
                                    ))}
                                </RadioGroup>

                                {(clientErrors.manager_id || errors.manager_id) && (
                                    <p className="text-red-500 text-sm">{clientErrors.manager_id || errors.manager_id}</p>
                                )}

                                <Button variant="outline" className="w-full mt-2 border-dashed border-slate-700 text-slate-400">
                                    + Ajouter un nouveau chef de projet
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t border-slate-700 bg-slate-900">
                    <div className="flex justify-between w-full">
                        <Button variant="outline" onClick={prevStep} disabled={step === 1} className="border-slate-700">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                        </Button>

                        {step < totalSteps ? (
                            <Button onClick={nextStep}>
                                Suivant <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit} 
                                className="bg-green-500 hover:bg-green-600"
                                disabled={processing}
                            >
                                {processing ? 'Création en cours...' : 'Lancer la quête'} <Map className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
