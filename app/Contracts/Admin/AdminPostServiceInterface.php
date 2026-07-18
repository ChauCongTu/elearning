<?php

namespace App\Contracts\Admin;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdminPostServiceInterface
{
    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function findForAdmin(Post $post): array;

    public function create(array $data): Post;

    public function update(Post $post, array $data): Post;

    public function delete(Post $post): void;
}
