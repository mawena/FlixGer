<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Profile;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'platform', 'profile'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function show(Order $order)
    {
        return response()->json($order->load(['user', 'platform', 'profile.masterAccount']));
    }

    public function approve(Request $request, Order $order)
    {
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Order is not pending'], 422);
        }

        $profile = Profile::whereHas('masterAccount', fn($q) => $q->where('platform_id', $order->platform_id))
            ->where('status', 'available')
            ->first();

        if (!$profile) {
            return response()->json(['message' => 'No available profiles for this platform'], 422);
        }

        $start = Carbon::now();
        $end   = $start->copy()->addMonths($order->duration_months);

        $profile->update(['status' => 'occupied']);

        $order->update([
            'status'           => 'approved',
            'profile_id'       => $profile->id,
            'payment_verified' => true,
            'start_date'       => $start->toDateString(),
            'end_date'         => $end->toDateString(),
        ]);

        return response()->json($order->load(['user', 'platform', 'profile.masterAccount']));
    }

    public function reject(Request $request, Order $order)
    {
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Order is not pending'], 422);
        }

        $data = $request->validate([
            'reject_reason' => 'nullable|string|max:500',
        ]);

        $order->update([
            'status'        => 'rejected',
            'reject_reason' => $data['reject_reason'] ?? null,
        ]);

        return response()->json($order->load(['user', 'platform']));
    }

    public function markVerified(Order $order)
    {
        $order->update(['payment_verified' => true]);

        return response()->json($order);
    }

    public function screenshot(Order $order)
    {
        if (!$order->payment_screenshot || !Storage::disk('public')->exists($order->payment_screenshot)) {
            return response()->json(['message' => 'Screenshot not found'], 404);
        }

        return response()->file(Storage::disk('public')->path($order->payment_screenshot));
    }
}
