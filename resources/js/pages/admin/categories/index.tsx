import { Head, router, usePage } from '@inertiajs/react';
import { Button, Group, NumberInput, Stack, Switch, Table, Text, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminFormDrawer from '@/components/admin/admin-form-drawer';
import AdminListSwitch from '@/components/admin/admin-list-switch';
import AdminPageHeader from '@/components/admin/admin-page-header';
import ImageUploadField from '@/components/admin/image-upload-field';
import SlugInput from '@/components/admin/slug-input';
import { useAutoSlug } from '@/hooks/use-auto-slug';
import { confirmDelete } from '@/lib/admin-confirm';
import { formatDateTime, mediaUrl } from '@/lib/format';
import type { AdminCategory } from '@/types';

type Props = {
    categories: AdminCategory[];
};

type FormValues = {
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
};

export default function AdminCategoriesIndex({ categories }: Props) {
    const [opened, { open, close }] = useDisclosure(false);
    const [editing, setEditing] = useState<AdminCategory | null>(null);
    const { errors } = usePage().props as { errors?: Record<string, string> };

    const form = useForm<FormValues>({
        initialValues: {
            name: '',
            slug: '',
            sort_order: 0,
            is_active: true,
        },
        validate: {
            name: (value) => (value.trim() ? null : 'Vui lòng nhập tên danh mục'),
        },
    });

    const { slugInputProps, regenerateSlug, resetSlugTouch } = useAutoSlug(
        form,
        'name',
        'slug',
        !editing,
    );

    const openCreate = () => {
        setEditing(null);
        form.reset();
        resetSlugTouch();
        open();
    };

    const openEdit = (category: AdminCategory) => {
        setEditing(category);
        form.setValues({
            name: category.name,
            slug: category.slug,
            sort_order: category.sort_order,
            is_active: category.is_active,
        });
        open();
    };

    const submit = () => {
        if (form.validate().hasErrors) {
            return;
        }

        if (editing) {
            router.patch(`/admin/categories/${editing.id}`, form.values, {
                onSuccess: () => close(),
            });
        } else {
            router.post('/admin/categories', form.values, {
                onSuccess: () => close(),
            });
        }
    };

    const destroy = (category: AdminCategory) => {
        confirmDelete({
            message: `Bạn có chắc muốn xóa danh mục "${category.name}"? Hành động này không thể hoàn tác.`,
            onConfirm: () => router.delete(`/admin/categories/${category.id}`),
        });
    };

    return (
        <>
            <Head title="Danh mục khóa học" />
            <AdminPageHeader
                title="Danh mục khóa học"
                description="Quản lý danh mục hiển thị trên trang khóa học."
                actions={
                    <Button leftSection={<Plus size={16} />} onClick={openCreate}>
                        Thêm danh mục
                    </Button>
                }
            />

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Tên</Table.Th>
                        <Table.Th>Slug</Table.Th>
                        <Table.Th>Thứ tự</Table.Th>
                        <Table.Th>Khóa học</Table.Th>
                        <Table.Th>Hiển thị</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {categories.map((category) => (
                        <Table.Tr key={category.id}>
                            <Table.Td>{category.name}</Table.Td>
                            <Table.Td>{category.slug}</Table.Td>
                            <Table.Td>{category.sort_order}</Table.Td>
                            <Table.Td>{category.courses_count ?? 0}</Table.Td>
                            <Table.Td>
                                <AdminListSwitch
                                    url={`/admin/categories/${category.id}/toggle`}
                                    field="is_active"
                                    checked={category.is_active}
                                    label="Hiển thị danh mục"
                                />
                            </Table.Td>
                            <Table.Td>
                                <Group gap="xs" wrap="nowrap">
                                    <Button size="xs" variant="light" onClick={() => openEdit(category)}>
                                        <Pencil size={14} />
                                    </Button>
                                    <Button size="xs" variant="light" color="red" onClick={() => destroy(category)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <AdminFormDrawer
                opened={opened}
                onClose={close}
                title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}
                onSubmit={submit}
                submitLabel={editing ? 'Lưu' : 'Thêm'}
            >
                <Stack>
                    <TextInput label="Tên danh mục" withAsterisk {...form.getInputProps('name')} />
                    <SlugInput
                        label="Slug"
                        sourceValue={form.values.name}
                        showRegenerate={Boolean(editing)}
                        onRegenerate={regenerateSlug}
                        {...slugInputProps}
                    />
                    <NumberInput label="Thứ tự hiển thị" min={0} {...form.getInputProps('sort_order')} />
                    <Switch
                        label="Hiển thị trên website"
                        {...form.getInputProps('is_active', { type: 'checkbox' })}
                    />
                    {errors?.name && (
                        <Text size="sm" c="red">
                            {errors.name}
                        </Text>
                    )}
                </Stack>
            </AdminFormDrawer>
        </>
    );
}
