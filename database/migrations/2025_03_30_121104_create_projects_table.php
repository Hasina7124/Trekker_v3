<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Connexion
    protected $connection = "pgsql";

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_admin')->constrained('users');
            $table->json('id_users')->nullable();
            $table->string('title');
            $table->string('description');
            $table->boolean('is_finished');
            $table->decimal('budget', total:8, places:2 );
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
