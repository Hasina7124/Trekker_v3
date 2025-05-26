<?php

use App\Http\Controllers\ProjectObjectiveController;
use App\Http\Controllers\ProjectProposalController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\test;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Chat\MessageController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Chat Feature
    Route::prefix('chat')->group(function () {
        Route::get('/', [MessageController::class, 'index'])->name('chat.index');
        Route::get('/user/{user}', [MessageController::class, 'byUser'])->name('chat.user');
        Route::get('/group/{group}', [MessageController::class, 'byGroup'])->name('chat.group');
        Route::post('/', [MessageController::class, 'store'])->name('chat.store');
        Route::delete('/{chat}', [MessageController::class, 'destroy'])->name('chat.destroy');
        Route::get('/older/{chat}', [MessageController::class, 'loadOlder'])->name('chat.loadOlder');
    });

    // Wallet Feature
    Route::prefix('wallet')->group(function () {
        Route::get('/', [WalletController::class, 'index'])->name('wallet.index');
        Route::post('/deposit', [WalletController::class, 'deposit'])->name('wallet.deposit');
        Route::post('/withdraw', [WalletController::class, 'withdraw'])->name('wallet.withdraw');
    });

    // Project Management
    Route::prefix('projects')->group(function () {
        // Project Detail Page
        Route::get('/{project}', function ($project) {
            return Inertia::render('admin/project/ProjectDetailPage', [
                'project' => $project,
                'proposals' => [
                    'data' => App\Models\ProjectProposal::where('project_id', $project)
                        ->latest()
                        ->get(),
                    'meta' => [
                        'total' => App\Models\ProjectProposal::where('project_id', $project)->count(),
                        'project_id' => $project
                    ]
                ]
            ]);
        })->name('projects.show');

        // Project Proposals (ces routes sont maintenant gérées par l'API)
        Route::prefix('{project}/proposals')->group(function () {
            Route::get('/', [ProjectProposalController::class, 'index'])->name('projects.proposals.index');
            Route::post('/', [ProjectProposalController::class, 'store'])->name('projects.proposals.store');
        });
    });

    Route::get('/test', [test::class, 'index']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// For the administrator
require __DIR__.'/administrator.php';
require __DIR__.'/user.php';
