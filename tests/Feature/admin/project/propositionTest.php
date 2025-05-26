<?php

use App\Models\Project;
use App\Models\ProjectProposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\post;
use function Pest\Laravel\get;
uses(RefreshDatabase::class);
use function Pest\Laravel\actingAs;


it('allows a different user to accept a proposal', function () {
    $proposer = User::factory()->create();
    $validator = User::factory()->create();

    $proposal = ProjectProposal::factory()->create([
        'proposer_id' => $proposer->id,
        'status' => 'pending',
    ]);

    $this->actingAs($validator);

    $response = post(route('proposal.accept', $proposal));

    $response->assertRedirect();
    expect($proposal->fresh()->status)->toBe('accepted');
    expect($proposal->fresh()->validator_id)->toBe($validator->id);
});


it('allows a user to create a proposal for a project', function () {
    // 1. Crée un projet avec l'utilisateur comme admin ou manager
    $user = User::factory()->create();
    $project = Project::factory()->create([
        'admin_id' => $user->id, // ou 'manager_id' => $user->id
    ]);

    $response = $this->actingAs($user)->post(route('proposal.store', $project), [
        'type' => 'goal',
        'value' => json_encode('Créer une plateforme intuitive'),
    ]);

    // 4. Vérifie que la création a réussi
    $response->assertStatus(200); // ou 302 pour une redirection
    $this->assertDatabaseHas('project_proposals', [
        'project_id' => $project->id,
        'proposer_id' => $user->id,
        'type' => 'goal',
    ]);
});

it('prevents a user from accepting their own proposal', function () {
    $user = User::factory()->create();

    $proposal = ProjectProposal::factory()->create([
        'proposer_id' => $user->id,
        'status' => 'pending',
    ]);

    actingAs($user);

    $response = post(route('proposal.accept', $proposal));
    $response->assertRedirect();
    $response->assertSessionHas('error', 'Tu ne peux pas accepter ta proposition');
});


it('returns project and proposals in show route', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();
    $proposal = ProjectProposal::factory()->create([
        'project_id' => $project->id,
    ]);

    actingAs($user);

    $response = get(route('proposal.show', $project));
    $response->assertOk();
    $response->assertJsonFragment([
        'id' => $project->id,
        'title' => $project->title,
    ]);
    $response->assertJsonFragment([
        'id' => $proposal->id,
        'value' => $proposal->value,
    ]);
});
