<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Project extends Model
{
    use HasFactory;

    // Connexion
    protected $connection = 'pgsql';

    protected $fillable = [
        'id',
        'title',
        'description',
        'status',
        'budget',
        'admin_id',
        'manager_id',
        'start_date',
        'end_date',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }


    public function devs()
    {
        return $this->belongsToMany(User::class, 'dev_project', 'project_id', 'dev_id');
    }

    public function proposals()
    {
        return $this->hasMany(ProjectProposal::class);
    }
}
