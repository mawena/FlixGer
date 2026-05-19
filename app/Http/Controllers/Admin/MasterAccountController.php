<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterAccount;
use App\Models\Profile;
use Illuminate\Http\Request;

class MasterAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = MasterAccount::with(['platform', 'profiles'])
            ->withCount('profiles');

        if ($request->filled('platform_id')) {
            $query->where('platform_id', $request->platform_id);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'platform_id' => 'required|exists:platforms,id',
            'email'       => 'required|email',
            'password'    => 'required|string',
            'status'      => 'in:active,expired',
            'notes'       => 'nullable|string',
            'nb_profiles' => 'nullable|integer|min:1|max:10',
        ]);

        $account = MasterAccount::create($data);

        if (!empty($data['nb_profiles'])) {
            for ($i = 1; $i <= $data['nb_profiles']; $i++) {
                Profile::create([
                    'master_account_id' => $account->id,
                    'profile_name'      => "Profil $i",
                    'status'            => 'available',
                ]);
            }
        }

        return response()->json($account->load('profiles'), 201);
    }

    // Paramètre nommé $account pour correspondre au {account} de la route apiResource
    public function show(MasterAccount $account)
    {
        return response()->json($account->load(['platform', 'profiles']));
    }

    public function update(Request $request, MasterAccount $account)
    {
        $data = $request->validate([
            'email'    => 'sometimes|email',
            'password' => 'sometimes|string',
            'status'   => 'sometimes|in:active,expired',
            'notes'    => 'nullable|string',
        ]);

        $account->update($data);

        return response()->json($account->load('profiles'));
    }

    public function destroy(MasterAccount $account)
    {
        $account->delete();

        return response()->json(null, 204);
    }
}
