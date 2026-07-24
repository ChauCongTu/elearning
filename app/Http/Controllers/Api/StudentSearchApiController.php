<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Student\StudentLookupServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentSearchApiController extends Controller
{
    public function __construct(
        private StudentLookupServiceInterface $lookup,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $keyword = (string) $request->query('q', '');

        return response()->json($this->lookup->searchApi($keyword));
    }
}
