<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::withCount('orders');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%$s%")
                ->orWhere('email', 'like', "%$s%")
                ->orWhere('phone', 'like', "%$s%"));
        }

        return response()->json($query->latest()->get());
    }

    public function show(User $user)
    {
        return response()->json(
            $user->load(['orders.platform', 'orders.profile.masterAccount'])->loadCount('orders')
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'phone'    => 'required|string|max:20',
            'role'     => 'required|in:client,admin',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create($data);

        return response()->json($user, 201);
    }

    public function storeByPhone(Request $request)
    {
        $data = $request->validate([
            'name'  => 'nullable|string|max:255',
            'phone' => 'required|string|max:20|unique:users',
        ]);

        // Générer un mot de passe aléatoire lisible pour l'utilisateur
        $password = \Illuminate\Support\Str::random(8);

        $user = User::create([
            'name'     => $data['name'] ?? 'Client ' . $data['phone'],
            'email'    => 'phone_' . preg_replace('/\D/', '', $data['phone']) . '@flixger.local',
            'phone'    => $data['phone'],
            'role'     => 'client',
            'password' => $password, // hashé automatiquement par le cast 'hashed'
        ]);

        // Le mot de passe en clair est renvoyé une seule fois pour le message WhatsApp.
        return response()->json([
            'user'           => $user->loadCount('orders'),
            'plain_password' => $password,
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'phone'    => 'sometimes|string|max:20',
            'role'     => 'sometimes|in:client,admin',
            'password' => 'nullable|string|min:6',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user->fresh()->loadCount('orders'));
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        $user->delete();

        return response()->json(null, 204);
    }

    public function stats()
    {
        return response()->json([
            'total'   => User::count(),
            'admins'  => User::where('role', 'admin')->count(),
            'clients' => User::where('role', 'client')->count(),
        ]);
    }
}
