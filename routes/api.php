<?php

use App\Http\Controllers\ProjectProposalController;
use App\Http\Controllers\Admin\Project\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Routes pour les propositions de projet
    Route::prefix('projects/{project}')->group(function () {
        // Récupérer toutes les propositions d'un projet
        Route::get('proposals', [ProjectProposalController::class, 'index']);
        
        // Récupérer les propositions validées
        Route::get('accepted-proposals', [ProjectProposalController::class, 'getAcceptedProposals']);
        
        // Créer une nouvelle proposition
        Route::post('proposals', [ProjectProposalController::class, 'store']);

        // Activer un projet
        Route::put('activate', [ProjectController::class, 'activate'])
            ->name('api.projects.activate');
    });

    // Routes pour la gestion des propositions individuelles
    Route::prefix('project-proposals')->group(function () {
        // Mettre à jour une proposition
        Route::put('{projectProposal}', [ProjectProposalController::class, 'update']);
        
        // Supprimer une proposition
        Route::delete('{projectProposal}', [ProjectProposalController::class, 'destroy']);
        
        // Valider une proposition
        Route::put('{projectProposal}/accept', [ProjectProposalController::class, 'accept']);
        
        // Rejeter une proposition
        Route::put('{projectProposal}/reject', [ProjectProposalController::class, 'reject']);
        
        // Mettre une proposition en attente
        Route::put('/{proposal}/pending', [ProjectProposalController::class, 'pending']);
    });
}); 