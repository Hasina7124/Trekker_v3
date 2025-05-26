<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Invitation;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(string $token): Response
    {
        return Inertia::render('auth/register', [
            'token' => $token,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'required|string|max:255',
            'adress' => 'required|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'token' => 'required',
        ]);

        // Verify if token is valid
        $invitation = Invitation::where('token', $request->token)->first();
        
        if($invitation === null) {
            return abort(403, 'Invalid or expired invitation');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'adress' => $request->adress,
            'password' => Hash::make($request->password),
        ]);

        // Delete the invitation
        $invitation->delete();

        event(new Registered($user));

        Auth::login($user);

        return to_route('user.dashboard');
    }
}
