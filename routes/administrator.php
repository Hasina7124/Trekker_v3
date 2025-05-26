<?php

use App\Http\Controllers\Admin\Project\ProjectController;
use App\Http\Controllers\ProjectObjectiveController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\User\UserController;
use App\Http\Controllers\Admin\DashboardController;

Route::middleware(['auth', 'role:admin'])->group(function() {
    Route::prefix('admin')->group(callback: function (){
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

        // User
        Route::get('/users', [UserController::class, 'index'])->name('admin.user.screen');
        Route::post('/user/invite', [UserController::class, 'invite'])->name('invite.post');
        Route::delete('/user/delete', [UserController::class, 'destroy'])->name('admin.user.delete');

//        project feature
        Route::get('/project', [ProjectController::class, 'index'])->name('project.index');
        Route::post('/project', [ProjectController::class, 'store'])->name('project.store');
        Route::put('/project/{project}', [ProjectController::class, 'update'])->name('project.update');
        Route::get('/project/{project}', [ProjectController::class, 'show'])->name('project.show');
        Route::delete('/project/{project}', [ProjectController::class, 'destroy'])->name('project.destroy');
    });
});
