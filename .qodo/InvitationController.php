<?php

namespace App\Http\Controllers\Admin\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function index() 
    {
        return Inertia::render('admin/user/index');
    }

    public function invite(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email|unique:invitations,email',
        ]);

        $token = Invitation::generateToken();

        $invitation = Invitation::create([
            'email' => $request->email,
            'token' => $token,
            'expires_at' => Carbon::now()->addMinutes(30),
            'admin_id' => Auth::user()->id,
        ]);

        var_dump($invitation->token);

         // Envoyer un email avec le lien d'inscription
         Mail::to($request->email)->send(new InvitationUser($invitation));

         return response()->json([
            'message' => $invitation->token
         ]);
    }
}
