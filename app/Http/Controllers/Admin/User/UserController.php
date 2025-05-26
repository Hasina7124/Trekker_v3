<?php

namespace App\Http\Controllers\Admin\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Invitation;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvitationUser;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request) 
    {
        // Get all users
        $perPage = $request->get('per_page',10);
        $users = User::select('id', 'name', 'experience')
                    ->orderBy('name')
                    ->paginate($perPage);

        return response()->json($users);
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


         // Envoyer un email avec le lien d'inscription
         Mail::to($request->email)->send(new InvitationUser($invitation));
    }

    // Delete user(s)
    public function destroy(Request $request)
    {
        // Validate users and password correspondance
        $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'integer|exists:users,id',
            'password' => ['required', 'current_password'],
        ]);
        
        // Delete
        User::whereIn('id', $request->userIds)->delete();

        return redirect()->back()->with('success', 'User(s) Deleted');
    }
}
