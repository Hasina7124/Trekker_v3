<?php

use App\Http\Controllers\Api\ApiAdminProjectController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;

Route::middleware('auth:sanctum')->group(function () {
    // Routes pour les projets (Admin)
    Route::prefix('projects')->group(function () {
        // Routes CRUD de base
        Route::get('/', [ApiAdminProjectController::class, 'index']);
        Route::post('/', [ApiAdminProjectController::class, 'store']);
        Route::put('/{project}', [ApiAdminProjectController::class, 'update']);
        Route::delete('/{project}', [ApiAdminProjectController::class, 'destroy']);

        // Routes pour les propositions
        Route::get('/{project}/accepted-proposals', [ApiAdminProjectController::class, 'getAcceptedProposals']);
        Route::get('/{project}/proposals/{type?}', [ApiAdminProjectController::class, 'getProposalsByType']);
        Route::post('/{project}/proposals', [ApiAdminProjectController::class, 'addProposal']);
        Route::put('/proposals/{proposal}/status', [ApiAdminProjectController::class, 'updateProposalStatus']);
        Route::delete('/proposals/{proposal}', [ApiAdminProjectController::class, 'deleteProposal']);
        Route::put('/proposals/{proposal}', [ApiAdminProjectController::class, 'editProposal']);

        // Routes d'actions spéciales
        Route::post('/{project}/activate', [ApiAdminProjectController::class, 'activateProject']);
        Route::post('/{project}/reject', [ApiAdminProjectController::class, 'rejectProject']);
    });

    // Routes pour les utilisateurs
    Route::get('/users/managers', [UserController::class, 'managers']);
}); 