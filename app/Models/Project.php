<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    // Connexion
    protected $connection = 'pgsql';

    protected $fillable = [
        'title',
        'description',
        'status',
        'budget',
        'start_date',
        'end_date',
        'admin_id',
        'manager_id',
    ];

    protected $casts = [
        'budget' => 'float',
        'start_date' => 'date',
        'end_date' => 'date'
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function parts()
    {
        return $this->hasMany(Part::class);
    }

    public function devs()
    {
        return $this->belongsToMany(User::class, 'project_users', 'project_id', 'user_id');
    }

    public function proposals()
    {
        return $this->hasMany(ProjectProposal::class);
    }

    // Helper methods pour obtenir toutes les tâches du projet
    public function getAllTasks()
    {
        return Task::whereIn('module_id', 
            Module::whereIn('part_id', 
                $this->parts()->pluck('id')
            )->pluck('id')
        )->get();
    }

    // Helper method pour obtenir tous les développeurs assignés
    public function getAssignedUsers()
    {
        return User::whereIn('id', 
            ModuleUser::whereIn('module_id', 
                Module::whereIn('part_id', 
                    $this->parts()->pluck('id')
                )->pluck('id')
            )->pluck('user_id')
        )->distinct()->get();
    }
}
