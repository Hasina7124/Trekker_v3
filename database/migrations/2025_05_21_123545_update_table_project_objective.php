<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projectObjective', function (Blueprint $table) {
            $table->dropColumn('title');
        });

        Schema::table('projectObjective', function (Blueprint $table) {
            $table->renameColumn('user_id', 'proposer_id');
        });

        Schema::table('projectObjective', function (Blueprint $table) {
            $table->enum('type', ['objective', 'budget', 'start_date', 'end_date']);
            $table->json('value')->nullable();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
