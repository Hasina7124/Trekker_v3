<?php

namespace Database\Seeders;

use App\Models\Skill;
use App\Models\skill_categories;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Design' => ['UX Designer', 'UI Designer', 'Prototypage'],
            'Frontend' => ['React', 'Vue.js', 'TailwindCSS', 'HTML/CSS'],
            'Backend' => ['Laravel', 'Node.js', 'REST API', 'GraphQL'],
            'DevOps' => ['Docker', 'CI/CD', 'Linux'],
            'Architecture' => ['Software Architecture', 'TDD', 'Clean Code'],
            'Collaboration' => ['Git', 'Documentation', 'Communication']
        ];

        foreach ($categories as $categoryName => $skills) {
            $category = skill_categories::create(['name' => $categoryName]);

            foreach ($skills as $skill) {
                Skill::create([
                    'name' => $skill,
                    'skill_category_id' => $category->id,
                ]);
            }
        }
    }
}
