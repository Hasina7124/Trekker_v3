<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectUser extends Model
{
    use HasFactory;

    protected $connection = 'pgsql';
    
    protected $table = 'project_users';

    protected $fillable = [
        'project_id',
        'user_id'
    ];

    protected $casts = [
        'project_id' => 'integer',
        'user_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the project that owns the project user.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user that owns the project user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
} 