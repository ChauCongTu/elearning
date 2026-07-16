<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Chapter;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;

class ElearningSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => UserRole::Admin,
        ]);

        User::factory()->create([
            'name' => 'Học viên Demo',
            'email' => 'student@example.com',
            'role' => UserRole::Student,
        ]);

        $categories = collect([
            ['name' => 'Phun xăm thẩm mỹ', 'slug' => 'phun-xam-tham-my'],
            ['name' => 'Chăm sóc da', 'slug' => 'cham-soc-da'],
            ['name' => 'Gội đầu dưỡng sinh', 'slug' => 'goi-dau-duong-sinh'],
        ])->map(function (array $data, int $index) {
            return Category::create([
                ...$data,
                'sort_order' => $index,
                'is_active' => true,
            ]);
        });

        $courses = [
            [
                'category_slug' => 'phun-xam-tham-my',
                'title' => 'Khóa Học Phun Xăm Thẩm Mỹ Cơ Bản',
                'slug' => 'khoa-hoc-phun-xam-tham-my-co-ban',
                'badge' => 'ĐANG HOT NHẤT',
                'excerpt' => 'Kiến thức nền tảng phun xăm, rèn luyện tay nghề từ lý thuyết đến thực hành trên mẫu thật.',
                'price' => 8_000_000,
                'compare_price' => 12_000_000,
                'is_featured' => true,
            ],
            [
                'category_slug' => 'phun-xam-tham-my',
                'title' => 'Khóa Học Phun Xăm Thẩm Mỹ Nâng Cao',
                'slug' => 'khoa-hoc-phun-xam-tham-my-nang-cao',
                'badge' => 'PHỔ BIẾN NHẤT',
                'excerpt' => 'Ombre, điêu khắc 3D, Rose Lips, Candy Lips. Kèm kỹ năng xây dựng thương hiệu.',
                'price' => 10_000_000,
                'compare_price' => 15_000_000,
                'is_featured' => true,
            ],
            [
                'category_slug' => 'phun-xam-tham-my',
                'title' => 'Khóa Học Phun Xăm Thẩm Mỹ Toàn Diện',
                'slug' => 'khoa-hoc-phun-xam-tham-my-toan-dien',
                'badge' => 'PHỔ BIẾN NHẤT',
                'excerpt' => 'Lộ trình toàn diện từ cơ bản đến chuyên sâu cho người muốn làm chủ nghề.',
                'price' => 12_000_000,
                'compare_price' => 18_000_000,
                'is_featured' => true,
            ],
            [
                'category_slug' => 'goi-dau-duong-sinh',
                'title' => 'Khóa Học Gội Đầu Dưỡng Sinh',
                'slug' => 'khoa-hoc-goi-dau-duong-sinh',
                'badge' => 'RA NGHỀ NHANH',
                'excerpt' => 'Kỹ thuật gội đầu dưỡng sinh, massage, ấn huyệt. Ra nghề sau 2–4 tuần.',
                'price' => 5_000_000,
                'compare_price' => 8_000_000,
                'is_featured' => true,
            ],
            [
                'category_slug' => 'cham-soc-da',
                'title' => 'Khóa Học Chăm Sóc Da Cơ Bản',
                'slug' => 'khoa-hoc-cham-soc-da-co-ban',
                'badge' => 'PHỔ BIẾN NHẤT',
                'excerpt' => 'Chương trình đào tạo bài bản từ cơ bản đến nâng cao, hướng dẫn bởi chuyên gia hàng đầu.',
                'price' => 6_000_000,
                'compare_price' => 10_000_000,
                'is_featured' => true,
            ],
            [
                'category_slug' => 'cham-soc-da',
                'title' => 'Khóa Học Chăm Sóc Da Nâng Cao',
                'slug' => 'khoa-hoc-cham-soc-da-nang-cao',
                'badge' => 'MỚI',
                'excerpt' => 'Nâng cao kỹ năng điều trị và chăm sóc da chuyên sâu trong môi trường spa.',
                'price' => 7_000_000,
                'compare_price' => 11_000_000,
                'is_featured' => false,
            ],
        ];

        foreach ($courses as $data) {
            $category = $categories->firstWhere('slug', $data['category_slug']);

            $course = Course::create([
                'category_id' => $category->id,
                'title' => $data['title'],
                'slug' => $data['slug'],
                'excerpt' => $data['excerpt'],
                'description' => $data['excerpt']."\n\nChương trình học online kết hợp video bài giảng và hỗ trợ tư vấn trực tiếp.",
                'price' => $data['price'],
                'compare_price' => $data['compare_price'],
                'instructor_name' => 'Đỗ Thị Thu Hằng',
                'instructor_title' => 'Giảng viên Phun xăm',
                'duration_label' => '2-3 tháng',
                'lesson_count_label' => '25 bài',
                'meta' => ['badge' => $data['badge']],
                'benefits' => [
                    'Thực hành 70% — Lý thuyết 30%',
                    'Giảng viên kèm sát 1:1',
                    'Cam kết đầu ra — học lại miễn phí',
                ],
                'faq' => [
                    ['q' => 'Không biết gì có học được không?', 'a' => 'Khóa dành cho người mới bắt đầu.'],
                ],
                'is_featured' => $data['is_featured'],
                'is_published' => true,
                'published_at' => now(),
            ]);

            $course->categories()->attach($categories->pluck('id'));

            $chapter = Chapter::create([
                'course_id' => $course->id,
                'title' => 'Chương 1: Kiến thức nền tảng',
                'sort_order' => 0,
                'is_published' => true,
            ]);

            foreach ([
                'Giới thiệu khóa học',
                'Kiến thức chuyên môn',
                'Kỹ thuật thực hành',
                'Chăm sóc khách hàng',
            ] as $index => $title) {
                Lesson::create([
                    'chapter_id' => $chapter->id,
                    'title' => $title,
                    'sort_order' => $index,
                    'duration_seconds' => 600 + ($index * 120),
                    'is_free_preview' => $index === 0,
                    'is_published' => true,
                ]);
            }
        }

        Banner::create([
            'title' => 'Khóa học đang tuyển sinh — Ưu đãi có hạn',
            'image_path' => 'banners/demo.jpg',
            'link_url' => '/courses/khoa-hoc-phun-xam-tham-my-co-ban',
            'sort_order' => 0,
            'is_active' => true,
        ]);
    }
}
