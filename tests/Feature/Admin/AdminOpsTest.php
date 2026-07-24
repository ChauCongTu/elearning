<?php

use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Course;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;

function createRootAdmin(array $attributes = []): User
{
    return User::factory()->create(array_merge([
        'role' => UserRole::Admin,
        'is_root_account' => true,
    ], $attributes));
}

/**
 * @return array{admin: User, student: User, course: Course, order: Order}
 */
function createManualCompleteFixtures(bool $withPermission = true): array
{
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
        'can_complete_orders' => $withPermission,
    ]);

    $student = User::factory()->create(['role' => UserRole::Student]);

    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam-manual-'.uniqid(),
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa manual complete',
        'slug' => 'khoa-manual-'.uniqid(),
        'price' => 1_500_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $order = Order::create([
        'user_id' => $student->id,
        'code' => 'ELN'.random_int(100000, 999999),
        'amount' => $course->price,
        'status' => OrderStatus::Pending,
        'expires_at' => now()->addMinutes(15),
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'course_id' => $course->id,
        'price' => $course->price,
    ]);

    return compact('admin', 'student', 'course', 'order');
}

test('admin with permission can manually complete pending order', function () {
    ['admin' => $admin, 'student' => $student, 'course' => $course, 'order' => $order] = createManualCompleteFixtures();

    $this->actingAs($admin)
        ->post(route('admin.orders.complete', $order), [
            'note' => 'Khách chuyển khoản tài khoản phụ',
        ])
        ->assertRedirect();

    $order->refresh();

    expect($order->status)->toBe(OrderStatus::Paid);
    expect($order->paid_at)->not->toBeNull();

    $this->assertDatabaseHas('payments', [
        'order_id' => $order->id,
        'gateway' => 'manual_admin',
    ]);

    $this->assertDatabaseHas('order_manual_completions', [
        'order_id' => $order->id,
        'completed_by' => $admin->id,
        'note' => 'Khách chuyển khoản tài khoản phụ',
    ]);

    $this->assertDatabaseHas('enrollments', [
        'user_id' => $student->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active->value,
        'source' => EnrollmentSource::Purchase->value,
    ]);
});

test('admin without permission cannot manually complete order', function () {
    ['admin' => $admin, 'order' => $order] = createManualCompleteFixtures(withPermission: false);

    $this->actingAs($admin)
        ->post(route('admin.orders.complete', $order))
        ->assertSessionHasErrors('order');

    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
});

test('admin can create marketing review for course', function () {
    $admin = User::factory()->admin()->create();

    $category = Category::create([
        'name' => 'Chăm sóc da',
        'slug' => 'cham-soc-da-marketing',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa marketing',
        'slug' => 'khoa-marketing',
        'price' => 1_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.reviews.store'), [
            'course_id' => $course->id,
            'reviewer_name' => 'Nguyễn Thị Lan',
            'rating' => 5,
            'body' => 'Khóa học tuyệt vời!',
            'is_published' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('course_reviews', [
        'course_id' => $course->id,
        'user_id' => null,
        'reviewer_name' => 'Nguyễn Thị Lan',
        'rating' => 5,
        'is_admin_created' => true,
        'is_published' => true,
    ]);
});

test('course purchase count includes paid orders and offset', function () {
    ['student' => $student, 'course' => $course, 'order' => $order] = createManualCompleteFixtures();

    $order->update([
        'status' => OrderStatus::Paid,
        'paid_at' => now(),
    ]);

    $course->update(['purchase_count_offset' => 10]);

    expect($course->fresh()->displayPurchaseCount())->toBe(11);
});

test('admin students page loads for admin user', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.students.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/students/index'));
});

test('root can grant order completion permission to another admin', function () {
    $root = createRootAdmin();

    $delegate = User::factory()->create([
        'role' => UserRole::Admin,
        'can_complete_orders' => false,
    ]);

    $this->actingAs($root)
        ->patch(route('admin.users.update', $delegate), [
            'role' => 'admin',
            'can_complete_orders' => true,
        ])
        ->assertRedirect();

    expect($delegate->fresh()->can_complete_orders)->toBeTrue();
});

test('non-root admin cannot grant order completion permission', function () {
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
        'can_complete_orders' => true,
    ]);

    $target = User::factory()->create([
        'role' => UserRole::Admin,
        'can_complete_orders' => false,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.users.update', $target), [
            'role' => 'admin',
            'can_complete_orders' => true,
        ])
        ->assertSessionHasErrors('can_complete_orders');

    expect($target->fresh()->can_complete_orders)->toBeFalse();
});

test('admin with permission can grant manual enrollment', function () {
    ['admin' => $admin, 'student' => $student, 'course' => $course] = createManualCompleteFixtures();

    $this->actingAs($admin)
        ->post(route('admin.users.enrollments.store', $student), [
            'course_id' => $course->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('enrollments', [
        'user_id' => $student->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active->value,
        'source' => EnrollmentSource::Manual->value,
    ]);
});

test('admin without permission cannot grant manual enrollment', function () {
    ['admin' => $admin, 'student' => $student, 'course' => $course] = createManualCompleteFixtures(withPermission: false);

    $this->actingAs($admin)
        ->post(route('admin.users.enrollments.store', $student), [
            'course_id' => $course->id,
        ])
        ->assertSessionHasErrors('enrollment');
});

test('root can manually complete order without delegated permission flag', function () {
    ['student' => $student, 'course' => $course, 'order' => $order] = createManualCompleteFixtures(withPermission: false);

    $root = createRootAdmin(['can_complete_orders' => false]);

    $this->actingAs($root)
        ->post(route('admin.orders.complete', $order))
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(OrderStatus::Paid);
});
