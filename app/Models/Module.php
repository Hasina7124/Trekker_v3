<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = [
        'id',
        'title',
        'description',
        'xp_rewards',
        'project_id',
        'duration_hours'
    ];
}
