<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        Log::info('Authentication check details', [
            'is_json' => $request->expectsJson(),
            'path' => $request->path(),
            'method' => $request->method(),
            'session_id' => session()->getId(),
            'has_session' => $request->hasSession(),
            'session_status' => session()->status(),
            'cookies' => $request->cookies->all(),
            'headers' => $request->headers->all(),
            'auth_check' => Auth::check(),
            'intended_url' => $request->url(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($request->expectsJson()) {
            Log::info('JSON request detected, returning null for 401 response');
            return null; // Will throw 401 response
        }

        Log::info('Redirecting to login page');
        return route('login');
    }
} 