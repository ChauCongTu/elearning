import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Button,
    Group,
    Select,
    Stack,
    Switch,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import AdminPageHeader from '@/components/admin/admin-page-header';
import AuthAuthorField from '@/components/admin/auth-author-field';
import ImageUploadField from '@/components/admin/image-upload-field';
import AdminRichTextField from '@/components/admin/rich-text-field';
import SlugInput from '@/components/admin/slug-input';
import { useAutoSlug } from '@/hooks/use-auto-slug';
import { prepareMultipartPayload } from '@/lib/admin-form';
import type { AdminPostCategory, AdminPostForm, Auth } from '@/types';

type Props = {
    post: AdminPostForm | null;
    categories: AdminPostCategory[];
};

type FormValues = {
    post_category_id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author_name: string;
    is_published: boolean;
    is_featured: boolean;
    featured_image: File | null;
};

export default function AdminPostFormPage({ post, categories }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isEdit = post !== null;
    const authorName = auth.user?.name ?? post?.author_name ?? '';

    const form = useForm<FormValues>({
        initialValues: {
            post_category_id: post?.post_category_id ?? '',
            title: post?.title ?? '',
            slug: post?.slug ?? '',
            excerpt: post?.excerpt ?? '',
            content: post?.content ?? '',
            author_name: authorName,
            is_published: post?.is_published ?? false,
            is_featured: post?.is_featured ?? false,
            featured_image: null,
        },
        validate: {
            title: (value) => (value.trim() ? null : 'Vui lòng nhập tiêu đề'),
            excerpt: (value) => (value.length <= 1000 ? null : 'Tối đa 1000 ký tự'),
        },
    });

    const { slugInputProps, regenerateSlug } = useAutoSlug(form, 'title', 'slug', !isEdit);

    const submit = () => {
        if (form.validate().hasErrors) {
            return;
        }

        const payload = prepareMultipartPayload(
            {
                ...form.values,
                post_category_id: form.values.post_category_id || null,
                author_name: auth.user?.name ?? form.values.author_name,
            },
            ['featured_image'],
        );

        if (isEdit) {
            router.post(`/admin/posts/${post.id}`, { _method: 'patch', ...payload }, { forceFormData: true });
        } else {
            router.post('/admin/posts', payload, { forceFormData: true });
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Sửa bài viết' : 'Viết bài mới'} />

            <Group justify="space-between" mb="lg" wrap="wrap">
                <AdminPageHeader
                    title={isEdit ? 'Sửa bài viết' : 'Viết bài mới'}
                    description="Soạn nội dung bên trái, cấu hình meta bên phải."
                />
                <Group>
                    <Button component={Link} href="/admin/posts" variant="default">
                        Quay lại
                    </Button>
                    <Button onClick={submit}>{isEdit ? 'Lưu bài viết' : 'Đăng bài'}</Button>
                </Group>
            </Group>

            <div className="admin-post-editor">
                <div className="admin-post-editor__content-panel">
                    <TextInput
                        label="Tiêu đề bài viết"
                        placeholder="Nhập tiêu đề..."
                        size="md"
                        mb="md"
                        withAsterisk
                        {...form.getInputProps('title')}
                    />
                    <AdminRichTextField
                        label="Nội dung"
                        description="Soạn thảo bài viết — có thể chèn ảnh trực tiếp."
                        value={form.values.content}
                        onChange={(value) => form.setFieldValue('content', value)}
                        minHeight={520}
                        required
                    />
                </div>

                <aside className="admin-post-editor__meta admin-post-editor__meta-panel">
                    <Title order={5} mb="md">
                        Thông tin bài viết
                    </Title>
                    <Stack gap="md">
                        <Select
                            label="Danh mục"
                            placeholder="Chọn danh mục"
                            data={categories.map((c) => ({ value: c.id, label: c.name }))}
                            searchable
                            clearable
                            {...form.getInputProps('post_category_id')}
                        />
                        <SlugInput
                            label="Slug"
                            sourceValue={form.values.title}
                            showRegenerate={isEdit}
                            onRegenerate={regenerateSlug}
                            {...slugInputProps}
                        />
                        <AuthAuthorField value={authorName} />
                        <Textarea
                            label="Tóm tắt"
                            description="Hiển thị trên thẻ bài viết."
                            minRows={4}
                            maxLength={1000}
                            {...form.getInputProps('excerpt')}
                        />
                        <Text size="xs" c="dimmed" ta="right" mt={-8}>
                            {form.values.excerpt.length}/1000
                        </Text>
                        <ImageUploadField
                            label="Ảnh đại diện"
                            description="Tỷ lệ 16:9 khuyến nghị."
                            existingUrl={post?.featured_image}
                            value={form.values.featured_image}
                            onChange={(file) => form.setFieldValue('featured_image', file)}
                        />
                        <Switch
                            label="Xuất bản"
                            {...form.getInputProps('is_published', { type: 'checkbox' })}
                        />
                        <Switch
                            label="Nổi bật"
                            {...form.getInputProps('is_featured', { type: 'checkbox' })}
                        />
                    </Stack>
                </aside>
            </div>
        </>
    );
}
