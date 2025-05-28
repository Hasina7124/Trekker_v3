<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectProposal;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ApiAdminProjectController extends Controller
{
    /**
     * Liste des projets avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        Carbon::setLocale('fr');
        
        $query = Project::query();

        if($request->has('status') && $request->status !== 'all'){
            $query->where('status', $request->status);
        }

        if($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search){
                $q->where('title', 'ILIKE', "%$search%")
                ->orWhere('description', 'ILIKE', "%$search%");
            });
        }

        $projects = $query->latest()->paginate(9)->through(function ($project) {
            return [
                ...$project->toArray(),
                'start_date' => $project->start_date ? Carbon::parse($project->start_date)->format('d/m/Y') : null,
                'end_date' => $project->end_date ? Carbon::parse($project->end_date)->format('d/m/Y') : null,
                'created_at' => Carbon::parse($project->created_at)->format('d/m/Y H:i'),
                'updated_at' => Carbon::parse($project->updated_at)->format('d/m/Y H:i'),
            ];
        });

        $status = Project::select('status')->distinct()->pluck('status');

        return response()->json([
            'projects' => $projects,
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
            'status' => $status,
        ]);
    }

    /**
     * Créer un nouveau projet
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'manager_id' => 'required|exists:users,id',
        ]);

        $project = Project::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'admin_id' => auth()->id(),
            'manager_id' => $validated['manager_id'],
        ]);

        return response()->json([
            'message' => 'Projet créé avec succès',
            'project' => $project
        ], 201);
    }

    /**
     * Mettre à jour un projet
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|min:5',
            'description' => 'required|string|min:15',
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Projet mis à jour avec succès',
            'project' => $project
        ]);
    }

    /**
     * Supprimer un projet
     */
    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json([
            'message' => 'Projet supprimé avec succès'
        ]);
    }

    /**
     * Récupérer les propositions acceptées pour un projet
     */
    public function getAcceptedProposals(Project $project): JsonResponse
    {
        $acceptedProposals = [
            'goals' => $project->proposals()
                ->where('type', 'goal')
                ->where('status', 'accepted')
                ->get(),
            'startDates' => $project->proposals()
                ->where('type', 'start_date')
                ->where('status', 'accepted')
                ->get(),
            'endDates' => $project->proposals()
                ->where('type', 'end_date')
                ->where('status', 'accepted')
                ->get(),
            'budgets' => $project->proposals()
                ->where('type', 'budget')
                ->where('status', 'accepted')
                ->get(),
        ];

        return response()->json($acceptedProposals);
    }

    /**
     * Récupérer les propositions par type
     */
    public function getProposalsByType(Project $project, string $type = null): JsonResponse
    {
        \Log::info('Récupération des propositions', [
            'project_id' => $project->id,
            'type' => $type
        ]);
        
        $query = $project->proposals();
        
        if ($type) {
            if ($type === 'time') {
                $query->whereIn('type', ['start_date', 'end_date']);
            } else {
                $query->where('type', $type);
            }
        }

        $proposals = $query->get();
        
        \Log::info('Propositions trouvées', [
            'count' => $proposals->count(),
            'proposals' => $proposals->toArray()
        ]);

        return response()->json([
            'data' => $proposals,
            'meta' => [
                'total' => $proposals->count(),
                'project_id' => $project->id
            ]
        ]);
    }

    /**
     * Ajouter une nouvelle proposition
     */
    public function addProposal(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:goal,start_date,end_date,budget',
            'value' => 'required|string'
        ]);

        $proposal = $project->proposals()->create([
            'type' => $validated['type'],
            'value' => $validated['value'],
            'status' => 'pending',
            'proposer_id' => auth()->id()
        ]);

        return response()->json([
            'data' => $proposal,
            'message' => 'Proposition ajoutée avec succès'
        ], 201);
    }

    /**
     * Mettre à jour le statut d'une proposition
     */
    public function updateProposalStatus(Request $request, ProjectProposal $proposal): JsonResponse
    {
        try {
            \Log::info('Mise à jour du statut de la proposition', [
                'proposal_id' => $proposal->id,
                'status' => $request->status
            ]);

            // Vérifier que l'utilisateur ne valide pas sa propre proposition
            if ($proposal->proposer_id === auth()->id()) {
                return response()->json([
                    'message' => 'Vous ne pouvez pas valider/refuser votre propre proposition'
                ], 403);
            }

            $validated = $request->validate([
                'status' => 'required|in:accepted,rejected,pending'
            ]);

            $proposal->update([
                'status' => $validated['status'],
                'validator_id' => auth()->id(),
                'validated_at' => $validated['status'] !== 'pending' ? now() : null
            ]);

            return response()->json([
                'data' => $proposal,
                'message' => 'Statut de la proposition mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la mise à jour du statut', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une proposition
     */
    public function deleteProposal(ProjectProposal $proposal): JsonResponse
    {
        try {
            \Log::info('Suppression de la proposition', [
                'proposal_id' => $proposal->id
            ]);

            // Vérifier que l'utilisateur est le créateur de la proposition
            if ($proposal->proposer_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Seul le créateur de la proposition peut la supprimer'
                ], 403);
            }

            $proposal->delete();

            return response()->json([
                'message' => 'Proposition supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la suppression', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier une proposition
     */
    public function editProposal(Request $request, ProjectProposal $proposal): JsonResponse
    {
        try {
            \Log::info('Modification de la proposition', [
                'proposal_id' => $proposal->id,
                'value' => $request->value
            ]);

            // Vérifier que l'utilisateur est le créateur de la proposition
            if ($proposal->proposer_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Seul le créateur de la proposition peut la modifier'
                ], 403);
            }

            $validated = $request->validate([
                'value' => 'required|string'
            ]);

            $proposal->update([
                'value' => $validated['value'],
                'status' => 'pending' // Réinitialiser le statut car la valeur a changé
            ]);

            return response()->json([
                'data' => $proposal,
                'message' => 'Proposition modifiée avec succès'
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la modification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activer un projet
     */
    public function activateProject(Project $project): JsonResponse
    {
        // Vérifier si toutes les propositions nécessaires sont acceptées
        $hasAcceptedGoal = $project->proposals()->where('type', 'goal')->where('status', 'accepted')->exists();
        $hasAcceptedStartDate = $project->proposals()->where('type', 'start_date')->where('status', 'accepted')->exists();
        $hasAcceptedEndDate = $project->proposals()->where('type', 'end_date')->where('status', 'accepted')->exists();
        $hasAcceptedBudget = $project->proposals()->where('type', 'budget')->where('status', 'accepted')->exists();

        if (!$hasAcceptedGoal || !$hasAcceptedStartDate || !$hasAcceptedEndDate || !$hasAcceptedBudget) {
            return response()->json([
                'message' => 'Le projet ne peut pas être activé sans propositions acceptées pour tous les champs requis'
            ], 422);
        }

        $project->update([
            'status' => 'active',
            'activated_at' => now()
        ]);

        return response()->json([
            'data' => $project,
            'message' => 'Projet activé avec succès'
        ]);
    }

    /**
     * Rejeter un projet
     */
    public function rejectProject(Project $project): JsonResponse
    {
        $project->update([
            'status' => 'rejected',
            'rejected_at' => now()
        ]);

        return response()->json([
            'data' => $project,
            'message' => 'Projet rejeté avec succès'
        ]);
    }

    /**
     * Vérifier si l'utilisateur est admin du projet
     */
    public function checkAdmin(Project $project): JsonResponse
    {
        try {
            \Log::info('Checking admin rights', [
                'project_id' => $project->id,
                'project_admin_id' => $project->admin_id,
                'user_id' => auth()->id(),
                'user' => auth()->user(),
                'request_headers' => request()->headers->all()
            ]);

            $isAdmin = $project->admin_id === auth()->id();
            
            return response()->json([
                'isAdmin' => $isAdmin
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in checkAdmin', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Une erreur est survenue lors de la vérification des droits',
                'details' => $e->getMessage()
            ], 500);
        }
    }
} 