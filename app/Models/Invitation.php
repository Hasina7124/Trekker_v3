<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invitation extends Model
{
    protected $fillable = ['email', 'token', 'expires_at', 'used', 'admin_id'];

    public static function generateToken()
    {
        return Str::random(40);
    }

    // public function isExpired()
    // {
    //     return $this->expires_at < now();
    // }
}
