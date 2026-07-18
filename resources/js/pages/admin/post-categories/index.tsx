import { Head, router, usePage } from '@inertiajs/react';
import {
    Button,
    Group,
    NumberInput,
    Stack,
    Switch,
    Table,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminFormDrawer from '@/components/admin/admin-form-drawer';
import AdminListSwitch from '@/components/admin/admin-list-switch';
import AdminPageHeader from '@/components/admin/admin-page-header';
import SlugInput from '@/components/admin/slug-input';
import { useAutoSlug } from '@/hooks/use-auto-slug';
import { confirmDelete } from '@/lib/admin-confirm';
import type { AdminPostCategory } from '@/types';

type Props = {
    categories: AdminPostCategory[];
};

export default function AdminPostCategoriesIndex({ categories }: Props) {
    const [opened, { open, close }] = useDisclosure(false);
    const [editing, setEditing] = useState<AdminPostCategory | null>(null);
    const { errors } = usePage().props as { errors?: Record<string, string> };

    const form = useForm({
        initialValues: {
            name: '',
            slug: '',
            description: '',
            sort_order: 0,
            is_active: true,
        },
        validate: {
            name: (value: string) => (value.trim() ? null : 'Vui lòng nhập tên danh mục'),
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

    const openEdit = (category: AdminPostCategory) => {
        setEditing(category);
        form.setValues({
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
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
            router.patch(`/admin/post-categories/${editing.id}`, form.values, { onSuccess: () => close() });
        } else {
            router.post('/admin/post-categories', form.values, { onSuccess: () => close() });
        }
    };

    return (
        <>
            <Head title="Danh mục tin tức" />
            <AdminPageHeader
                title="Danh mục tin tức"
                description="Phân loại bài viết trên trang tin tức."
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
                        <Table.Th>Bài viết</Table.Th>
                        <Table.Th>Hiển thị</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {categories.map((category) => (
                        <Table.Tr key={category.id}>
                            <Table.Td>{category.name}</Table.Td>
                            <Table.Td>{category.slug}</Table.Td>
                            <Table.Td>{category.posts_count ?? 0}</Table.Td>
                            <Table.Td>
                                <AdminListSwitch
                                    url={`/admin/post-categories/${category.id}/toggle`}
                                    field="is_active"
                                    checked={category.is_active}
                                    label="Hiển thị danh mục tin"
                                />
                            </Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <Button size="xs" variant="light" onClick={() => openEdit(category)}>
                                        <Pencil size={14} />
                                    </Button>
                                    <Button
                                        size="xs"
                                        variant="light"
                                        color="red"
                                        onClick={() =>
                                            confirmDelete({
                                                message: `Xóa danh mục "${category.name}"? Hành động này không thể hoàn tác.`,
                                                onConfirm: () =>
                                                    router.delete(`/admin/post-categories/${category.id}`),
                                            })
                                        }
                                    >
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
                title={editing ? 'Sửa danh mục tin' : 'Thêm danh mục tin'}
                onSubmit={submit}
                size="lg"
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
                    <Textarea label="Mô tả ngắn" minRows={2} maxLength={500} {...form.getInputProps('description')} />
                    <NumberInput label="Thứ tự" min={0} {...form.getInputProps('sort_order')} />
                    <Switch label="Hiển thị" {...form.getInputProps('is_active', { type: 'checkbox' })} />
                    {errors?.name && <Text size="sm" c="red">{errors.name}</Text>}
                </Stack>
            </AdminFormDrawer>
        </>
    );
}
