<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterAccount extends Model
{
    protected $fillable = ['platform_id', 'email', 'password', 'status', 'notes'];

    protected $hidden = [];

    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }

    public function profiles(): HasMany
    {
        return $this->hasMany(Profile::class);
    }
}
