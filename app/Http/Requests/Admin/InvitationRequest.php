<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class InvitationRequest extends FormRequest
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
            'email' => ['required', 'string', 'email', 'unique:App\Models\User, email'],
        ];
    }

    /**
     *  Attempt to send invitation
     * 
     * @throws \Illuminate\Validation\ValidationException
     */

    //  public function invite() : void
    //  {
    //     if()
    //  }
    

}
