<?php

use App\Http\Controllers\ProjectProposalController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->group(function () {
    // Routes pour les projets
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    // Route pour les projets du manager
    Route::get('/manager/projects', [ProjectController::class, 'managerProjects']);

    // Routes pour les propositions
    Route::get('/projects/{project}/proposals', [ProjectProposalController::class, 'index']);
    Route::get('/projects/{project}/proposals/accepted', [ProjectProposalController::class, 'getAcceptedProposals']);
    Route::post('/projects/{project}/proposals', [ProjectProposalController::class, 'store']);

    // Gestion des propositions
    Route::put('/proposals/{proposal}', [ProjectProposalController::class, 'update']);
    Route::delete('/proposals/{proposal}', [ProjectProposalController::class, 'destroy']);
    Route::put('/proposals/{proposal}/accept', [ProjectProposalController::class, 'accept']);
    Route::put('/proposals/{proposal}/reject', [ProjectProposalController::class, 'reject']);
    Route::put('/proposals/{proposal}/pending', [ProjectProposalController::class, 'pending']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
}); 