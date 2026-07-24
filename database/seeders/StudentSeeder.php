<?php

namespace Database\Seeders;

use App\Enums\StudentSource;
use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $records = [
            [
                'stt' => 1,
                'name' => 'Nguyễn Văn An',
                'student_code' => 'SV001',
                'cmnd' => '123456789',
                'cmnd_issue_date' => '2020-01-15',
                'cmnd_issue_place' => 'Hà Nội',
                'birthday' => '1995-05-20',
                'original_place' => 'Hà Nội',
                'ethnic' => 'Kinh',
                'course' => 'Khóa phun xăm cơ bản',
                'class_name' => 'CNTT01',
                'graduation_date' => '2023-06-15',
                'type' => 'X',
                'source' => StudentSource::Import,
                'is_revoked' => false,
            ],
            [
                'stt' => 2,
                'name' => 'Trần Thị Bình',
                'student_code' => 'SV002',
                'cmnd' => '987654321012',
                'cmnd_issue_date' => '2019-08-10',
                'cmnd_issue_place' => 'C1',
                'birthday' => '1998-11-03',
                'original_place' => 'Hải Phòng',
                'ethnic' => 'Kinh',
                'course' => 'Khóa Học Phun Xăm Thẩm Mỹ Cơ Bản',
                'class_name' => 'PX01',
                'graduation_date' => '2024-03-20',
                'type' => 'X',
                'source' => StudentSource::Manual,
                'is_revoked' => false,
            ],
            [
                'stt' => 3,
                'name' => 'Lê Minh Châu',
                'student_code' => 'SV003',
                'cmnd' => '045678912345',
                'cmnd_issue_date' => '2021-02-28',
                'cmnd_issue_place' => 'C2',
                'birthday' => '2000-01-12',
                'original_place' => 'Đà Nẵng',
                'ethnic' => 'Kinh',
                'course' => 'Khóa Học Chăm Sóc Da Cơ Bản',
                'class_name' => 'CSD02',
                'graduation_date' => '2024-11-05',
                'type' => 'X',
                'source' => StudentSource::Import,
                'is_revoked' => false,
            ],
            [
                'stt' => 4,
                'name' => 'Phạm Hoàng Duy',
                'student_code' => 'SV004',
                'cmnd' => '078912345678',
                'cmnd_issue_date' => '2018-06-18',
                'cmnd_issue_place' => 'TP. Hồ Chí Minh',
                'birthday' => '1996-07-30',
                'original_place' => 'Bình Dương',
                'ethnic' => 'Kinh',
                'course' => 'Khóa Học Gội Đầu Dưỡng Sinh',
                'class_name' => 'GDS01',
                'graduation_date' => '2023-12-01',
                'type' => 'X',
                'source' => StudentSource::Manual,
                'is_revoked' => false,
            ],
            [
                'stt' => 5,
                'name' => 'Hoàng Thị Em',
                'student_code' => 'SV005',
                'cmnd' => '036925814703',
                'cmnd_issue_date' => '2022-04-22',
                'cmnd_issue_place' => 'Cần Thơ',
                'birthday' => '1999-09-09',
                'original_place' => 'An Giang',
                'ethnic' => 'Khmer',
                'course' => 'Khóa phun xăm cơ bản',
                'class_name' => 'CNTT02',
                'graduation_date' => '2025-01-10',
                'type' => 'X',
                'source' => StudentSource::Import,
                'is_revoked' => true,
                'revoked_at' => now()->subMonths(2),
            ],
            [
                'stt' => 6,
                'name' => 'Học viên Demo Online',
                'student_code' => 'ELN'.now()->year.'-0001',
                'cmnd' => null,
                'birthday' => '1995-01-01',
                'course' => 'Khóa Học Phun Xăm Thẩm Mỹ Cơ Bản',
                'class_name' => 'Online',
                'graduation_date' => now()->subDays(14)->toDateString(),
                'type' => 'X',
                'source' => StudentSource::Online,
                'is_revoked' => false,
            ],
        ];

        foreach ($records as $data) {
            Student::query()->updateOrCreate(
                ['student_code' => $data['student_code']],
                $data,
            );
        }
    }
}
