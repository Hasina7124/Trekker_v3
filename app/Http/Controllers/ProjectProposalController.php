<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProposalRequest;
use App\Models\Project;
use App\Models\ProjectProposal;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class ProjectProposalController extends Controller
{
    public function index(Request $request, Project $project)
    {
        try {
            // 1. Validation des paramètres de requête
            $validator = Validator::make($request->all(), [
                'proposal_type' => ['nullable', 'string', Rule::in(['goal', 'budget', 'time'])]
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Paramètres de filtrage invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // 2. Construction de la requête
            $query = ProjectProposal::where('project_id', $project->id)
                ->select([
                    'id',
                    'project_id',
                    'proposer_id',
                    'type',
                    'value',
                    'status',
                    'validator_id',
                    'created_at'
                ]);

            // 3. Filtrage par type
            if ($request->filled('proposal_type')) {
                $type = $request->proposal_type;

                $query->when(in_array($type, ['goal', 'budget']), function ($q) use ($type) {
                    return $q->where('type', $type);
                })->when($type === 'time', function ($q) {
                    return $q->whereIn('type', ['start_date', 'end_date']);
                });
            }

            // 4. Exécution et transformation
            $proposals = $query->latest()
                ->get()
                ->map(function ($proposal) {
                    return $this->transformProposalValue($proposal);
                });

            return response()->json([
                'data' => $proposals,
                'meta' => [
                    'total' => $proposals->count(),
                    'project_id' => $project->id
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des propositions',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Transforme la valeur de la proposition
     */
    protected function transformProposalValue(ProjectProposal $proposal): ProjectProposal
    {
        try {
            $decoded = json_decode($proposal->value, true);

            if (is_array($decoded) && array_key_exists('value', $decoded)) {
                $proposal->value = (string)$decoded['value'];
            } elseif (is_object($decoded) && property_exists($decoded, 'value')) {
                $proposal->value = (string)$decoded->value;
            } else {
                $proposal->value = (string)$proposal->value;
            }

            // Conversion des dates au format ISO
            if (in_array($proposal->type, ['start_date', 'end_date'])) {
                $proposal->value = Carbon::parse($proposal->value)->toIso8601String();
            }
        } catch (\Exception $e) {
            $proposal->value = (string)$proposal->value;
        }

        return $proposal;
    }

    public function store(ProposalRequest $request, Project $project)
    {
        try {
            // Validation des champs obligatoires
            if (!$request->filled('type') || !$request->has('value')) {
                return response()->json(['error' => 'Les champs "type" et "value" sont obligatoires'], 422);
            }

            $type = $request->type;
            $value = $request->value;

            // Traitement spécifique selon le type
            switch ($type) {
                case 'start_date':
                case 'end_date':
                    if (!is_string($value) || !Carbon::hasFormat($value, 'Y-m-d')) {
                        return response()->json(['error' => 'Format de date invalide. Utilisez Y-m-d'], 422);
                    }
                    $value = Carbon::parse($value);
                    break;

                case 'budget':
                    if (!is_numeric($value)) {
                        return response()->json(['error' => 'Le budget doit être une valeur numérique'], 422);
                    }
                    $value = floatval($value);
                    break;

                case 'goal':
                    $value = trim($value);
                    if (empty($value)) {
                        return response()->json(['error' => 'L\'objectif ne peut pas être vide'], 422);
                    }
                    break;

                default:
                    return response()->json(['error' => 'Type de proposition invalide'], 422);
            }

            $proposal = ProjectProposal::create([
                'project_id' => $project->id,
                'proposer_id' => Auth::id(),
                'type' => $type,
                'value' => $value,
                'status' => 'pending'
            ]);

            return response()->json(['proposal' => $proposal], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Erreur serveur',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function accept(ProjectProposal $projectProposal)
    {
        $proposal = $projectProposal;
        try {
            // Vérification de l'authentification
            if (!Auth::check()) {
                return response()->json(['message' => 'Non autorisé'], 401);
            }

            // L'utilisateur ne peut pas accepter sa propre proposition
            if ($proposal->proposer_id == Auth::id()) {
                return response()->json([
                    'message' => 'Vous ne pouvez pas accepter votre propre proposition'
                ], 403);
            }

            info('Status de la proposition : ' . $proposal->status);

            // Vérifier que la proposition est en statut 'pending'
            if ($proposal->status !== 'pending') {
                return response()->json([
                    'message' => 'Seules les propositions en attente peuvent être acceptées'
                ], 422);
            }

            // Démarrer une transaction pour garantir l'intégrité des données
            DB::beginTransaction();

            // 1. Accepter la proposition courante
            $proposal->update([
                'status' => 'accepted',
                'validator_id' => Auth::id(),
                'validated_at' => now()
            ]);

            // 2. Rejeter toutes les autres propositions du même type pour ce projet
            ProjectProposal::where('project_id', $proposal->project_id)
                ->where('type', $proposal->type)
                ->where('id', '!=', $proposal->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'rejected',
                    'validator_id' => Auth::id(),
                    'validated_at' => now()
                ]);

            // 3. Mettre à jour le projet si le type est autorisé
            $allowedColumns = ['start_date', 'end_date', 'budget'];

            if (in_array($proposal->type, $allowedColumns)) {
                $proposal->project->update([
                    $proposal->type => $proposal->value
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Proposition acceptée avec succès',
                'proposal' => $proposal->fresh(),
                'updated_project' => $proposal->project->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reject($proposalId)
    {
        try {
            // 1. Vérification de l'authentification
            if (!Auth::check()) {
                return response()->json(['message' => 'Authentification requise'], 401);
            }

            // 2. Recherche de la proposition avec gestion d'erreur
            $proposal = ProjectProposal::findOrFail($proposalId);

            // 3. L'auteur ne peut pas rejeter sa propre proposition
            if ($proposal->proposer_id == Auth::id()) {
                return response()->json([
                    'message' => 'Vous ne pouvez pas rejeter votre propre proposition'
                ], 403);
            }

            // 4. On ne peut rejeter que les propositions en attente
            if ($proposal->status !== 'pending') {
                return response()->json([
                    'message' => 'Seules les propositions en attente peuvent être rejetées'
                ], 422);
            }

            // 5. Mise à jour de la proposition
            $proposal->update([
                'status' => 'rejected',
                'validator_id' => Auth::id(),
                'validated_at' => now()
            ]);

            return response()->json([
                'message' => 'Proposition rejetée avec succès',
                'proposal' => $proposal->fresh()
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Proposition non trouvée'
            ], 404);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre une proposition en attente
     */
    public function pending($proposalId)
    {
        try {
            DB::beginTransaction();

            $proposal = ProjectProposal::findOrFail($proposalId);

            // Vérifier si la proposition est déjà en attente
            if ($proposal->status === 'pending') {
                return response()->json([
                    'message' => 'La proposition est déjà en attente'
                ], 422);
            }

            // Mettre à jour le statut de la proposition
            $proposal->update([
                'status' => 'pending',
                'validator_id' => null,
                'validated_at' => null
            ]);

            // Si c'était une proposition acceptée, on doit mettre à jour le projet
            if ($proposal->status === 'accepted') {
                $allowedColumns = ['start_date', 'end_date', 'budget'];
                if (in_array($proposal->type, $allowedColumns)) {
                    $proposal->project->update([
                        $proposal->type => null
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Proposition mise en attente avec succès',
                'proposal' => $proposal->fresh()
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Proposition non trouvée'
            ], 404);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($proposalId)
    {
        try {
            // 1. Vérification de l'authentification
            if (!Auth::check()) {
                return response()->json(['message' => 'Authentification requise'], 401);
            }

            // 2. Recherche de la proposition
            $proposal = ProjectProposal::findOrFail($proposalId);

            // 3. Vérification des droits (seul le créateur peut supprimer)
            if ($proposal->proposer_id != Auth::id()) {
                return response()->json([
                    'message' => 'Vous ne pouvez pas supprimer cette proposition'
                ], 403);
            }

            // 4. Suppression
            $proposal->delete();

            return response()->json([
                'message' => 'Proposition supprimée avec succès'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Proposition introuvable'], 404);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $proposalId)
    {
        try {
            // 1. Vérification de l'authentification
            if (!Auth::check()) {
                return response()->json(['message' => 'Authentification requise'], 401);
            }

            // 2. Récupération de la proposition
            $proposal = ProjectProposal::findOrFail($proposalId);

            // 3. Validation des droits (seul le créateur peut modifier)
            if ($proposal->proposer_id != Auth::id()) {
                return response()->json([
                    'message' => 'Seules vos propres propositions peuvent être modifiées'
                ], 403);
            }

            // 4. Validation des données
            $validated = $request->validate([
                'value' => ['required']
            ]);

            // 5. Traitement spécifique par type
            $value = $validated['value'];

            if (in_array($proposal->type, ['start_date', 'end_date'])) {
                if (!strtotime($value)) {
                    return response()->json([
                        'message' => 'Format de date invalide'
                    ], 422);
                }
                $value = Carbon::parse($value)->format('Y-m-d');
            }

            // 6. Mise à jour
            $proposal->update([
                'value' => $value
            ]);

            return response()->json([
                'message' => 'Proposition mise à jour avec succès',
                'proposal' => $proposal->fresh()
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Proposition introuvable'], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère toutes les propositions validées pour un projet
     *
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAcceptedProposals(Project $project)
    {
        try {
            $acceptedProposals = ProjectProposal::where('project_id', $project->id)
                ->where('status', 'accepted')
                ->get()
                ->map(function ($proposal) {
                    return $this->transformProposalValue($proposal);
                })
                ->groupBy('type')
                ->map(function ($proposals) {
                    return $proposals->values();
                });

            return response()->json([
                'data' => [
                    'goals' => $acceptedProposals->get('goal', collect()),
                    'startDates' => $acceptedProposals->get('start_date', collect()),
                    'endDates' => $acceptedProposals->get('end_date', collect()),
                    'budgets' => $acceptedProposals->get('budget', collect())
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des propositions validées',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
