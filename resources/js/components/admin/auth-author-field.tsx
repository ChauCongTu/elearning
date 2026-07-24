import { TextInput } from '@mantine/core';
import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types';

type Props = {
    value: string;
};

export default function AuthAuthorField({ value }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const displayName = value || auth.user?.name || '';

    return (
        <TextInput
            label="Tác giả"
            value={displayName}
            disabled
            readOnly
        />
    );
}
