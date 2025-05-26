<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectProposal>
 */
class ProjectProposalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'proposer_id' => function (array $attributes) {
                $project = Project::find($attributes['project_id']);
                return $this->faker->randomElement([
                    $project->admin_id,
                    $project->manager_id
                ]);
            },
            'type' => $this->faker->randomElement(['budget', 'start_date', 'end_date']),
            'value' => $this->faker->word,
            'status' => $this->faker->randomElement(['pending', 'accepted', 'rejected']),
            'validator_id' => function (array $attributes) {
                // Ne pas valider si le statut est 'pending'
                if ($attributes['status'] === 'pending') {
                    return null;
                }

                $project = Project::find($attributes['project_id']);
                $proposerId = $attributes['proposer_id'];

                // Prendre l'autre rôle (si proposer est admin, prendre manager, et vice versa)
                if ($proposerId === $project->admin_id) {
                    return $project->manager_id;
                }

                return $project->admin_id;
            },
            'validated_at' => function (array $attributes) {
                return $attributes['status'] === 'pending'
                    ? null
                    : $this->faker->dateTimeBetween('-1 month', 'now');
            },
        ];
    }
}
