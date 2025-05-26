<?php

use App\Models\ProjectObjective;
use App\Models\User;
use App\Models\Project;
use Inertia\Testing\AssertableInertia;
use function Pest\Laravel\{actingAs, post, put, delete, get};

it('permits an admin to create a project', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $manager = User::factory()->create(['role' => 'user']);

    actingAs($admin)
        ->post('admin/project', [
            'title' => 'Trekker',
            'description' => 'Une description claire et précise.',
            'manager_id' => $manager->id,
            'start_date' => '2026-01-01',
        ])
        ->assertRedirect('admin/project')
        ->assertSessionHas('success', 'Projet créé avec succès');

    expect(Project::where('title', 'Nouveau projet')->exists())->toBeTrue();
});
//
//it('allows an admin to update project fields', function () {
//
//    $admin = User::factory()->create(['role' => 'admin']);
//    $manager = User::factory()->create(['role' => 'user']);
//    $project = Project::factory()->create(['admin_id' => $admin->id]);
//
//    actingAs($admin)
//        ->put("admin/project/{$project->id}", [
//            'title' => 'Titre modifié',
//            'description' => 'Nouvelle description',
//            'manager_id' => $manager->id,
//        ])
//        ->assertRedirect();
//    $project->refresh();
//    expect($project->title)->toBe('Titre modifié');
//});

//it('affiche les détails d’un projet avec ses objectifs', function () {
//    // Arrange
//    $admin = User::factory()->create(['role' => 'admin']);
//    $project = Project::factory()->create([
//        'admin_id' => $admin->id,
//    ]);
//
//    $objective = ProjectObjective::factory()->create([
//        'project_id' => $project->id,
//        'user_id' => $admin->id,
//        'title' => 'Objectif Test',
//    ]);
//
//    // Act
//    $response = $this->actingAs($admin)->get(route('project.show', $project->id));
//    // Assert
//    $response->assertInertia(fn (AssertableInertia $page) =>
//    $page->component('admin/project/ProjectDetailPage')
//        ->has('project', fn ($p) =>
//        $p->where('id', $project->id)
//            ->where('title', $project->title)
//            ->has('objectives', 1, fn ($objective) =>
//            $objective->where('title', 'Objectif Test')->etc()
//            )
//            ->etc() // autorise d'autres clés dans project sans erreur
//        )
//    );
//});

it('returns projects for authenticated admin', function () {
   $admin = User::factory()->create(['role' => 'admin']);
   $user = User::factory()->create(['role' => 'user']);

   Project::factory()->count(10)->create(['admin_id' => $admin->id]);

   $response = actingAs($admin)->get(route('project.index'));

   dd($response->status());
   $response->assertOk();

   $response->assertInertia(
       fn ($page) => $page
           ->component('admin/project/ProjectsPage')
           ->has('projects.data', 6)
           ->where('filters', [
               'search' => null,
               'status' => null,
               'per_page' => 6,
           ])
           ->has('projects', fn ($page) => $page
               ->has('current_page')
               ->has('data')
               ->has('first_page_url')
               ->has('from')
               ->has('last_page')
               ->has('last_page_url')
               ->has('links')
               ->has('next_page_url')
               ->has('path')
               ->where('per_page', 6)
               ->has('prev_page_url')
               ->has('to')
               ->has('total')
           )
   );
});

//it('filters projects by search term', function () {
//    $admin = User::factory()->create(['role' => 'admin']);
//    $project = Project::factory()->create([
//        'admin_id' => $admin->id,
//        'title' => 'Projet Important',
//        'description' => 'Description du projet'
//    ]);
//
//    $this->actingAs($admin);
//
//    $response = $this->getget(route('project.index', ['search' => 'Important']));
//
//    $response->assertInertia(
//        fn ($page) => $page
//            ->has('projects.data', 1)
//            ->where('projects.data.0.title', 'Projet Important')
//            ->where('filters.search', 'Important')
//            ->where('filters.per_page', 6)
//    );
//});

//it('filters projects by status', function () {
//    $admin = User::factory()->create(['role' => 'admin']);
//    actingAs($admin); // ✅ dès maintenant
//
//    $activeProject = Project::factory()->create([
//        'title' => 'trekker',
//        'admin_id' => $admin->id,
//        'status' => 'active'
//    ]);
//
//    $pendingProject = Project::factory()->create([
//        'admin_id' => $admin->id,
//        'status' => 'pending'
//    ]);
//
//    $response = get(route('project.index', ['search' => 'trekker']));
//
//    dd($response->json());
//
//    $response->assertInertia(
//        fn ($page) => $page
//            ->has('projects.data', 1)
//            ->where('projects.data.0.status', 'active')
//            ->where('filters.status', 'active')
//    );
//});
// ... (les autres tests restent similaires, en changeant juste projects.index par project.index)
