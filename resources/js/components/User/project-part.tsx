import { ProgressBar } from '@/components/User/progress-bar';
import { ProjectModule } from '@/components/User/project-module';
import { useProjects } from '@/context/project-context';
import type { Part } from '@/types';
import { ChevronDown, ChevronUp, Lock, Plus } from 'lucide-react';
import { useState } from 'react';

// Définition des props attendues par le composant
interface ProjectPartProps {
    part: Part; // Partie du projet (ex: Phase 1, etc.)
    projectId: string; // ID du projet parent
    index: number; // Position de cette part dans la liste
    isLocked: boolean; // Indique si la part est verrouillée (non modifiable)
}

// Composant principal représentant une "Part" d'un projet
export function ProjectPart({ part, projectId, index, isLocked }: ProjectPartProps) {
    const { getProjectById, updateProject } = useProjects(); // Récupère les fonctions du contexte

    const [isExpanded, setIsExpanded] = useState(index === 0); // Part dépliée par défaut si index 0
    const [showAddModule, setShowAddModule] = useState(false); // Affiche le formulaire d'ajout
    const [newModuleName, setNewModuleName] = useState(''); // Valeur du champ d'entrée du module

    // Gère l'ajout d'un module dans la part courante
    const handleAddModule = () => {
        if (!newModuleName.trim()) return; // Ignore si le nom est vide

        const project = getProjectById(projectId); // Récupère le projet actuel
        if (!project || !project.parts) return; // Sécurité : évite erreurs null/undefined

        // Crée un nouvel objet module
        const newModule = {
            id: `module-${Date.now()}`, // ID généré via timestamp (non UUID)
            name: newModuleName,
            progress: 0, // Initialisé à 0%
            tasks: [], // Aucune tâche au départ
        };

        // Remplace les modules dans la bonne part
        const updatedParts = project.parts.map((m) => {
            if (m.id === part.id) {
                return {
                    ...m,
                    modules: [...(m.modules || []), newModule], // Ajout du nouveau module
                };
            }
            return m;
        });

        updateProject(projectId, { parts: updatedParts }); // Met à jour le projet dans le contexte

        setNewModuleName(''); // Réinitialise le champ
        setShowAddModule(false); // Cache le formulaire d'ajout
    };

    // Structure visuelle du composant
    return (
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
            {/* En-tête cliquable : affiche titre, progression, etc. */}
            <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => !isLocked && setIsExpanded(!isExpanded)} // Toggle expansion si déverrouillé
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 font-bold text-white">
                        {index + 1} {/* Affiche le numéro de la part */}
                    </div>
                    <div>
                        <h4 className="font-bold">{part.name}</h4> {/* Nom de la part */}
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span>{part.modules?.length || 0} modules</span> {/* Nb de modules */}
                            <span>•</span>
                            <span>{part.progress}% complete</span> {/* Progression */}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isLocked ? (
                        // Affiche une étiquette "Locked" si la part est verrouillée
                        <div className="flex items-center gap-1 rounded bg-slate-700 px-2 py-1 text-sm text-slate-400">
                            <Lock className="h-3 w-3" />
                            <span>Locked</span>
                        </div>
                    ) : (
                        <>
                            {/* Barre de progression visible */}
                            <ProgressBar value={part.progress} className="h-2 w-32" />
                            {/* Icône d'expansion/retrait */}
                            {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                        </>
                    )}
                </div>
            </div>

            {/* Corps de la part : liste des modules + bouton ajout */}
            {isExpanded && !isLocked && (
                <div className="border-t border-slate-700 p-4 pt-0">
                    <div className="space-y-4">
                        {/* Liste des modules */}
                        {part.modules && part.modules.length > 0 ? (
                            <div className="space-y-3">
                                {part.modules.map((module, moduleIndex) => (
                                    <ProjectModule
                                        key={module.id} // Clé unique (important pour React)
                                        module={module}
                                        projectId={projectId}
                                        partId={part.id}
                                        index={moduleIndex}
                                    />
                                ))}
                            </div>
                        ) : (
                            // Affiche un message si aucun module
                            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/50 py-6 text-center text-slate-400">
                                <p>No modules created yet.</p>
                                <p className="mt-1 text-sm">Create modules to organize your part tasks.</p>
                            </div>
                        )}

                        {/* Formulaire d'ajout d'un module */}
                        {showAddModule ? (
                            <div className="rounded-lg border border-slate-600 bg-slate-700 p-3">
                                <h4 className="mb-2 text-sm font-medium">New Module</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newModuleName}
                                        onChange={(e) => setNewModuleName(e.target.value)} // Mise à jour champ
                                        placeholder="Module name"
                                        className="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#60a5fa] focus:outline-none"
                                    />
                                    <button
                                        onClick={handleAddModule} // Bouton pour valider l'ajout
                                        className="rounded-md bg-[#60a5fa] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setShowAddModule(false)} // Annule et cache le champ
                                        className="rounded-md bg-slate-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Bouton pour afficher le champ d’ajout de module
                            <button
                                onClick={() => setShowAddModule(true)}
                                className="flex w-full items-center justify-center gap-1 rounded-md bg-slate-700 px-3 py-1.5 text-sm transition-colors hover:bg-slate-600"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Module</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
