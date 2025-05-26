<?php

use Illuminate\Support\Facades\Broadcast;
use App\Http\Resources\UserResource;
use \App\Models\User;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

Broadcast::channel('Online', function (User $user) {
    return $user ? new UserResource($user) : null;
});

Broadcast::channel('message.user.{userId1}-{userId2}', function (User $user, int $userId1, int $userId2){
    return $user->id === $userId1 || $user->id === $userId2 ? $user : null;
});

Broadcast::channel('message.group.{groupId}',function(User $user, int $groupId){
    return $user->groups->contains('id', $groupId) ? $user : null;
});

Broadcast::channel('wallet.{walletId}', function ($user, $walletId) {
    // Vérifie que l'utilisateur peut accéder à ce wallet
    return $user->wallet()->where('id', $walletId)->exists();
});
