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
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['group_id']);

            $table->unsignedBigInteger('group_id')->nullable()->change();

            $table->foreign('group_id')
                ->references('id')
                ->on('groups')
                ->onDelete('set null'); // ou 'cascade' selon ton besoin
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
