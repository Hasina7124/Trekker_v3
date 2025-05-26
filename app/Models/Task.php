<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $connection = 'pgsql';

    protected $fillable = [
        'name',
        'description',
        'status',
        'module_id',
        'assignee_id',
        'estimated_hours',
        'amount'
    ];

    protected $casts = [
        'estimated_hours' => 'integer',
        'amount' => 'float'
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function deliverables()
    {
        return $this->hasMany(TaskDeliverable::class);
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }
}
