<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        if (!Auth::check()) {
            Log::info('User not authenticated, redirecting to login');
            return redirect()->route('login');
        }

        $user = Auth::user();
        Log::info('Checking role access', [
            'user_role' => $user->role,
            'required_role' => $role,
            'path' => $request->path()
        ]);

        if ($user->role !== $role) {
            Log::info('Invalid role, redirecting to appropriate dashboard');
            if ($user->role === 'admin') {
                return redirect()->route('admin.dashboard');
            } elseif ($user->role === 'user') {
                return redirect()->route('user.dashboard');
            }
        }

        return $next($request);
    }
}
