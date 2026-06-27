<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Season;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@esports.com',
            'password' => Hash::make('password'),
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        Season::create([
            'name' => 'Season 1 - 2026',
            'description' => 'Valorant Esports Platform inaugural season',
            'is_active' => true,
            'start_date' => now(),
            'end_date' => now()->addMonths(3),
        ]);

        $this->command->info('Admin user created: admin@esports.com / password');
        $this->command->info('Season 1 created and set as active.');
    }
}
