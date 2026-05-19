<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $query = Profile::with(['masterAccount.platform', 'currentOrder.user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('platform_id')) {
            $query->whereHas('masterAccount', fn($q) => $q->where('platform_id', $request->platform_id));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'master_account_id' => 'required|exists:master_accounts,id',
            'profile_name'      => 'required|string|max:100',
            'pin_code'          => 'nullable|string|max:20',
        ]);

        return response()->json(Profile::create($data), 201);
    }

    public function update(Request $request, Profile $profile)
    {
        $data = $request->validate([
            'profile_name' => 'sometimes|string|max:100',
            'pin_code'     => 'nullable|string|max:20',
            'status'       => 'sometimes|in:available,occupied',
        ]);

        $profile->update($data);

        return response()->json($profile->load('masterAccount.platform'));
    }

    public function destroy(Profile $profile)
    {
        $profile->delete();

        return response()->json(null, 204);
    }
}
