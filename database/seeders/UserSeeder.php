<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $usersPath = database_path('data/data_users.json');

        if (!File::exists($usersPath)) {
            $this->command->error('❌ Le fichier data_users.json est introuvable.');
            return;
        }

        $users = json_decode(File::get($usersPath), true);

        foreach ($users as $userData) {
            User::create([
                'id' => $userData['id'],
                'name' => $userData['name'],
                'email' => $userData['email'],
                'adress' => $userData['adress'],
                'phone' => $userData['phone'],
                'email_verified_at' => $userData['email_verified_at'],
                'password' => Hash::make($userData['password']),
                'remember_token' => $userData['remember_token'],
            ]);
        }

        $this->command->info('✅ Utilisateurs importés avec succès.');
    }
}
