<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'riot_id' => ['sometimes', 'string', 'max:100', 'unique:users,riot_id,'.$this->user()->id],
        ];
    }

    public function messages(): array
    {
        return [
            'name.max' => 'İsim en fazla 255 karakter olabilir.',
            'riot_id.unique' => 'Bu Riot ID zaten kullanılıyor.',
        ];
    }
}
