<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiDebugMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        Log::info('=== API Debug ===', [
            'cookies' => [
                'all_cookies' => $request->cookies->all(),
                'has_xsrf' => $request->cookies->has('XSRF-TOKEN'),
                'xsrf_cookie' => $request->cookies->get('XSRF-TOKEN'),
                'has_session' => $request->cookies->has(config('session.cookie')),
                'session_cookie' => $request->cookies->get(config('session.cookie')),
            ],
            'headers' => [
                'all_headers' => $request->headers->all(),
                'x_xsrf_token' => $request->header('X-XSRF-TOKEN'),
                'authorization' => $request->header('Authorization'),
            ],
            'session' => [
                'id' => session()->getId(),
                'token' => session()->token(),
            ],
        ]);

        $response = $next($request);

        Log::info('=== API Response ===', [
            'status' => $response->getStatusCode(),
            'headers' => $response->headers->all(),
        ]);

        return $response;
    }
} 