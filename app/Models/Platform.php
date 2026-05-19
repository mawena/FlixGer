<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Platform extends Model
{
    protected $fillable = ['name', 'logo_url', 'price_per_month', 'active'];

    protected function casts(): array
    {
        return [
            'price_per_month' => 'float',
            'active' => 'boolean',
        ];
    }

    public function masterAccounts(): HasMany
    {
        return $this->hasMany(MasterAccount::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function availableProfilesCount(): int
    {
        return Profile::whereHas('masterAccount', fn($q) => $q->where('platform_id', $this->id))
            ->where('status', 'available')
            ->count();
    }
}
