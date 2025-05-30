<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\User\DashboardController;
use App\Http\Controllers\User\ProjectManagerController;

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::prefix('user')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('user.dashboard');
    });

    Route::prefix('manager')->group(function () {
        Route::get('/project', [ProjectManagerController::class, 'index'])->name('manager.project');
    });
});
