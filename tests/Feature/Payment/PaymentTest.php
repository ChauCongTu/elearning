<?php

use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\User;

/**
 * @return array{user: User, course: Course}
 */
function createPaymentFixtures(): array
{
    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam-payment',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa thanh toán',
        'slug' => 'khoa-thanh-toan',
        'price' => 1_500_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $user = User::factory()->create(['role' => UserRole::Student]);

    return compact('user', 'course');
}

function configureSePayForTests(): void
{
    config([
        'sepay.webhook_api_key' => 'test-webhook-key',
        'sepay.bank_code' => 'Vietcombank',
        'sepay.bank_name' => 'Ngân hàng TMCP Ngoại Thương Việt Nam',
        'sepay.account_number' => '0010000000355',
        'sepay.account_name' => 'HOC VIEN BONG NHAI TRANG',
        'sepay.payment_expiry_minutes' => 15,
        'sepay.order_code_prefix' => 'ELN',
    ]);
}

/**
 * @return array<string, mixed>
 */
function sepayWebhookPayload(string $orderCode, int $amount, int $transactionId = 92704): array
{
    return [
        'id' => $transactionId,
        'gateway' => 'Vietcombank',
        'transactionDate' => now()->format('Y-m-d H:i:s'),
        'accountNumber' => '0010000000355',
        'subAccount' => '',
        'code' => $orderCode,
        'content' => "{$orderCode} thanh toan khoa hoc",
        'transferType' => 'in',
        'description' => 'NGUYEN VAN A chuyen tien',
        'transferAmount' => $amount,
        'accumulated' => 10_000_000,
        'referenceCode' => 'REF123',
    ];
}

beforeEach(function () {
    configureSePayForTests();
});

test('authenticated user can create pending order with unique code', function () {
    ['user' => $user, 'course' => $course] = createPaymentFixtures();

    $response = $this->actingAs($user)->post(route('checkout.store', $course->slug));

    $response->assertRedirect();

    $order = Order::query()->first();

    expect($order)->not->toBeNull()
        ->and($order->status)->toBe(OrderStatus::Pending)
        ->and($order->code)->toStartWith('ELN'.now()->format('Ymd'))
        ->and((int) $order->amount)->toBe(1_500_000)
        ->and($order->expires_at)->not->toBeNull()
        ->and($order->expires_at->greaterThan(now()->addMinutes(14)))->toBeTrue()
        ->and($order->expires_at->lessThanOrEqualTo(now()->addMinutes(15)))->toBeTrue();
});

test('guest cannot checkout', function () {
    ['course' => $course] = createPaymentFixtures();

    $this->post(route('checkout.store', $course->slug))
        ->assertRedirect(route('login'));
});

test('valid webhook creates enrollment', function () {
    ['user' => $user, 'course' => $course] = createPaymentFixtures();

    $this->actingAs($user)->post(route('checkout.store', $course->slug));

    $order = Order::query()->firstOrFail();

    $this->postJson(route('webhooks.sepay'), sepayWebhookPayload($order->code, 1_500_000), [
        'Authorization' => 'Apikey test-webhook-key',
    ])->assertOk()->assertJson(['success' => true]);

    $order->refresh();

    expect($order->status)->toBe(OrderStatus::Paid)
        ->and($order->sepay_transaction_id)->toBe('92704');

    $enrollment = Enrollment::query()
        ->where('user_id', $user->id)
        ->where('course_id', $course->id)
        ->first();

    expect($enrollment)->not->toBeNull()
        ->and($enrollment->status)->toBe(EnrollmentStatus::Active)
        ->and($enrollment->source)->toBe(EnrollmentSource::Purchase);
});

test('duplicate webhook transaction does not duplicate enrollment', function () {
    ['user' => $user, 'course' => $course] = createPaymentFixtures();

    $this->actingAs($user)->post(route('checkout.store', $course->slug));

    $order = Order::query()->firstOrFail();
    $headers = ['Authorization' => 'Apikey test-webhook-key'];
    $payload = sepayWebhookPayload($order->code, 1_500_000, 555001);

    $this->postJson(route('webhooks.sepay'), $payload, $headers)->assertOk();
    $this->postJson(route('webhooks.sepay'), $payload, $headers)->assertOk();

    expect(Enrollment::query()->where('user_id', $user->id)->where('course_id', $course->id)->count())->toBe(1)
        ->and($order->fresh()->payments()->count())->toBe(1);
});

test('webhook with wrong amount is rejected', function () {
    ['user' => $user, 'course' => $course] = createPaymentFixtures();

    $this->actingAs($user)->post(route('checkout.store', $course->slug));

    $order = Order::query()->firstOrFail();

    $this->postJson(route('webhooks.sepay'), sepayWebhookPayload($order->code, 1_000_000), [
        'Authorization' => 'Apikey test-webhook-key',
    ])->assertStatus(422);

    expect($order->fresh()->status)->toBe(OrderStatus::Pending)
        ->and(Enrollment::query()->count())->toBe(0);
});

test('webhook without valid api key is unauthorized', function () {
    ['user' => $user, 'course' => $course] = createPaymentFixtures();

    $this->actingAs($user)->post(route('checkout.store', $course->slug));

    $order = Order::query()->firstOrFail();

    $this->postJson(route('webhooks.sepay'), sepayWebhookPayload($order->code, 1_500_000), [
        'Authorization' => 'Apikey wrong-key',
    ])->assertUnauthorized();
});

test('user cannot checkout course they already own', function () {
    ['user' => $user, 'course' => $course] = createPaymentFixtures();

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'source' => EnrollmentSource::Purchase,
        'enrolled_at' => now(),
        'progress_percent' => 0,
    ]);

    $this->actingAs($user)
        ->post(route('checkout.store', $course->slug))
        ->assertRedirect(route('courses.show', $course->slug))
        ->assertSessionHas('error');

    expect(Order::query()->count())->toBe(0);
});

test('expire pending orders command marks overdue orders as expired', function () {
    ['user' => $user, 'course' => $course] = createPaymentFixtures();

    $this->actingAs($user)->post(route('checkout.store', $course->slug));

    $order = Order::query()->firstOrFail();
    $order->update(['expires_at' => now()->subMinute()]);

    $this->artisan('orders:expire-pending')->assertSuccessful();

    expect($order->fresh()->status)->toBe(OrderStatus::Expired);
});
