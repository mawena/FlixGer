<?php

namespace App\Http\Controllers;

use App\Models\Platform;
use Illuminate\Http\Request;

class PlatformController extends Controller
{
    public function index()
    {
        $platforms = Platform::where('active', true)->get()->map(function ($p) {
            return [
                'id'                     => $p->id,
                'name'                   => $p->name,
                'logo_url'               => $p->logo_url,
                'price_per_month'        => $p->price_per_month,
                'available_profiles'     => $p->availableProfilesCount(),
            ];
        });

        return response()->json($platforms);
    }
}
