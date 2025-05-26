<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use App\Models\Module;
use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un utilisateur admin et un manager si nécessaire
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'phone' => '0123456789',
                'adress' => 'Adresse admin',
                'experience' => 5
            ]
        );

        $manager = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'Manager',
                'password' => bcrypt('password'),
                'role' => 'manager',
                'phone' => '0123456789',
                'adress' => 'Adresse manager',
                'experience' => 3
            ]
        );

        // Créer quelques développeurs
        $dev1 = User::firstOrCreate(
            ['email' => 'dev1@example.com'],
            [
                'name' => 'Développeur 1',
                'password' => bcrypt('password'),
                'role' => 'developer',
                'phone' => '0123456789',
                'adress' => 'Adresse dev 1',
                'experience' => 2
            ]
        );

        $dev2 = User::firstOrCreate(
            ['email' => 'dev2@example.com'],
            [
                'name' => 'Développeur 2',
                'password' => bcrypt('password'),
                'role' => 'developer',
                'phone' => '0123456789',
                'adress' => 'Adresse dev 2',
                'experience' => 1
            ]
        );

        // Créer des projets
        $projects = [
            [
                'title' => 'Plateforme E-commerce',
                'description' => 'Développement d\'une plateforme e-commerce complète',
                'status' => 'active',
                'progress' => 65,
                'budget' => 25000,
                'start_date' => '2024-03-01',
                'end_date' => '2024-06-30'
            ],
            [
                'title' => 'Application Mobile',
                'description' => 'Développement d\'une application mobile de livraison',
                'status' => 'pending',
                'progress' => 0,
                'budget' => 15000,
                'start_date' => '2024-04-01',
                'end_date' => '2024-07-31'
            ],
            [
                'title' => 'Site Web Vitrine',
                'description' => 'Création d\'un site web vitrine pour une entreprise',
                'status' => 'completed',
                'progress' => 100,
                'budget' => 8000,
                'start_date' => '2024-01-01',
                'end_date' => '2024-02-28'
            ]
        ];

        foreach ($projects as $projectData) {
            $project = Project::create(array_merge($projectData, [
                'admin_id' => $admin->id,
                'manager_id' => $manager->id
            ]));

            // Ajouter les développeurs au projet
            $project->devs()->attach([$dev1->id, $dev2->id]);

            // Créer des modules pour chaque projet
            $modules = [
                [
                    'title' => 'Analyse des besoins',
                    'description' => 'Analyse détaillée des besoins du client',
                    'xp_rewards' => 100,
                    'duration_hours' => 40,
                    'status' => 'completed',
                    'completed' => true
                ],
                [
                    'title' => 'Développement Frontend',
                    'description' => 'Développement de l\'interface utilisateur',
                    'xp_rewards' => 200,
                    'duration_hours' => 80,
                    'status' => 'unlocked',
                    'completed' => false
                ]
            ];

            foreach ($modules as $moduleData) {
                $module = $project->modules()->create($moduleData);

                // Créer des tâches pour chaque module
                $tasks = [
                    [
                        'name' => 'Réunion de cadrage',
                        'description' => 'Réunion initiale avec le client',
                        'status' => 'validé',
                        'estimated_hours' => 2,
                        'amount' => 200,
                        'assignee_id' => $dev1->id
                    ],
                    [
                        'name' => 'Documentation technique',
                        'description' => 'Rédaction de la documentation technique',
                        'status' => 'en-cours',
                        'estimated_hours' => 8,
                        'amount' => 800,
                        'assignee_id' => $dev2->id
                    ]
                ];

                foreach ($tasks as $taskData) {
                    $module->tasks()->create($taskData);
                }
            }
        }
    }
}
