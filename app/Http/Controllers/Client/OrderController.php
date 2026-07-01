<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Platform;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['platform', 'profile.masterAccount'])
            ->latest()
            ->get()
            ->map(fn($o) => $this->formatOrder($o));

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'platform_id'           => 'required|exists:platforms,id',
            'duration_months'       => 'required|integer|in:1,3,6,12',
            'transaction_reference' => 'required|string|max:255',
            'payment_screenshot'    => 'required|file|image|max:5120',
        ]);

        $platform = Platform::findOrFail($data['platform_id']);
        $totalAmount = $platform->price_per_month * $data['duration_months'];

        $screenshotPath = $request->file('payment_screenshot')
            ->store('payment_screenshots', 'public');

        $order = Order::create([
            'user_id'               => $request->user()->id,
            'platform_id'           => $data['platform_id'],
            'duration_months'       => $data['duration_months'],
            'total_amount'          => $totalAmount,
            'transaction_reference' => $data['transaction_reference'],
            'payment_screenshot'    => $screenshotPath,
            'status'                => 'pending',
        ]);

        return response()->json($this->formatOrder($order->load('platform')), 201);
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($this->formatOrder($order->load(['platform', 'profile.masterAccount'])));
    }

    private function formatOrder(Order $order): array
    {
        $data = [
            'id'                    => $order->id,
            'platform'              => $order->platform ? [
                'id'       => $order->platform->id,
                'name'     => $order->platform->name,
                'logo_url' => $order->platform->logo_url,
            ] : null,
            'duration_months'       => $order->duration_months,
            'total_amount'          => $order->total_amount,
            'transaction_reference' => $order->transaction_reference,
            'status'                => $order->status,
            'start_date'            => $order->start_date?->toDateString(),
            'end_date'              => $order->end_date?->toDateString(),
            'reject_reason'         => $order->reject_reason,
            'created_at'            => $order->created_at?->toDateTimeString(),
        ];

        if ($order->status === 'approved' && $order->profile) {
            $data['access'] = [
                'email'        => $order->profile->masterAccount->email,
                'password'     => $order->profile->masterAccount->password,
                'profile_name' => $order->profile->profile_name,
                'pin_code'     => $order->profile->pin_code,
            ];
        }

        return $data;
    }
}
