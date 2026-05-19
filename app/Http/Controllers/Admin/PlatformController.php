<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use Illuminate\Http\Request;

class PlatformController extends Controller
{
    public function index()
    {
        return response()->json(Platform::withCount(['masterAccounts', 'orders'])->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:100',
            'logo_url'        => 'nullable|string|max:500',
            'price_per_month' => 'required|numeric|min:0',
            'active'          => 'boolean',
        ]);

        return response()->json(Platform::create($data), 201);
    }

    public function show(Platform $platform)
    {
        return response()->json($platform->load('masterAccounts.profiles'));
    }

    public function update(Request $request, Platform $platform)
    {
        $data = $request->validate([
            'name'            => 'sometimes|string|max:100',
            'logo_url'        => 'nullable|string|max:500',
            'price_per_month' => 'sometimes|numeric|min:0',
            'active'          => 'boolean',
        ]);

        $platform->update($data);

        return response()->json($platform);
    }

    public function destroy(Platform $platform)
    {
        $platform->delete();

        return response()->json(null, 204);
    }
}
