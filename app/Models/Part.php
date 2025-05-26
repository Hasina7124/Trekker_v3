<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    use HasFactory;

    protected $connection = 'pgsql';

    protected $fillable = [
        'project_id',
        'title',
        'description'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    // Helper method pour obtenir toutes les tâches de la partie
    public function tasks()
    {
        return Task::whereIn('module_id', $this->modules()->pluck('id'))->get();
    }
} 