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
        Schema::create('proof_validations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('proof_id')->nullable();
            $table->foreign('proof_id')->references('id')->on('proofs')->onDelete('set null');
            $table->unsignedBigInteger('validated_by_user')->nullable();
            $table->foreign('validated_by_user')->references('id')->on('users')->onDelete('set null');
            $table->boolean('is_valid');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proof_validations');
    }
};
