<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ApiRequestLogger
{
    public function handle(Request $request, Closure $next): Response
    {
        // Log au début de la requête
        Log::info('API Request Started', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'headers' => $request->headers->all(),
            'is_authenticated' => Auth::check(),
            'user_id' => Auth::id(),
            'session_id' => session()->getId(),
            'cookies_present' => !empty($request->cookies->all()),
        ]);

        // Exécute la requête
        $response = $next($request);

        // Log après la réponse
        Log::info('API Request Completed', [
            'url' => $request->fullUrl(),
            'status_code' => $response->getStatusCode(),
            'session_still_valid' => Auth::check(),
        ]);

        return $response;
    }
} 