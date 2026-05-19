<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Platform;
use App\Models\Profile;
use App\Models\User;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_clients'       => User::where('role', 'client')->count(),
            'pending_orders'      => Order::where('status', 'pending')->count(),
            'approved_orders'     => Order::where('status', 'approved')->count(),
            'available_profiles'  => Profile::where('status', 'available')->count(),
            'occupied_profiles'   => Profile::where('status', 'occupied')->count(),
            'monthly_revenue'     => Order::where('status', 'approved')
                ->whereMonth('created_at', now()->month)
                ->sum('total_amount'),
        ];

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
                'hours_left' => now()->diffInHours($o->end_date),
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
                'created_at' => $o->created_at?->toDateTimeString(),
            ]);

        return response()->json(compact('stats', 'expiringSoon', 'recentOrders'));
    }
}
