import { Head, router, usePage } from '@inertiajs/react';
import {
    Button,
    Group,
    NumberInput,
    Stack,
    Switch,
    Table,
    Text,
    TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminFormDrawer from '@/components/admin/admin-form-drawer';
import AdminListSwitch from '@/components/admin/admin-list-switch';
import AdminPageHeader from '@/components/admin/admin-page-header';
import ImageUploadField from '@/components/admin/image-upload-field';
import { confirmDelete } from '@/lib/admin-confirm';
import { formatDateTime, mediaUrl } from '@/lib/format';
import type { AdminBanner } from '@/types';

type FormValues = {
    title: string;
    link_url: string;
    sort_order: number;
    is_active: boolean;
    starts_at: string;
    ends_at: string;
    image: File | null;
};

type Props = {
    banners: AdminBanner[];
};

export default function AdminBannersIndex({ banners }: Props) {
    const [opened, { open, close }] = useDisclosure(false);
    const [editing, setEditing] = useState<AdminBanner | null>(null);
    const { errors } = usePage().props as { errors?: Record<string, string> };

    const form = useForm<FormValues>({
        initialValues: {
            title: '',
            link_url: '',
            sort_order: 0,
            is_active: true,
            starts_at: '',
            ends_at: '',
            image: null,
        },
        validate: {
            title: (value) => (value.trim() ? null : 'Vui lòng nhập tiêu đề'),
            link_url: (value) =>
                !value || /^https?:\/\/.+/i.test(value) ? null : 'URL phải bắt đầu bằng http:// hoặc https://',
        },
    });

    const openCreate = () => {
        setEditing(null);
        form.reset();
        open();
    };

    const openEdit = (banner: AdminBanner) => {
        setEditing(banner);
        form.setValues({
            title: banner.title,
            link_url: banner.link_url ?? '',
            sort_order: banner.sort_order,
            is_active: banner.is_active,
            starts_at: banner.starts_at?.slice(0, 10) ?? '',
            ends_at: banner.ends_at?.slice(0, 10) ?? '',
            image: null,
        });
        open();
    };

    const submit = () => {
        if (!editing && !form.values.image) {
            form.setFieldError('image', 'Vui lòng chọn ảnh banner');
            return;
        }

        if (form.validate().hasErrors) {
            return;
        }

        const payload: Record<string, unknown> = {
            title: form.values.title,
            sort_order: form.values.sort_order,
            is_active: form.values.is_active ? 1 : 0,
        };

        if (form.values.link_url) {
            payload.link_url = form.values.link_url;
        }

        if (form.values.starts_at) {
            payload.starts_at = form.values.starts_at;
        }

        if (form.values.ends_at) {
            payload.ends_at = form.values.ends_at;
        }

        if (form.values.image) {
            payload.image = form.values.image;
        }

        if (editing) {
            router.post(
                `/admin/banners/${editing.id}`,
                { _method: 'patch', ...payload },
                { forceFormData: true, onSuccess: () => close() },
            );
        } else {
            router.post('/admin/banners', payload, {
                forceFormData: true,
                onSuccess: () => close(),
            });
        }
    };

    return (
        <>
            <Head title="Banner" />
            <AdminPageHeader
                title="Banner trang chủ"
                description="Quản lý banner slider hiển thị trên homepage."
                actions={
                    <Button leftSection={<Plus size={16} />} onClick={openCreate}>
                        Thêm banner
                    </Button>
                }
            />

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Ảnh</Table.Th>
                        <Table.Th>Tiêu đề</Table.Th>
                        <Table.Th>Link</Table.Th>
                        <Table.Th>Lịch</Table.Th>
                        <Table.Th>Kích hoạt</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {banners.map((banner) => {
                        const img = mediaUrl(banner.image_path, banner.image_url);
                        return (
                            <Table.Tr key={banner.id}>
                                <Table.Td>
                                    {img && (
                                        <img src={img} alt="" className="h-12 w-24 rounded object-cover" />
                                    )}
                                </Table.Td>
                                <Table.Td>{banner.title}</Table.Td>
                                <Table.Td>{banner.link_url ?? '—'}</Table.Td>
                                <Table.Td>
                                    {formatDateTime(banner.starts_at)} — {formatDateTime(banner.ends_at)}
                                </Table.Td>
                                <Table.Td>
                                    <AdminListSwitch
                                        url={`/admin/banners/${banner.id}/toggle`}
                                        field="is_active"
                                        checked={banner.is_active}
                                        label="Kích hoạt banner"
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Button size="xs" variant="light" onClick={() => openEdit(banner)}>
                                            <Pencil size={14} />
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant="light"
                                            color="red"
                                            onClick={() =>
                                                confirmDelete({
                                                    message: `Xóa banner "${banner.title}"? Hành động này không thể hoàn tác.`,
                                                    onConfirm: () => router.delete(`/admin/banners/${banner.id}`),
                                                })
                                            }
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>

            <AdminFormDrawer
                opened={opened}
                onClose={close}
                title={editing ? 'Sửa banner' : 'Thêm banner'}
                onSubmit={submit}
                size="lg"
            >
                <Stack>
                    <TextInput
                        label="Tiêu đề nội bộ"
                        withAsterisk
                        {...form.getInputProps('title')}
                        error={form.errors.title || errors?.title}
                    />
                    <TextInput
                        label="Link khi click"
                        placeholder="https://..."
                        description="Mở tab mới khi khách bấm banner. Tự thêm ?source=APP_URL để tracking."
                        type="url"
                        {...form.getInputProps('link_url')}
                        error={form.errors.link_url || errors?.link_url}
                    />
                    <NumberInput label="Thứ tự hiển thị" min={0} {...form.getInputProps('sort_order')} />
                    <Group grow align="flex-start">
                        <DatePickerInput
                            label="Ngày bắt đầu"
                            clearable
                            value={form.values.starts_at ? new Date(form.values.starts_at) : null}
                            onChange={(value) =>
                                form.setFieldValue(
                                    'starts_at',
                                    value ? new Date(value).toISOString().slice(0, 10) : '',
                                )
                            }
                        />
                        <DatePickerInput
                            label="Ngày kết thúc"
                            clearable
                            minDate={form.values.starts_at ? new Date(form.values.starts_at) : undefined}
                            value={form.values.ends_at ? new Date(form.values.ends_at) : null}
                            onChange={(value) =>
                                form.setFieldValue(
                                    'ends_at',
                                    value ? new Date(value).toISOString().slice(0, 10) : '',
                                )
                            }
                        />
                    </Group>
                    <Switch label="Kích hoạt" {...form.getInputProps('is_active', { type: 'checkbox' })} />
                    <ImageUploadField
                        label={editing ? 'Ảnh mới (tùy chọn)' : 'Ảnh banner'}
                        description="Banner ngang thiết kế sẵn (khuyến nghị 1600×700px, tỷ lệ 16:7). Ảnh hiển thị trọn trên trang chủ, không bị cắt."
                        existingUrl={editing?.image_url ?? editing?.image_path}
                        value={form.values.image}
                        onChange={(file) => form.setFieldValue('image', file)}
                        error={(form.errors.image as string | undefined) || errors?.image}
                        previewHeight={140}
                    />
                </Stack>
            </AdminFormDrawer>
        </>
    );
}
