<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        Log::info('Début de la tentative de connexion', [
            'email' => $request->email,
            'timestamp' => now()
        ]);

        try {
            $request->authenticate();
            Log::info('Authentification réussie - avant regenerate');

            $request->session()->regenerate();
            Log::info('Session régénérée avec succès');

            Log::info('Utilisateur authentifié', [
                'user_id' => Auth::id(),
                'role' => Auth::user()->role,
                'session_id' => $request->session()->getId(),
                'email' => Auth::user()->email
            ]);

            if(Auth::user()->role === 'admin'){
                Log::info('Redirection admin vers dashboard');
                return redirect('/admin/dashboard');
            } elseif (Auth::user()->role === 'user') {
                Log::info('Redirection user vers dashboard');
                return redirect('/user/dashboard');
            }

            Log::info('Redirection vers dashboard par défaut');
            return redirect('/');
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'authentification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
