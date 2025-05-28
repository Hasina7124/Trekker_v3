<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequestLogger
{
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        Log::info('=== Request Started ===', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'route' => $request->route() ? $request->route()->getName() : 'N/A',
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'auth_status' => [
                'is_authenticated' => Auth::check(),
                'user_id' => Auth::id(),
                'user_role' => Auth::user()?->role,
            ],
            'session_info' => [
                'id' => session()->getId(),
                'has_session' => $request->hasSession(),
                'previous_url' => url()->previous(),
            ],
            'request_info' => [
                'headers' => $request->headers->all(),
                'cookies' => $request->cookies->all(),
            ]
        ]);

        $response = $next($request);

        $duration = microtime(true) - $startTime;

        Log::info('=== Request Completed ===', [
            'url' => $request->fullUrl(),
            'duration' => round($duration * 1000, 2) . 'ms',
            'status_code' => $response->getStatusCode(),
            'session_still_valid' => Auth::check(),
        ]);

        return $response;
    }
} 