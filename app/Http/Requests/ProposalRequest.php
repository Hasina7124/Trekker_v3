<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProposalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_id'    => 'sometimes|integer|exists:projects,id',
            'proposer_id'   => 'sometimes|integer|exists:users,id',
            'type'         => 'sometimes|in:goal,budget,start_date,end_date',
            'value'         => 'sometimes|string',
            'status'        => 'sometimes|in:pending,approved,rejected',
            'validator_id'  => 'nullable|integer|exists:users,id',
            'validated_at'  => 'nullable|date'
        ];
    }
}
