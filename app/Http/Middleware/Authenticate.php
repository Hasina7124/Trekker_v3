<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        Log::info('Authentication check', [
            'is_json' => $request->expectsJson(),
            'path' => $request->path(),
            'session_id' => session()->getId()
        ]);

        if ($request->expectsJson()) {
            return null; // Will throw 401 response
        }

        return route('login');
    }
} 