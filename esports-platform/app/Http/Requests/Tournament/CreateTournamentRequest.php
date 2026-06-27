<?php

namespace App\Http\Requests\Tournament;

use Illuminate\Foundation\Http\FormRequest;

class CreateTournamentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'game' => ['required', 'string', 'in:valorant'],
            'type' => ['nullable', 'string', 'in:single_elimination,double_elimination,round_robin,swiss'],
            'max_teams' => ['required', 'integer', 'in:2,4,8,16,32,64'],
            'entry_fee' => ['nullable', 'numeric', 'min:0'],
            'prize_pool' => ['nullable', 'numeric', 'min:0'],
            'prize_description' => ['nullable', 'string', 'max:1000'],
            'start_date' => ['required', 'date', 'after:now'],
            'registration_end_date' => ['nullable', 'date', 'before:start_date'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Turnuva adı zorunludur.',
            'max_teams.in' => 'Takım sayısı 2, 4, 8, 16, 32 veya 64 olmalıdır.',
            'max_teams.required' => 'Maksimum takım sayısı zorunludur.',
            'start_date.required' => 'Başlangıç tarihi zorunludur.',
            'start_date.after' => 'Başlangıç tarihi şu andan sonra olmalıdır.',
            'game.in' => 'Geçersiz oyun seçimi.',
        ];
    }
}
