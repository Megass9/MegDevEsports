<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class CreateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:teams,name'],
            'description' => ['nullable', 'string', 'max:1000'],
            'game' => ['required', 'string', 'in:valorant'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Takım adı zorunludur.',
            'name.unique' => 'Bu takım adı zaten kullanılıyor.',
            'name.max' => 'Takım adı en fazla 255 karakter olabilir.',
            'game.in' => 'Geçersiz oyun seçimi.',
        ];
    }
}
