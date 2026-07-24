<?php

use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\CourseCompletedNotification;
use App\Notifications\EnrollmentGrantedNotification;
use App\Notifications\OrderCreatedNotification;
use App\Notifications\OrderExpiredNotification;
use App\Notifications\OrderPaidNotification;
use App\Notifications\RegistrationWelcomeNotification;
use App\Notifications\RoleChangedNotification;
use App\Notifications\VerifyEmailNotification;
use App\Services\Admin\AdminUserService;
use App\Services\Mail\TransactionalMailService;
use App\Services\Payment\OrderService;
use App\Support\MailBranding;
use App\Support\TransactionalMail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    config([
        'transactional-mail.default' => [
            'address' => 'default@example.com',
            'name' => 'Default Sender',
        ],
        'transactional-mail.cases.registration' => [
            'address' => 'register@example.com',
            'name' => 'Register Sender',
        ],
        'transactional-mail.cases.email_verification' => [
            'address' => 'verify@example.com',
            'name' => 'Verify Sender',
        ],
        'transactional-mail.cases.order_created' => [
            'address' => 'orders@example.com',
            'name' => 'Orders Sender',
        ],
    ]);
});

test('transactional mail helper resolves case-specific from address', function () {
    $from = TransactionalMail::from('registration');

    expect($from->address)->toBe('register@example.com')
        ->and($from->name)->toBe('Register Sender');
});

test('mail branding exposes site logo and theme colors', function () {
    $branding = MailBranding::viewData()['branding'];

    expect($branding['siteName'])->not->toBe('')
        ->and($branding['logoUrl'])->toContain('/images/logo-hoc-vien-bong-nhai-trang.png')
        ->and($branding['primary'])->toBe('#e64980');
});

test('registration sends welcome notification and verify notification', function () {
    Notification::fake();

    $user = User::factory()->create([
        'role' => UserRole::Student,
        'email_verified_at' => null,
    ]);

    event(new Registered($user));

    Notification::assertSentTo($user, RegistrationWelcomeNotification::class);
    Notification::assertSentTo($user, VerifyEmailNotification::class);
});

test('creating order sends order created notification', function () {
    Notification::fake();

    $category = Category::create([
        'name' => 'Mail Test',
        'slug' => 'mail-test',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa mail',
        'slug' => 'khoa-mail',
        'price' => 500_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $user = User::factory()->create(['role' => UserRole::Student]);

    app(OrderService::class)->createForCourse($user, $course);

    Notification::assertSentTo($user, OrderCreatedNotification::class);
});

test('expiring pending orders sends expired notification', function () {
    Notification::fake();

    $user = User::factory()->create(['role' => UserRole::Student]);
    $category = Category::create([
        'name' => 'Expire',
        'slug' => 'expire-mail',
        'sort_order' => 0,
        'is_active' => true,
    ]);
    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa hết hạn',
        'slug' => 'khoa-het-han',
        'price' => 100_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $order = Order::create([
        'user_id' => $user->id,
        'code' => 'ELN202607200001',
        'status' => OrderStatus::Pending,
        'amount' => 100_000,
        'expires_at' => now()->subMinute(),
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'course_id' => $course->id,
        'price' => 100_000,
    ]);

    app(OrderService::class)->expirePendingOrders();

    Notification::assertSentTo($user, OrderExpiredNotification::class);
});

test('transactional mail service sends role changed and enrollment granted notifications', function () {
    Notification::fake();

    $student = User::factory()->create(['role' => UserRole::Student]);
    $admin = User::factory()->create(['role' => UserRole::Admin, 'can_complete_orders' => true]);
    $category = Category::create([
        'name' => 'Admin mail',
        'slug' => 'admin-mail',
        'sort_order' => 0,
        'is_active' => true,
    ]);
    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa cấp tay',
        'slug' => 'khoa-cap-tay',
        'price' => 200_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $service = app(AdminUserService::class);
    $service->updateRole($student, UserRole::Admin->value, $admin);
    $service->grantEnrollment($student->fresh(), $course, $admin);

    Notification::assertSentTo($student, RoleChangedNotification::class);
    Notification::assertSentTo($student, EnrollmentGrantedNotification::class);
});

test('course completion sends course completed notification', function () {
    Notification::fake();

    $user = User::factory()->create(['role' => UserRole::Student]);
    $category = Category::create([
        'name' => 'Complete',
        'slug' => 'complete-mail',
        'sort_order' => 0,
        'is_active' => true,
    ]);
    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa hoàn thành',
        'slug' => 'khoa-hoan-thanh',
        'price' => 300_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'source' => EnrollmentSource::Manual,
        'enrolled_at' => now(),
        'progress_percent' => 100,
        'completed_at' => now(),
    ]);

    app(TransactionalMailService::class)->sendCourseCompleted($enrollment);

    Notification::assertSentTo($user, CourseCompletedNotification::class);
});

test('order paid notification can be sent directly', function () {
    Notification::fake();

    $user = User::factory()->create(['role' => UserRole::Student]);
    $order = Order::create([
        'user_id' => $user->id,
        'code' => 'ELN202607200099',
        'status' => OrderStatus::Paid,
        'amount' => 150_000,
        'paid_at' => now(),
        'expires_at' => now()->addHour(),
    ]);

    app(TransactionalMailService::class)->sendOrderPaid($order);

    Notification::assertSentTo($user, OrderPaidNotification::class);
});

test('order notifications bcc configured admin addresses', function () {
    config([
        'transactional-mail.order_admin_bcc' => ['admin@example.com', 'sales@example.com'],
    ]);

    $user = User::factory()->create(['role' => UserRole::Student]);
    $order = Order::create([
        'user_id' => $user->id,
        'code' => 'ELN202607200010',
        'status' => OrderStatus::Pending,
        'amount' => 200_000,
        'expires_at' => now()->addHour(),
    ]);

    $message = (new OrderCreatedNotification($order))->toMail($user);
    $bccAddresses = array_map(static fn (array $entry): string => $entry[0], $message->bcc);

    expect(TransactionalMail::orderAdminBcc())->toBe(['admin@example.com', 'sales@example.com'])
        ->and($bccAddresses)->toContain('admin@example.com')
        ->and($bccAddresses)->toContain('sales@example.com');
});

test('registration notification does not bcc admin', function () {
    config([
        'transactional-mail.order_admin_bcc' => ['admin@example.com'],
    ]);

    $user = User::factory()->create(['role' => UserRole::Student]);
    $message = (new RegistrationWelcomeNotification)->toMail($user);

    expect($message->bcc)->toBeEmpty();
});

test('custom verify email notification uses configured sender', function () {
    $user = User::factory()->create(['email_verified_at' => null]);
    $notification = new VerifyEmailNotification;
    $message = $notification->toMail($user);

    expect($message->from[0])->toBe('verify@example.com')
        ->and($message->from[1])->toBe('Verify Sender');
});

test('registered listener is registered', function () {
    expect(Event::hasListeners(Registered::class))->toBeTrue();
});
