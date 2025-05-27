<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Module;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectManagerController extends Controller
{
    public function index()
    {
        // Récupérer les projets gérés par l'utilisateur connecté
        $projects = Project::where('manager_id', auth()->id())
            ->with(['modules', 'tasks'])
            ->get();

        return Inertia::render('user/project/index', [
            'projects' => $projects
        ]);
    }

    public function dashboard(Request $request)
    {
        return Inertia::render('user/project/index', [
        ]);
    }
}
