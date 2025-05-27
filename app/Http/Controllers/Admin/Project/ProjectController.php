<?php

namespace App\Http\Controllers\Admin\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ApiAdminProjectController;

class ProjectController extends Controller
{
    protected $apiController;

    public function __construct(ApiAdminProjectController $apiController)
    {
        $this->apiController = $apiController;
    }

    /**
     * Afficher la liste des projets
     */
    public function index(Request $request)
    {
        // Récupérer les données via l'API
        $response = $this->apiController->index($request);
        $data = json_decode($response->getContent(), true);

        return Inertia::render('admin/project/ProjectsPage', [
            'projects' => $data['projects'],
            'filters' => $data['filters'],
            'status' => $data['status']
        ]);
    }

    /**
     * Afficher le formulaire de création
     */
    public function create()
    {
        return Inertia::render('admin/project/CreateProjectPage');
    }

    /**
     * Afficher les détails d'un projet
     */
    public function show(Project $project)
    {
        return Inertia::render('admin/project/ProjectDetailPage', [
            'project' => $project
        ]);
    }

    /**
     * Afficher le formulaire d'édition
     */
    public function edit(Project $project)
    {
        return Inertia::render('admin/project/EditProjectPage', [
            'project' => $project
        ]);
    }
}
