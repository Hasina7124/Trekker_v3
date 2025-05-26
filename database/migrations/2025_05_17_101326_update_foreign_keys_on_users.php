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
        Schema::table('conversations', function (Blueprint $table) {
            // Supprimer les anciennes contraintes si elles existent
            $table->dropForeign(['user_id2']);
            $table->dropForeign(['user_id1']);

            // Redéfinir les contraintes sans recréer les colonnes
            $table->foreign('user_id2')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('user_id1')->references('id')->on('users')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            //
        });
    }
};
