<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

function actingAs(\Illuminate\Database\Eloquent\Model|\Illuminate\Database\Eloquent\Collection|User $admin)
{

}

test('users can authenticate using the login screen', function () {
    $admin = User::factory()->create(['role' => 'admin']);
//    $user = User::factory()->create(['role' => 'user']);

    // Test pour l'administrateur
    $response = $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    actingAs($admin);

    expect(auth()->check())->toBeTrue();
    $response->assertRedirect(route('admin.dashboard'));


//
//    // Test pour l'utilisateur standard
//    $response = $this->post('/login', [
//        'email' => $user->email,
//        'password' => 'password',
//    ]);
//    $response->assertRedirect(route('dashboard'));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
