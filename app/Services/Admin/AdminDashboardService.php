<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminDashboardServiceInterface;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\User;

class AdminDashboardService implements AdminDashboardServiceInterface
{
    public function getOverview(): array
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $todayStart = $now->copy()->startOfDay();

        $ordersToday = Order::query()->where('created_at', '>=', $todayStart)->count();

        $revenueMonth = (int) Order::query()
            ->where('status', OrderStatus::Paid)
            ->where('paid_at', '>=', $monthStart)
            ->sum('amount');

        $newStudentsMonth = User::query()
            ->where('role', UserRole::Student)
            ->where('created_at', '>=', $monthStart)
            ->count();

        $activeCourses = Course::query()->where('is_published', true)->count();

        return [
            'summary' => [
                'orders_today' => $ordersToday,
                'revenue_month' => $revenueMonth,
                'new_students_month' => $newStudentsMonth,
                'active_courses' => $activeCourses,
            ],
            'totals' => [
                'users' => User::query()->count(),
                'courses' => Course::query()->count(),
                'enrollments' => Enrollment::query()->count(),
                'orders' => Order::query()->count(),
            ],
            'revenue_trend' => $this->revenueTrend(),
            'orders_by_status' => $this->ordersByStatus(),
            'recent_orders' => $this->recentOrders(),
            'recent_enrollments' => $this->recentEnrollments(),
        ];
    }

    /**
     * @return list<array{label: string, value: int}>
     */
    private function revenueTrend(): array
    {
        $months = collect(range(5, 0))->map(function (int $offset) {
            $date = now()->subMonths($offset);

            return [
                'start' => $date->copy()->startOfMonth(),
                'label' => 'T'.$date->month,
            ];
        });

        return $months->map(function (array $month) {
            $value = (int) Order::query()
                ->where('status', OrderStatus::Paid)
                ->whereBetween('paid_at', [$month['start'], $month['start']->copy()->endOfMonth()])
                ->sum('amount');

            return [
                'label' => $month['label'],
                'value' => $value,
            ];
        })->all();
    }

    /**
     * @return list<array{status: string, count: int}>
     */
    private function ordersByStatus(): array
    {
        return collect(OrderStatus::cases())->map(function (OrderStatus $status) {
            return [
                'status' => $status->value,
                'count' => Order::query()->where('status', $status)->count(),
            ];
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentOrders(): array
    {
        return Order::query()
            ->with('user:id,name')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'code' => $order->code,
                'status' => $order->status->value,
                'amount' => (string) $order->amount,
                'created_at' => $order->created_at?->toIso8601String(),
                'user_name' => $order->user?->name,
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentEnrollments(): array
    {
        return Enrollment::query()
            ->with(['user:id,name', 'course:id,title'])
            ->latest('enrolled_at')
            ->limit(5)
            ->get()
            ->map(fn (Enrollment $enrollment) => [
                'id' => $enrollment->id,
                'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
                'user_name' => $enrollment->user?->name,
                'course_title' => $enrollment->course?->title,
                'source' => $enrollment->source->value,
            ])
            ->all();
    }
}
