<?php

namespace App\Models;

use App\Contracts\Files\FileServiceInterface;
use App\Enums\Gender;
use App\Enums\UserRole;
use App\Models\Concerns\Auditable;
use App\Notifications\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property bool $can_complete_orders
 * @property bool $is_root_account
 * @property bool $must_change_password
 * @property string|null $avatar
 * @property Gender|null $gender
 * @property int|null $birth_year
 * @property string|null $cmnd
 * @property string|null $preference
 * @property Carbon|null $last_login_at
 * @property string|null $last_login_ip
 * @property string|null $current_session_id
 * @property string|null $current_session_device
 * @property int|null $legacy_wp_id
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property string|null $created_by
 * @property string|null $updated_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'name',
    'email',
    'phone',
    'password',
    'role',
    'can_complete_orders',
    'is_root_account',
    'must_change_password',
    'avatar',
    'gender',
    'birth_year',
    'cmnd',
    'preference',
    'created_by',
    'updated_by',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use Auditable, HasFactory, HasUuids, Notifiable, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isRoot(): bool
    {
        return (bool) $this->is_root_account;
    }

    public function canCompleteOrders(): bool
    {
        return $this->isRoot() || ($this->isAdmin() && (bool) $this->can_complete_orders);
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification);
    }

    public function avatarUrl(): ?string
    {
        return app(FileServiceInterface::class)->url($this->avatar);
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'can_complete_orders' => 'boolean',
            'is_root_account' => 'boolean',
            'must_change_password' => 'boolean',
            'gender' => Gender::class,
            'birth_year' => 'integer',
            'legacy_wp_id' => 'integer',
        ];
    }
}
