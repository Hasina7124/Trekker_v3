<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class ProjectProposal extends Model
{

    use HasFactory;

    protected $table = 'project_proposals';
    protected $fillable = ['project_id', 'proposer_id','type', 'value', 'status', 'validator_id', 'validated_at'];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }


    public function proposer()
    {
        return $this->belongsTo(User::class, 'proposer_id');
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validator_id');
    }

}
