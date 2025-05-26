<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\Group;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            UserSeeder::class,
            ProjectAndProposalSeeder::class,
        ]);
        DB::statement("SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects))");
        DB::statement("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");

       User::factory()->create([
           'name' => 'RAHARISON Miharififaliana Hasina',
           'email' => 'raharisonmiharififalianahasina@gmail.com',
           'phone' => '034 59 426 51',
           'adress' => 'itaosy avarabohitra',
           'password' => bcrypt('administrateur'),
           'is_admin' => true,
           'role' => 'admin'
       ]);
//         User::factory()->create([
//             'name' => 'Andriamihariana Elie',
//             'email' => 'andriamiharianaelie@gmail.com',
//             'phone' => '034 56 795 13',
//             'adress' => 'Ankadimbahoaka',
//             'password' => bcrypt('andriamiharianaelie'),
//             'is_admin' => true
//         ]);
//
//        $this->call(SkillSeeder::class);
//        $this->call(SkillUserSeeder::class);
//        $this->call(ProjectSeeder::class);
//
//        User::factory(10)->create();
//
//        $owner = User::inRandomOrder()->first(); // ou un admin si tu veux
//
//        for ($i = 0; $i < 5; $i++) {
//            $group = Group::factory()->create([
//                'owner_id' => $owner->id,
//            ]);
//
//            $users = User::inRandomOrder()->limit(rand(2,5))->pluck('id');
//            $group->users()->attach(array_unique([$owner->id, ...$users]));
//        }
//
//
//        Message::factory(1000)->create();
//         $messages = Message::whereNull('group_id')->orderBy('created_at')->get();
//
//         $conversations = $messages->groupBy(function ($message) {
//             return collect([$message->sender_id, $message->receiver_id])
//             ->sort()->implode('_');
//         })->map(function($groupedMessages) {
//             return [
//                 'user_id1' => $groupedMessages->first()->sender_id,
//                 'user_id2' => $groupedMessages->first()->receiver_id,
//                 'last_message_id' => $groupedMessages->last()->id,
//                 'created_at' => new Carbon(),
//                 'updated_at' => new Carbon(),
//             ];
//         })->values();
//
//         Conversation::insertOrIgnore($conversations->toArray());
    }
}
