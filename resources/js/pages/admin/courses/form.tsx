import { Head, Link, router } from '@inertiajs/react';
import {
    Badge,
    Button,
    Divider,
    Group,
    NumberInput,
    Paper,
    Select,
    Stack,
    Switch,
    TagsInput,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ExternalLink, ListTree, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import FaqEditor, { sanitizeFaqItems, type FaqItem } from '@/components/admin/faq-editor';
import ImageUploadField from '@/components/admin/image-upload-field';
import AdminRichTextField from '@/components/admin/rich-text-field';
import SlugInput from '@/components/admin/slug-input';
import { useAutoSlug } from '@/hooks/use-auto-slug';
import { prepareMultipartPayload } from '@/lib/admin-form';
import { formatPrice } from '@/lib/format';
import type { AdminCategory, AdminCourseForm } from '@/types';

type Props = {
    course: AdminCourseForm | null;
    categories: AdminCategory[];
};

type FormValues = {
    category_id: string;
    title: string;
    slug: string;
    excerpt: string;
    description: string;
    price: number;
    compare_price: number | '';
    instructor_name: string;
    instructor_title: string;
    duration_label: string;
    lesson_count_label: string;
    benefits: string[];
    faq: FaqItem[];
    is_featured: boolean;
    is_published: boolean;
    thumbnail: File | null;
    certificate_template_type: string;
    certificate_template: string;
    purchase_count_offset: number;
};

function discountPercent(price: number, comparePrice: number | ''): number | null {
    if (comparePrice === '' || comparePrice <= price || price <= 0) {
        return null;
    }

    return Math.round(((Number(comparePrice) - price) / Number(comparePrice)) * 100);
}

export default function AdminCourseFormPage({ course, categories }: Props) {
    const isEdit = course !== null;
    const [saving, setSaving] = useState(false);

    const form = useForm<FormValues>({
        initialValues: {
            category_id: course?.category_id ?? '',
            title: course?.title ?? '',
            slug: course?.slug ?? '',
            excerpt: course?.excerpt ?? '',
            description: course?.description ?? '',
            price: Number(course?.price ?? 0),
            compare_price: course?.compare_price ? Number(course.compare_price) : '',
            instructor_name: course?.instructor_name ?? '',
            instructor_title: course?.instructor_title ?? '',
            duration_label: course?.duration_label ?? '',
            lesson_count_label: course?.lesson_count_label ?? '',
            benefits: course?.benefits ?? [],
            faq: course?.faq ?? [],
            is_featured: course?.is_featured ?? false,
            is_published: course?.is_published ?? false,
            thumbnail: null,
            certificate_template_type: course?.certificate_template_type ?? 'default',
            certificate_template: course?.certificate_template ?? '',
            purchase_count_offset: course?.purchase_count_offset ?? 0,
        },
        validate: {
            title: (value) => (value.trim() ? null : 'Vui lòng nhập tên khóa học'),
            price: (value) => (value >= 0 ? null : 'Giá không hợp lệ'),
            excerpt: (value) => (value.length <= 1000 ? null : 'Tối đa 1000 ký tự'),
        },
    });

    const { slugInputProps, regenerateSlug } = useAutoSlug(form, 'title', 'slug', !isEdit);

    const discount = useMemo(
        () => discountPercent(form.values.price, form.values.compare_price),
        [form.values.price, form.values.compare_price],
    );

    const previewSlug = form.values.slug || course?.slug;

    const submit = () => {
        if (form.validate().hasErrors) {
            return;
        }

        const payload = prepareMultipartPayload(
            {
                ...form.values,
                category_id: form.values.category_id || null,
                compare_price: form.values.compare_price === '' ? null : form.values.compare_price,
                faq: sanitizeFaqItems(form.values.faq),
            },
            ['thumbnail'],
        );

        const options = {
            forceFormData: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
        };

        if (isEdit) {
            router.post(`/admin/courses/${course.id}`, { _method: 'patch', ...payload }, options);
        } else {
            router.post('/admin/courses', payload, options);
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Sửa khóa học' : 'Thêm khóa học'} />

            <Group justify="space-between" mb="lg" wrap="wrap" align="flex-start">
                <AdminPageHeader
                    title={isEdit ? 'Sửa khóa học' : 'Thêm khóa học'}
                />
                <Group wrap="wrap">
                    <Button component={Link} href="/admin/courses" variant="default">
                        Quay lại
                    </Button>
                    {isEdit && previewSlug && (
                        <Button
                            component="a"
                            href={`/courses/${previewSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="light"
                            leftSection={<ExternalLink size={16} />}
                        >
                            Xem trang
                        </Button>
                    )}
                    {isEdit && (
                        <Button
                            component={Link}
                            href={`/admin/courses/${course.id}/curriculum`}
                            variant="light"
                            leftSection={<ListTree size={16} />}
                        >
                            Chương trình
                        </Button>
                    )}
                    <Button leftSection={<Save size={16} />} loading={saving} onClick={submit}>
                        {isEdit ? 'Lưu thay đổi' : 'Tạo khóa học'}
                    </Button>
                </Group>
            </Group>

            <div className="admin-course-editor">
                <div className="admin-course-editor__content">
                    <TextInput
                        label="Tên khóa học"
                        placeholder="VD: Khóa học phun xăm thẩm mỹ cơ bản"
                        size="md"
                        mb="md"
                        withAsterisk
                        {...form.getInputProps('title')}
                    />

                    <Textarea
                        label="Mô tả ngắn"
                        placeholder="Tóm tắt 1–2 câu thu hút học viên"
                        minRows={3}
                        maxLength={1000}
                        mb={4}
                        {...form.getInputProps('excerpt')}
                    />
                    <Text size="xs" c="dimmed" ta="right" mb="lg">
                        {form.values.excerpt.length}/1000
                    </Text>

                    <AdminRichTextField
                        label="Mô tả đầy đủ"
                        value={form.values.description}
                        onChange={(value) => form.setFieldValue('description', value)}
                        error={form.errors.description as string | undefined}
                        minHeight={360}
                    />

                    <Divider my="xl" label="FAQ" labelPosition="left" />

                    <FaqEditor
                        value={form.values.faq}
                        onChange={(value) => form.setFieldValue('faq', value)}
                    />

                    <Divider my="xl" label="Lợi ích nổi bật" labelPosition="left" />

                    <TagsInput
                        placeholder="VD: Học thực hành trên mẫu thật"
                        {...form.getInputProps('benefits')}
                    />
                </div>

                <aside className="admin-course-editor__sidebar">
                    <Stack gap="md">
                        <Paper className="admin-course-editor__card" p="md" radius="md">
                            <Group justify="space-between" mb="sm">
                                <Title order={6}>Trạng thái</Title>
                                <Group gap={6}>
                                    <Badge color={form.values.is_published ? 'teal' : 'gray'} variant="light">
                                        {form.values.is_published ? 'Đang bán' : 'Nháp'}
                                    </Badge>
                                    {form.values.is_featured && (
                                        <Badge color="yellow" variant="light">
                                            Nổi bật
                                        </Badge>
                                    )}
                                </Group>
                            </Group>
                            <Stack gap="sm">
                                <Switch
                                    label="Xuất bản"
                                    {...form.getInputProps('is_published', { type: 'checkbox' })}
                                />
                                <Switch
                                    label="Khóa nổi bật"
                                    {...form.getInputProps('is_featured', { type: 'checkbox' })}
                                />
                            </Stack>
                        </Paper>

                        <Paper className="admin-course-editor__card" p="md" radius="md">
                            <Title order={6} mb="md">
                                Phân loại & URL
                            </Title>
                            <Stack gap="md">
                                <Select
                                    label="Danh mục"
                                    placeholder="Chọn danh mục"
                                    data={categories.map((c) => ({ value: c.id, label: c.name }))}
                                    searchable
                                    clearable
                                    {...form.getInputProps('category_id')}
                                />
                                <SlugInput
                                    label="Slug"
                                    placeholder="khoa-hoc-phun-xam-co-ban"
                                    sourceValue={form.values.title}
                                    showRegenerate={isEdit}
                                    onRegenerate={regenerateSlug}
                                    {...slugInputProps}
                                />
                            </Stack>
                        </Paper>

                        <Paper className="admin-course-editor__card" p="md" radius="md">
                            <Title order={6} mb="md">
                                Ảnh thumbnail
                            </Title>
                            <ImageUploadField
                                existingUrl={course?.thumbnail_url ?? course?.thumbnail_path}
                                value={form.values.thumbnail}
                                onChange={(file) => form.setFieldValue('thumbnail', file)}
                                previewHeight={140}
                            />
                        </Paper>

                        <Paper className="admin-course-editor__card" p="md" radius="md">
                            <Title order={6} mb="md">
                                Giá bán
                            </Title>
                            <Stack gap="md">
                                <NumberInput
                                    label="Giá bán"
                                    suffix=" đ"
                                    thousandSeparator=","
                                    min={0}
                                    withAsterisk
                                    {...form.getInputProps('price')}
                                />
                                <NumberInput
                                    label="Giá gốc (gạch ngang)"
                                    suffix=" đ"
                                    thousandSeparator=","
                                    min={0}
                                    {...form.getInputProps('compare_price')}
                                />
                                {discount !== null && (
                                    <div className="admin-course-editor__price-preview">
                                        <Text size="sm" c="dimmed">
                                            Giá gốc{' '}
                                            <Text span td="line-through" inherit>
                                                {formatPrice(form.values.compare_price)}
                                            </Text>
                                        </Text>
                                        <Group gap="xs" mt={4}>
                                            <Text fw={700} c="pink">
                                                {formatPrice(form.values.price)}
                                            </Text>
                                            <Badge color="pink" variant="light" size="sm">
                                                -{discount}%
                                            </Badge>
                                        </Group>
                                    </div>
                                )}
                            </Stack>
                        </Paper>

                        <Paper className="admin-course-editor__card" p="md" radius="md">
                            <Title order={6} mb="md">
                                Giảng viên & thời lượng
                            </Title>
                            <Stack gap="md">
                                <TextInput
                                    label="Tên giảng viên"
                                    placeholder="Cô Nguyễn Thị A"
                                    {...form.getInputProps('instructor_name')}
                                />
                                <TextInput
                                    label="Chức danh"
                                    placeholder="Chuyên gia phun xăm 10 năm"
                                    {...form.getInputProps('instructor_title')}
                                />
                                <Group grow>
                                    <TextInput
                                        label="Thời lượng"
                                        placeholder="2–3 tháng"
                                        {...form.getInputProps('duration_label')}
                                    />
                                    <TextInput
                                        label="Số bài học"
                                        placeholder="25 bài"
                                        {...form.getInputProps('lesson_count_label')}
                                    />
                                </Group>
                            </Stack>
                        </Paper>

                        <Paper className="admin-course-editor__card" p="md" radius="md">
                            <Title order={6} mb="md">
                                Marketing
                            </Title>
                            <NumberInput
                                label="Số lượt mua ban đầu"
                                min={0}
                                {...form.getInputProps('purchase_count_offset')}
                            />
                            {isEdit && course?.purchase_count !== undefined && (
                                <Text size="sm" c="dimmed" mt="xs">
                                    Hiển thị công khai: {course.purchase_count} lượt mua
                                </Text>
                            )}
                        </Paper>

                        <Paper className="admin-course-editor__card" p="md" radius="md">
                            <Title order={6} mb="md">
                                Template chứng chỉ PDF
                            </Title>
                            <Stack gap="md">
                                <Select
                                    label="Loại template"
                                    data={[
                                        { value: 'default', label: 'Mặc định (Blade)' },
                                        { value: 'markdown', label: 'Markdown → PDF' },
                                        { value: 'latex', label: 'LaTeX → PDF' },
                                    ]}
                                    {...form.getInputProps('certificate_template_type')}
                                />
                                {form.values.certificate_template_type !== 'default' && (
                                    <>
                                        <Textarea
                                            label="Nội dung template"
                                            placeholder={
                                                form.values.certificate_template_type === 'latex'
                                                    ? '\\documentclass{article}...'
                                                    : '# CHỨNG CHỈ\n\n**{{name}}** ...'
                                            }
                                            minRows={10}
                                            autosize
                                            styles={{ input: { fontFamily: 'monospace', fontSize: 12 } }}
                                            {...form.getInputProps('certificate_template')}
                                        />
                                        <Text size="xs" c="dimmed">
                                            Biến: {(course?.certificate_placeholders ?? [
                                                '{{name}}',
                                                '{{student_code}}',
                                                '{{course}}',
                                                '{{graduation_date_formatted}}',
                                                '{{organization}}',
                                            ]).join(', ')}
                                        </Text>
                                    </>
                                )}
                            </Stack>
                        </Paper>
                    </Stack>
                </aside>
            </div>
        </>
    );
}
