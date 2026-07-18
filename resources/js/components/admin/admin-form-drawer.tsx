import { Button, Drawer, Group, type DrawerProps } from '@mantine/core';
import type { ReactNode } from 'react';

type Props = DrawerProps & {
    onSubmit: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    children: ReactNode;
};

export default function AdminFormDrawer({
    opened,
    onClose,
    title,
    onSubmit,
    submitLabel = 'Lưu',
    cancelLabel = 'Hủy',
    loading,
    children,
    size = 'md',
    ...props
}: Props) {
    return (
        <Drawer
            {...props}
            opened={opened}
            onClose={onClose}
            title={title}
            position="right"
            size={size}
            overlayProps={{ opacity: 0.35, blur: 2 }}
        >
            {children}
            <Group justify="flex-end" mt="xl" pt="md" style={{ borderTop: '1px solid #ececf1' }}>
                <Button variant="default" onClick={onClose}>
                    {cancelLabel}
                </Button>
                <Button onClick={onSubmit} loading={loading}>
                    {submitLabel}
                </Button>
            </Group>
        </Drawer>
    );
}
