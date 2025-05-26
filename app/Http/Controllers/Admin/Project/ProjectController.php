<?php

namespace App\Http\Controllers\Admin\Project;

use App\Http\Controllers\Controller;
use App\Models\ProjectObjective;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{

    public function index (Request $request)
    {
        // Commence la requête
        $query = Project::query();

        // Si un filtre par type est présent on ajoute une condition where
        if($request->has('status') && $request->status !== 'all'){
            $query->where('status', $request->status);
        }

        // Filtragepar recherche texte
        if($request->filled('search')) {
            $search = $request->search;

            $query->where(function($q) use ($search){
                $q->where('title', 'ILIKE', "%$search%")
                ->orWhere('description', 'ILIKE', "%$search%");
            });
        }

        // Récupération des produits
        $projects = $query->latest()->paginate(9)->withQueryString();

        // Recupération tous les types uniques disponibles dans la base.
        $status = Project::select('status')->distinct()->pluck('status');

        return Inertia::render('admin/project/ProjectsPage', [
            'projects' => $projects,
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
            'status' => $status,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'manager_id' => 'required|exists:users,id',
        ]);
        $admin = $request->user();

        $project = Project::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'admin_id' => $admin->id,
            'manager_id' => $validated['manager_id'],
        ]);

        return redirect()
            ->route('project.index') // ou où tu veux rediriger l'utilisateur
            ->with('success', 'Projet créé avec succès');
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|min:5',
            'description' => 'required|string|min:15',
        ]);

        $project->update($validated);
        return redirect()
            ->route('project.index')
            ->with('success', 'Projet mis à jour avec succès');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('project.index')->with('success', 'Projet supprimé');
    }

    public function show(Project $project)
    {
        return Inertia::render('admin/project/ProjectDetailPage', [
            'project' => $project, // ou autres relations nécessaires
        ]);
    }

    /**
     * Activate a project.
     *
     * @param Project $project
     * @return JsonResponse
     */
    public function activate(Project $project)
    {
        // Vérifier si l'utilisateur a les permissions nécessaires
        if (!auth()->user()->can('activate', $project)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Vérifier si le projet a des propositions validées
        $hasAcceptedGoal = $project->proposals()->where('type', 'goal')->where('status', 'accepted')->exists();
        $hasAcceptedTime = $project->proposals()->whereIn('type', ['start_date', 'end_date'])->where('status', 'accepted')->exists();
        $hasAcceptedBudget = $project->proposals()->where('type', 'budget')->where('status', 'accepted')->exists();

        if (!$hasAcceptedGoal || !$hasAcceptedTime || !$hasAcceptedBudget) {
            return response()->json(['message' => 'Project cannot be activated without accepted proposals for all required fields'], 422);
        }

        // Mettre à jour le statut du projet
        $project->status = 'active';
        $project->save();

        // Mettre à jour les valeurs du projet avec les propositions validées
        $acceptedStartDate = $project->proposals()->where('type', 'start_date')->where('status', 'accepted')->first();
        $acceptedEndDate = $project->proposals()->where('type', 'end_date')->where('status', 'accepted')->first();
        $acceptedBudget = $project->proposals()->where('type', 'budget')->where('status', 'accepted')->first();

        if ($acceptedStartDate) {
            $project->start_date = $acceptedStartDate->value;
        }
        if ($acceptedEndDate) {
            $project->end_date = $acceptedEndDate->value;
        }
        if ($acceptedBudget) {
            $project->budget = $acceptedBudget->value;
        }

        $project->save();

        return response()->json([
            'message' => 'Project activated successfully',
            'project' => $project
        ]);
    }
}
