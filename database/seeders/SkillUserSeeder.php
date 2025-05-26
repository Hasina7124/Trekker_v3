<?php

namespace Database\Seeders;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SkillUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Assurez-vous qu'il y a au moins 3 utilisateurs et des skills
        $users = User::all();
        $skills = Skill::all();

        foreach ($users as $user) {
            // Donne aléatoirement 2 à 5 compétences par utilisateur
            $skillsToAttach = $skills->random(rand(2, 5));

            foreach ($skillsToAttach as $skill) {
                $user->skills()->attach($skill->id, [
                    'xp_total' => rand(10, 300),
                ]);
            }
        }
    }
}
