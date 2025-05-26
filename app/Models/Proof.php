<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proof extends Model
{
    protected $fillable = [
        'id',
        'task_user_id',
        'type', // url, video, etc
        'content',
    ];
}
