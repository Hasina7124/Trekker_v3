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
        $projects = Project::where('manager_id', auth()->id())
            ->with(['parts', 'proposals' => function($query) {
                $query->where('status', 'accepted');
            }])
            ->paginate(9);

        return Inertia::render('user/project/index', [
            'projects' => $projects
        ]);
    }

    public function getProjects(Request $request)
    {
        $projects = Project::where('manager_id', auth()->id())
            ->with(['parts', 'proposals' => function($query) {
                $query->where('status', 'accepted');
            }])
            ->paginate(9);

        return response()->json($projects);
    }

    public function dashboard(Request $request)
    {
        return Inertia::render('user/project/index', [
        ]);
    }
}
