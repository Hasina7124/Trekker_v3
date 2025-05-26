<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invitation;
use App\Mail\InvitationUser;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Inertia\Inertia;


class InvitationController extends Controller
{

    public function index() 
    {
        return Inertia::render('admin/invitation/index');
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
