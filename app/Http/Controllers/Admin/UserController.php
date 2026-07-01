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

            // Abonnement facultatif à créer et lier en même temps que le compte
            'subscription'              => 'nullable|array',
            'subscription.platform_id'  => 'required_with:subscription|exists:platforms,id',
            'subscription.profile_id'   => 'required_with:subscription|exists:profiles,id',
            'subscription.profile_name' => 'nullable|string|max:100',
            'subscription.pin_code'     => 'nullable|string|max:20',
            'subscription.start_date'   => 'required_with:subscription|date',
            'subscription.end_date'     => 'required_with:subscription|date|after_or_equal:subscription.start_date',
        ]);

        // Générer un mot de passe aléatoire lisible pour l'utilisateur
        $password = \Illuminate\Support\Str::random(8);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($data, $password) {
            $user = User::create([
                'name'     => $data['name'] ?? 'Client ' . $data['phone'],
                'email'    => 'phone_' . preg_replace('/\D/', '', $data['phone']) . '@flixger.local',
                'phone'    => $data['phone'],
                'role'     => 'client',
                'password' => $password, // hashé automatiquement par le cast 'hashed'
            ]);

            $subscriptionPayload = null;

            if (!empty($data['subscription'])) {
                $subscriptionPayload = $this->createSubscriptionFor($user, $data['subscription']);
            }

            // Le mot de passe en clair est renvoyé une seule fois pour le message WhatsApp.
            return response()->json([
                'user'           => $user->loadCount('orders'),
                'plain_password' => $password,
                'subscription'   => $subscriptionPayload,
            ], 201);
        });
    }

    /**
     * Crée un abonnement approuvé pour l'utilisateur en liant un profil disponible
     * de la plateforme choisie, et retourne les infos nécessaires au message WhatsApp.
     */
    private function createSubscriptionFor(User $user, array $sub): array
    {
        $profile = \App\Models\Profile::with('masterAccount')
            ->whereHas('masterAccount', fn($q) => $q->where('platform_id', $sub['platform_id']))
            ->findOrFail($sub['profile_id']);

        // Nommer le profil d'après le client (ou le nom personnalisé fourni par l'admin).
        $profile->profile_name = $sub['profile_name'] ?: $user->name;
        if (!empty($sub['pin_code'])) {
            $profile->pin_code = $sub['pin_code'];
        }
        $profile->status = 'occupied';
        $profile->save();

        $platform = \App\Models\Platform::findOrFail($sub['platform_id']);
        $start = \Illuminate\Support\Carbon::parse($sub['start_date']);
        $end   = \Illuminate\Support\Carbon::parse($sub['end_date']);
        $months = max(1, (int) round($start->diffInDays($end) / 30));

        $order = Order::create([
            'user_id'          => $user->id,
            'platform_id'      => $platform->id,
            'profile_id'       => $profile->id,
            'duration_months'  => $months,
            'total_amount'     => $platform->price_per_month * $months,
            'status'           => 'approved',
            'payment_verified' => true,
            'start_date'       => $start->toDateString(),
            'end_date'         => $end->toDateString(),
        ]);

        return [
            'order_id'         => $order->id,
            'platform_name'    => $platform->name,
            'account_email'    => $profile->masterAccount->email,
            'account_password' => $profile->masterAccount->password,
            'profile_name'     => $profile->profile_name,
            'pin_code'         => $profile->pin_code,
            'start_date'       => $order->start_date->toDateString(),
            'end_date'         => $order->end_date->toDateString(),
        ];
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
        // Empêcher la suppression du dernier administrateur pour ne pas
        // verrouiller totalement l'accès à l'espace d'administration.
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json([
                'message' => 'Impossible de supprimer le dernier compte administrateur.',
            ], 422);
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
