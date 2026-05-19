<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlatformController;
use App\Http\Controllers\Client\OrderController as ClientOrderController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PlatformController as AdminPlatformController;
use App\Http\Controllers\Admin\MasterAccountController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/platforms', [PlatformController::class, 'index']);

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Client routes
    Route::prefix('client')->group(function () {
        Route::get('/orders', [ClientOrderController::class, 'index']);
        Route::post('/orders', [ClientOrderController::class, 'store']);
        Route::get('/orders/{order}', [ClientOrderController::class, 'show']);
    });

    // Admin routes
    Route::prefix('admin')->middleware('can:manage,all')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::apiResource('platforms', AdminPlatformController::class);
        Route::apiResource('accounts', MasterAccountController::class);
        Route::apiResource('profiles', ProfileController::class)->except(['show']);

        Route::get('/users/stats', [UserController::class, 'stats']);
        Route::apiResource('users', UserController::class);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
        Route::post('/orders/{order}/approve', [AdminOrderController::class, 'approve']);
        Route::post('/orders/{order}/reject', [AdminOrderController::class, 'reject']);
        Route::post('/orders/{order}/verify', [AdminOrderController::class, 'markVerified']);
        Route::get('/orders/{order}/screenshot', [AdminOrderController::class, 'screenshot']);
    });
});
