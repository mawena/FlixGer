<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Profile;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        // Libérer automatiquement les profils dont la commande est expirée
        $this->releaseExpiredProfiles();

        $stats = [
            'total_clients'      => User::where('role', 'client')->count(),
            'pending_orders'     => Order::where('status', 'pending')->count(),
            'approved_orders'    => Order::where('status', 'approved')->whereDate('end_date', '>=', now())->count(),
            'expired_orders'     => Order::where('status', 'approved')->whereDate('end_date', '<', now())->count(),
            'available_profiles' => Profile::where('status', 'available')->count(),
            'occupied_profiles'  => Profile::where('status', 'occupied')->count(),
            'monthly_revenue'    => Order::where('status', 'approved')
                ->whereMonth('created_at', now()->month)
                ->sum('total_amount'),
        ];

        // Commandes qui expirent dans moins de 48h (futures)
        $expiringSoon = Order::where('status', 'approved')
            ->whereBetween('end_date', [now(), now()->addHours(48)])
            ->with(['user', 'platform', 'profile'])
            ->get()
            ->map(fn($o) => [
                'id'         => $o->id,
                'client'     => $o->user->name,
                'platform'   => $o->platform->name,
                'profile'    => $o->profile?->profile_name,
                'end_date'   => $o->end_date?->toDateString(),
                'hours_left' => (int) now()->diffInHours($o->end_date, false),
                'expired'    => false,
            ]);

        // Commandes expirées depuis moins de 7 jours (pour action admin)
        $recentlyExpired = Order::where('status', 'approved')
            ->whereBetween('end_date', [now()->subDays(7), now()])
            ->with(['user', 'platform', 'profile'])
            ->get()
            ->map(fn($o) => [
                'id'         => $o->id,
                'client'     => $o->user->name,
                'platform'   => $o->platform->name,
                'profile'    => $o->profile?->profile_name,
                'end_date'   => $o->end_date?->toDateString(),
                'hours_left' => (int) now()->diffInHours($o->end_date, false),
                'expired'    => true,
            ]);

        $recentOrders = Order::with(['user', 'platform'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($o) => [
                'id'         => $o->id,
                'client'     => $o->user->name,
                'platform'   => $o->platform->name,
                'amount'     => $o->total_amount,
                'status'     => $o->status,
                'end_date'   => $o->end_date?->toDateString(),
                'is_expired' => $o->end_date && $o->end_date->isPast(),
                'created_at' => $o->created_at?->toDateTimeString(),
            ]);

        return response()->json(compact('stats', 'expiringSoon', 'recentlyExpired', 'recentOrders'));
    }

    private function releaseExpiredProfiles(): void
    {
        // Libère les profils dont toutes les commandes approuvées ont expiré
        Profile::where('status', 'occupied')
            ->whereDoesntHave('currentOrder', fn($q) => $q->whereDate('end_date', '>=', now()))
            ->update(['status' => 'available']);
    }
}
