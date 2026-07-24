<?php

use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\StudentSource;
use App\Enums\UserRole;
use App\Notifications\StudentCertificateNotification;
use App\Models\Category;
use App\Models\Certificate;
use App\Models\Chapter;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

function createStudentLookupFixtures(): array
{
    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam-'.uniqid(),
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa phun xăm cơ bản',
        'slug' => 'khoa-phun-xam-'.uniqid(),
        'price' => 1_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $chapter = Chapter::create([
        'course_id' => $course->id,
        'title' => 'Chương 1',
        'sort_order' => 0,
        'is_published' => true,
    ]);

    $lesson = Lesson::create([
        'chapter_id' => $chapter->id,
        'title' => 'Bài 1',
        'sort_order' => 0,
        'video_s3_key' => 'lessons/videos/sample.mp4',
        'duration_seconds' => 60,
        'is_free_preview' => false,
        'is_published' => true,
    ]);

    $user = User::factory()->create([
        'role' => UserRole::Student,
        'birth_year' => 1995,
        'cmnd' => '123456789012',
    ]);

    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Purchase,
    ]);

    return compact('course', 'chapter', 'lesson', 'user', 'enrollment');
}

it('imports legacy csv format into students table', function () {
    $csv = "stt,name,student_code,cmnd,cmnd_issue_date,cmnd_issue_place,birthday,original_place,ethnic,course,class_name,graduation_date\n";
    $csv .= '1,Nguyễn Văn An,SV001,123456789,2020-01-15,Hà Nội,1995-05-20,Hà Nội,Kinh,Khóa phun xăm,CNTT01,2023-06-15';

    $path = storage_path('framework/testing/import.csv');
    file_put_contents($path, $csv);

    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->post('/admin/students/import', [
            'file' => new UploadedFile($path, 'import.csv', 'text/csv', null, true),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('students', [
        'student_code' => 'SV001',
        'name' => 'Nguyễn Văn An',
        'source' => StudentSource::Import->value,
    ]);
});

it('searches students by exact keyword on public lookup page', function () {
    Student::factory()->create([
        'name' => 'Nguyễn Văn An',
        'student_code' => 'SV001',
        'cmnd' => '123456789',
        'course' => 'Khóa phun xăm',
        'class_name' => 'CNTT01',
    ]);

    Student::factory()->create([
        'name' => 'Trần Thị B',
        'student_code' => 'SV002',
    ]);

    $this->get('/thong-tin?q=SV001')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/pages/info')
            ->has('lookupResults', 1)
            ->where('lookupResults.0.student_code', 'SV001'));

    $this->get('/thong-tin?q=CNTT01')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('lookupResults', 1));
});

it('redirects legacy tra-cuu-hoc-vien url to info page', function () {
    $this->get('/tra-cuu-hoc-vien?q=SV001')
        ->assertRedirect('/thong-tin?q=SV001');
});

it('returns legacy json schema from public api', function () {
    Student::factory()->create([
        'name' => 'Nguyễn Văn An',
        'student_code' => 'SV001',
        'course' => 'Khóa phun xăm cơ bản',
        'class_name' => 'CNTT01',
    ]);

    $response = $this->getJson('/api/v1/students/search?q=SV001');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('total', 1)
        ->assertJsonStructure([
            'success',
            'data' => [[
                'id',
                'stt',
                'name',
                'student_code',
                'cmnd',
                'cmnd_issue_date',
                'cmnd_issue_place',
                'birthday',
                'original_place',
                'ethnic',
                'course',
                'class_name',
                'graduation_date',
                'type',
                'created_at',
                'updated_at',
            ]],
            'total',
            'message',
        ])
        ->assertJsonPath('data.0.student_code', 'SV001');
});

it('marks revoked students in api response', function () {
    Student::factory()->revoked()->create([
        'student_code' => 'SVREVOKED',
    ]);

    $this->getJson('/api/v1/students/search?q=SVREVOKED')
        ->assertOk()
        ->assertJsonPath('data.0.status', 'revoked');
});

it('issues certificate when enrollment reaches 100 percent', function () {
    Notification::fake();

    ['lesson' => $lesson, 'user' => $user, 'enrollment' => $enrollment] = createStudentLookupFixtures();

    LessonProgress::create([
        'enrollment_id' => $enrollment->id,
        'lesson_id' => $lesson->id,
        'watched_seconds' => 54,
        'completed' => false,
        'last_watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->postJson(route('learn.progress.complete', ['lesson' => $lesson]))
        ->assertOk();

    $this->assertDatabaseHas('students', [
        'enrollment_id' => $enrollment->id,
        'user_id' => $user->id,
        'source' => StudentSource::Online->value,
    ]);

    $student = Student::query()->where('enrollment_id', $enrollment->id)->first();

    expect($student)->not->toBeNull();
    expect($student->student_code)->toStartWith('ELN'.now()->year);

    $this->assertDatabaseHas('certificates', [
        'enrollment_id' => $enrollment->id,
        'student_id' => $student->id,
    ]);

    Notification::assertSentTo($user, StudentCertificateNotification::class);
});

it('enforces unique student_code', function () {
    Student::factory()->create(['student_code' => 'SV001']);

    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->post('/admin/students', [
            'name' => 'Duplicate',
            'student_code' => 'SV001',
        ])
        ->assertSessionHasErrors('student_code');
});

it('allows admin to revoke and restore student lookup', function () {
    $student = Student::factory()->create(['student_code' => 'SVREVOKE']);
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->post("/admin/students/{$student->id}/revoke")
        ->assertRedirect();

    expect($student->fresh()->is_revoked)->toBeTrue();

    $this->get('/thong-tin?q=SVREVOKE')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('lookupResults.0.is_revoked', true));

    $this->actingAs($admin)
        ->post("/admin/students/{$student->id}/restore")
        ->assertRedirect();

    expect($student->fresh()->is_revoked)->toBeFalse();
});

it('lets authenticated user list and download their certificates', function () {
    Notification::fake();

    ['lesson' => $lesson, 'user' => $user, 'enrollment' => $enrollment] = createStudentLookupFixtures();

    LessonProgress::create([
        'enrollment_id' => $enrollment->id,
        'lesson_id' => $lesson->id,
        'watched_seconds' => 54,
        'completed' => false,
        'last_watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->postJson(route('learn.progress.complete', ['lesson' => $lesson]))
        ->assertOk();

    $certificate = Certificate::query()->where('enrollment_id', $enrollment->id)->first();

    $this->actingAs($user)
        ->get('/account/certificates')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('account/certificates')
            ->has('certificates', 1));

    $this->actingAs($user)
        ->get("/account/certificates/{$certificate->id}/download")
        ->assertOk()
        ->assertDownload();
});

it('denies student access to admin students area', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($student)
        ->get('/admin/students')
        ->assertRedirect('/account/courses');
});

it('lets admin create standalone or linked student records', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $user = User::factory()->create([
        'role' => UserRole::Student,
        'name' => 'Nguyễn Văn B',
        'cmnd' => '001122334455',
        'birth_year' => 1998,
    ]);

    $this->actingAs($admin)
        ->post('/admin/students', [
            'name' => 'Học viên độc lập',
            'student_code' => 'SV-STANDALONE',
            'source' => StudentSource::Manual->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('students', [
        'student_code' => 'SV-STANDALONE',
        'user_id' => null,
        'source' => StudentSource::Manual->value,
    ]);

    $this->actingAs($admin)
        ->post('/admin/students', [
            'name' => 'Học viên liên kết',
            'auto_generate_code' => true,
            'user_id' => $user->id,
            'source' => StudentSource::Manual->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $linked = Student::query()->where('user_id', $user->id)->first();

    expect($linked)->not->toBeNull();
    expect($linked->student_code)->toStartWith('ELN'.now()->year);
    expect($linked->cmnd)->toBe('001122334455');
});

it('lets admin create student profile from user page', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $user = User::factory()->create(['role' => UserRole::Student, 'name' => 'Trần Thị C']);

    $this->actingAs($admin)
        ->post("/admin/users/{$user->id}/students", [
            'name' => 'Trần Thị C',
            'student_code' => 'SV-USER-PAGE',
            'course' => 'Khóa legacy',
            'class_name' => 'L01',
            'source' => StudentSource::Manual->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('students', [
        'user_id' => $user->id,
        'student_code' => 'SV-USER-PAGE',
        'course' => 'Khóa legacy',
    ]);

    $this->actingAs($admin)
        ->get("/admin/users/{$user->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/show')
            ->has('user.students', 1)
            ->where('user.students.0.student_code', 'SV-USER-PAGE'));
});

it('searches users for student linking', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $user = User::factory()->create([
        'role' => UserRole::Student,
        'name' => 'Unique Link Name',
        'email' => 'unique-link@example.test',
    ]);

    $this->actingAs($admin)
        ->getJson('/admin/students/users/search?q=unique-link')
        ->assertOk()
        ->assertJsonPath('users.0.id', $user->id)
        ->assertJsonPath('users.0.email', 'unique-link@example.test');
});

it('lets admin update student profile inline from user page', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $user = User::factory()->create(['role' => UserRole::Student]);
    $otherUser = User::factory()->create(['role' => UserRole::Student]);

    $student = Student::factory()->create([
        'user_id' => $user->id,
        'student_code' => 'SV-INLINE',
        'name' => 'Tên cũ',
        'course' => 'Khóa cũ',
        'source' => StudentSource::Manual,
    ]);

    $foreignStudent = Student::factory()->create([
        'user_id' => $otherUser->id,
        'student_code' => 'SV-FOREIGN',
    ]);

    $this->actingAs($admin)
        ->put("/admin/users/{$user->id}/students/{$student->id}", [
            'name' => 'Tên mới',
            'student_code' => 'SV-INLINE',
            'course' => 'Khóa mới',
            'class_name' => 'L02',
            'source' => StudentSource::Manual->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $student->refresh();

    expect($student->name)->toBe('Tên mới');
    expect($student->course)->toBe('Khóa mới');
    expect($student->class_name)->toBe('L02');

    $this->actingAs($admin)
        ->put("/admin/users/{$user->id}/students/{$foreignStudent->id}", [
            'name' => 'Không được',
            'student_code' => 'SV-FOREIGN',
            'source' => StudentSource::Manual->value,
        ])
        ->assertNotFound();
});
