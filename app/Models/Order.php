<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'platform_id', 'profile_id', 'duration_months',
        'total_amount', 'payment_screenshot', 'transaction_reference',
        'status', 'payment_verified', 'start_date', 'end_date', 'reject_reason',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'float',
            'payment_verified' => 'boolean',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function isExpiringSoon(): bool
    {
        return $this->end_date && $this->end_date->diffInHours(now()) <= 48 && $this->end_date->isFuture();
    }
}
