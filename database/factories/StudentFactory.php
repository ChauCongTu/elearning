<?php

namespace Database\Factories;

use App\Enums\StudentSource;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'stt' => fake()->numberBetween(1, 999),
            'name' => fake()->name(),
            'student_code' => strtoupper(fake()->unique()->bothify('SV###')),
            'cmnd' => fake()->numerify('##########'),
            'cmnd_issue_date' => fake()->date(),
            'cmnd_issue_place' => fake()->randomElement(['C1', 'C2', 'Hà Nội']),
            'birthday' => fake()->date(),
            'original_place' => fake()->city(),
            'ethnic' => 'Kinh',
            'course' => fake()->sentence(3),
            'class_name' => strtoupper(fake()->bothify('CNTT##')),
            'graduation_date' => fake()->date(),
            'type' => 'X',
            'source' => StudentSource::Manual,
            'is_revoked' => false,
        ];
    }

    public function revoked(): static
    {
        return $this->state(fn () => [
            'is_revoked' => true,
            'revoked_at' => now(),
        ]);
    }
}
