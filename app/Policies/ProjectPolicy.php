<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can activate the project.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function activate(User $user, Project $project)
    {
        // Vérifier si l'utilisateur est un admin ou le project manager
        return $user->is_admin || $user->id === $project->manager_id;
    }
} 