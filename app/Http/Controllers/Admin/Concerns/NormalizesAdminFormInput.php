<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Http\Request;

trait NormalizesAdminFormInput
{
    /**
     * @param  list<string>  $keys
     */
    protected function normalizeNullable(Request $request, array $keys): void
    {
        $normalized = [];

        foreach ($keys as $key) {
            $value = $request->input($key);

            if ($value === '' || $value === 'null') {
                $normalized[$key] = null;
            }
        }

        if ($normalized !== []) {
            $request->merge($normalized);
        }
    }
}
