<?php

namespace Database\Seeders;

use App\Models\ProjectProposal;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectProposalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProjectProposal::factory()->count(50)->create();
    }
}
