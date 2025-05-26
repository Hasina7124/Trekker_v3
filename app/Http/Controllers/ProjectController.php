<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    /**
     * Afficher la liste des projets
     */
    public function index(): JsonResponse
    {
        try {
            $projects = Project::with(['devs', 'parts.modules'])
                ->paginate(9)
                ->through(function ($project) {
                    return [
                        'id' => $project->id,
                        'title' => $project->title,
                        'description' => $project->description,
                        'status' => $project->status,
                        'budget' => $project->budget,
                        'start_date' => $project->start_date,
                        'end_date' => $project->end_date,
                        'created_at' => $project->created_at,
                        'updated_at' => $project->updated_at,
                        'team' => $project->devs->map(function ($user) {
                            return [
                                'id' => $user->id,
                                'name' => $user->name,
                                'email' => $user->email,
                            ];
                        }),
                        'parts' => $project->parts,
                    ];
                });

            return response()->json($projects);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des projets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un projet spécifique
     */
    public function show($id): JsonResponse
    {
        try {
            $project = Project::with(['devs', 'parts.modules'])
                ->findOrFail($id);

            return response()->json([
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'status' => $project->status,
                'budget' => $project->budget,
                'start_date' => $project->start_date,
                'end_date' => $project->end_date,
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
                'team' => $project->devs->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                }),
                'parts' => $project->parts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Projet non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Créer un nouveau projet
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'budget' => 'required|numeric',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
            ]);

            $project = Project::create([
                ...$validated,
                'status' => 'pending',
            ]);

            return response()->json($project, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du projet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un projet
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $project = Project::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'status' => 'sometimes|in:pending,active,rejected,completed',
                'budget' => 'sometimes|numeric',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after:start_date',
            ]);

            $project->update($validated);

            return response()->json($project);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du projet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un projet
     */
    public function destroy($id): JsonResponse
    {
        try {
            $project = Project::findOrFail($id);
            $project->delete();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression du projet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function managerProjects(): JsonResponse
    {
        try {
            $projects = Project::with(['devs', 'parts.modules'])
                ->where('manager_id', auth()->id())
                ->paginate(9)
                ->through(function ($project) {
                    return [
                        'id' => $project->id,
                        'title' => $project->title,
                        'description' => $project->description,
                        'status' => $project->status,
                        'budget' => $project->budget,
                        'start_date' => $project->start_date,
                        'end_date' => $project->end_date,
                        'created_at' => $project->created_at,
                        'updated_at' => $project->updated_at,
                        'team' => $project->devs->map(function ($user) {
                            return [
                                'id' => $user->id,
                                'name' => $user->name,
                                'email' => $user->email,
                            ];
                        }),
                        'parts' => $project->parts,
                    ];
                });

            return response()->json($projects);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des projets du manager',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 