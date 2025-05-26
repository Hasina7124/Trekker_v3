<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectProposal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ProjectAndProposalSeeder extends Seeder
{
    public function run(): void
    {
        $projectsPath = database_path('data/data_projects.json');
        $proposalsPath = database_path('data/data_proposals.json');

        if (!File::exists($projectsPath) || !File::exists($proposalsPath)) {
            $this->command->error('❌ Les fichiers JSON n\'existent pas dans le dossier `database/data/`.');
            return;
        }

        $projects = json_decode(File::get($projectsPath), true);
        $proposals = json_decode(File::get($proposalsPath), true);

        foreach ($projects as $projectData) {
            if (isset($projectData['budget'])) {
                // Nettoyage : suppression des virgules et conversion en float
                $projectData['budget'] = floatval(str_replace(',', '', $projectData['budget']));
            }

            Project::create($projectData);
        }

        foreach ($proposals as $proposalData) {
            if (isset($proposalData['budget'])) {
                $proposalData['budget'] = floatval(str_replace(',', '', $proposalData['budget']));
            }

            ProjectProposal::create($proposalData);
        }

        $this->command->info('✅ Projets et propositions importés avec succès.');

    }
}
