<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SlugGenerator
{
    /**
     * @param  class-string<Model>  $modelClass
     */
    public static function unique(string $title, string $modelClass, ?string $exceptId = null): string
    {
        $base = Str::slug($title) ?: Str::random(8);
        $slug = $base;
        $counter = 1;

        while (static::exists($modelClass, $slug, $exceptId)) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * @param  class-string<Model>  $modelClass
     */
    private static function exists(string $modelClass, string $slug, ?string $exceptId): bool
    {
        $query = $modelClass::query()->where('slug', $slug);

        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->exists();
    }
}
