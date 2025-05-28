<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        Log::info('RedirectIfAuthenticated middleware check', [
            'path' => $request->path(),
            'method' => $request->method(),
            'guards' => $guards,
            'session_id' => session()->getId(),
            'is_json' => $request->expectsJson()
        ]);

        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            Log::info('Checking guard', ['guard' => $guard]);
            
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();
                Log::info('User is authenticated', [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'guard' => $guard
                ]);
                
                if ($user->role === 'admin') {
                    Log::info('Redirecting admin to dashboard');
                    return redirect()->route('admin.dashboard');
                } elseif ($user->role === 'user') {
                    Log::info('Redirecting user to dashboard');
                    return redirect()->route('user.dashboard');
                }
            } else {
                Log::info('User is not authenticated for guard', ['guard' => $guard]);
            }
        }

        return $next($request);
    }
} 