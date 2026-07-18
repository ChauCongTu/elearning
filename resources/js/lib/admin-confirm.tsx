import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';

type ConfirmDeleteOptions = {
    message: string;
    title?: string;
    confirmLabel?: string;
    onConfirm: () => void;
};

export function confirmDelete({
    message,
    title = 'Xác nhận xóa',
    confirmLabel = 'Xóa',
    onConfirm,
}: ConfirmDeleteOptions): void {
    modals.openConfirmModal({
        title,
        centered: true,
        labels: { confirm: confirmLabel, cancel: 'Hủy' },
        confirmProps: { color: 'red' },
        children: <Text size="sm">{message}</Text>,
        onConfirm,
    });
}
