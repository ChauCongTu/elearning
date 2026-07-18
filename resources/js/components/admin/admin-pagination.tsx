import { router } from '@inertiajs/react';
import { Pagination } from '@mantine/core';
import { paginateAdminList } from '@/lib/admin-list';
import type { Paginated } from '@/types';

type Props<T> = {
    paginator: Paginated<T>;
};

export default function AdminPagination<T>({ paginator }: Props<T>) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <Pagination
            mt="lg"
            total={paginator.last_page}
            value={paginator.current_page}
            onChange={paginateAdminList}
        />
    );
}
