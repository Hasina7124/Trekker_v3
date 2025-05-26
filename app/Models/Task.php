<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'id',
        'module_id',
        'skill_id',
        'title',
        'description',
    ];
}
