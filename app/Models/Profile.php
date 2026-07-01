<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Profile extends Model
{
    protected $fillable = ['master_account_id', 'profile_name', 'pin_code', 'status'];

    public function masterAccount(): BelongsTo
    {
        return $this->belongsTo(MasterAccount::class);
    }

    public function currentOrder(): HasOne
    {
        return $this->hasOne(Order::class)->where('status', 'approved')->latest();
    }
}
