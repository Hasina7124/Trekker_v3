<?php

use App\Models\Project;
use App\Models\ProjectObjective;
use App\Models\User;

it('permits a user to add an objective', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $project = Project::factory()->create(['admin_id' => $admin->id]);

    $this->actingAs($admin)
        ->post("projects/{$project->id}/objectives", [
            'title' => 'Objectif initial',
        ])
        ->assertRedirect();

    expect($project->objectives()->where('title', 'Objectif initial')->exists())->toBeTrue();
});

it('allows a user to update their objective', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();
    $objective = ProjectObjective::factory()->create([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'title' => 'Ancien titre',
    ]);

    $response = $this->actingAs($user)
        ->put("objectives/{$objective->id}", [
            'title' => 'Titre mis à jour',
        ])
        ->assertRedirect();
    dump($response->status());

    $objective->refresh(); // Recharge les données depuis la base

    expect($objective->title)->toBe('Titre mis à jour');
});


it('permet de proposer une amélioration d’un objectif', function () {
    $user = User::factory()->create();
    $parent = ProjectObjective::factory()->create();

    $this->actingAs($user)
        ->post("objectives/{$parent->id}/improve", [
            'title' => 'Amélioration proposée',
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Amélioration proposée');

    $this->assertDatabaseHas('projectObjective', [
        'title' => 'Amélioration proposée',
        'id_parent' => $parent->id,
        'user_id' => $user->id,
    ]);
});


it('permet de supprimer un objectif', function () {
    $user = User::factory()->create();
    $objective = ProjectObjective::factory()->create();

    $this->actingAs($user)
        ->delete("/objectives/{$objective->id}")
        ->assertRedirect()
        ->assertSessionHas('success', 'Objectif supprimé');

    $this->assertDatabaseMissing('projectObjective', [
        'id' => $objective->id,
    ]);
});
