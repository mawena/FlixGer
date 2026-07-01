<?php

namespace Database\Seeders;

use App\Models\Platform;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@flixger.tg'], [
            'name'     => 'Administrateur',
            'phone'    => '90000000',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        User::firstOrCreate(['email' => 'client@flixger.tg'], [
            'name'     => 'Client Test',
            'phone'    => '91000001',
            'password' => Hash::make('password'),
            'role'     => 'client',
        ]);

        $platforms = [
            ['name' => 'Netflix',      'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', 'price_per_month' => 2500],
            ['name' => 'Spotify',      'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg', 'price_per_month' => 1500],
            ['name' => 'Disney+',      'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', 'price_per_month' => 2000],
            ['name' => 'Prime Video',  'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png', 'price_per_month' => 2000],
        ];

        foreach ($platforms as $p) {
            Platform::firstOrCreate(['name' => $p['name']], $p);
        }
    }
}
