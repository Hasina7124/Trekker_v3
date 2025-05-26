<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasFactory;

    protected $connection = 'pgsql';

    protected $fillable = [
        'part_id',
        'title',
        'description',
        'xp_rewards',
        'duration_hours',
        'completed_at'
    ];

    protected $casts = [
        'xp_rewards' => 'integer',
        'duration_hours' => 'integer',
        'part_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the part that owns the module.
     */
    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }

    /**
     * Get the tasks for the module.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getCompletedUser()
    {
        return $this->completed_at ? $this->user : null;
    }
}