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
        Schema::dropIfExists('project_user');
        Schema::dropIfExists('project_specs');
        Schema::dropIfExists('project_proposals');

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
