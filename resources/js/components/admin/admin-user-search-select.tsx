import { Loader, Select, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import type { AdminStudentUserLink } from '@/types';

type Props = {
    label?: string;
    description?: string;
    value: string;
    onChange: (userId: string) => void;
    linkedUser?: AdminStudentUserLink | null;
    disabled?: boolean;
    clearable?: boolean;
};

export default function AdminUserSearchSelect({
    label = 'Liên kết tài khoản',
    description,
    value,
    onChange,
    linkedUser,
    disabled = false,
    clearable = true,
}: Props) {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<AdminStudentUserLink[]>([]);

    useEffect(() => {
        if (debouncedSearch.trim().length < 2) {
            setUsers(linkedUser ? [linkedUser] : []);

            return;
        }

        let cancelled = false;
        setLoading(true);

        fetch(`/admin/students/users/search?q=${encodeURIComponent(debouncedSearch)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((response) => response.json())
            .then((payload: { users: AdminStudentUserLink[] }) => {
                if (!cancelled) {
                    const next = payload.users ?? [];
                    setUsers(linkedUser && !next.some((user) => user.id === linkedUser.id) ? [linkedUser, ...next] : next);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [debouncedSearch, linkedUser]);

    const options = users.map((user) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
    }));

    return (
        <Select
            label={label}
            {...(description ? { description } : {})}
            placeholder="Tìm tên hoặc email..."
            searchable
            clearable={clearable}
            disabled={disabled}
            data={options}
            value={value || null}
            searchValue={search}
            onSearchChange={setSearch}
            onChange={(next) => onChange(next ?? '')}
            nothingFoundMessage={loading ? 'Đang tìm...' : 'Không tìm thấy người dùng'}
            rightSection={loading ? <Loader size={16} /> : undefined}
            renderOption={({ option }) => {
                const user = users.find((item) => item.id === option.value);

                return (
                    <div>
                        <Text size="sm">{user?.name ?? option.label}</Text>
                        {user?.email && (
                            <Text size="xs" c="dimmed">
                                {user.email}
                            </Text>
                        )}
                    </div>
                );
            }}
        />
    );
}
