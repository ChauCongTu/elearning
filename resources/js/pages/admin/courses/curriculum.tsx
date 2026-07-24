import { Head, Link, router } from '@inertiajs/react';
import {
    Accordion,
    Badge,
    Button,
    FileInput,
    Group,
    Modal,
    NumberInput,
    Progress,
    Stack,
    Switch,
    Text,
    TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import { confirmDelete } from '@/lib/admin-confirm';
import { prepareMultipartPayload } from '@/lib/admin-form';
import { formatDuration } from '@/lib/format';
import type { AdminChapter, AdminLesson } from '@/types';

type Props = {
    course: { id: string; title: string; slug: string };
    chapters: AdminChapter[];
};

type ChapterFormValues = {
    title: string;
    is_published: boolean;
};

type LessonFormValues = {
    title: string;
    duration_minutes: number;
    is_free_preview: boolean;
    is_published: boolean;
    video: File | null;
};

export default function AdminCourseCurriculum({ course, chapters }: Props) {
    const [chapterModal, chapterHandlers] = useDisclosure(false);
    const [lessonModal, lessonHandlers] = useDisclosure(false);
    const [editingChapter, setEditingChapter] = useState<AdminChapter | null>(null);
    const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
    const [activeChapter, setActiveChapter] = useState<AdminChapter | null>(null);
    const [savingChapter, setSavingChapter] = useState(false);
    const [savingLesson, setSavingLesson] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const chapterForm = useForm<ChapterFormValues>({
        initialValues: { title: '', is_published: true },
        validate: {
            title: (value) => (value.trim() ? null : 'Vui lòng nhập tên chương'),
        },
    });

    const lessonForm = useForm<LessonFormValues>({
        initialValues: {
            title: '',
            duration_minutes: 0,
            is_free_preview: false,
            is_published: true,
            video: null,
        },
        validate: {
            title: (value) => (value.trim() ? null : 'Vui lòng nhập tên bài'),
        },
    });

    const closeChapterModal = () => {
        chapterHandlers.close();
        setEditingChapter(null);
        chapterForm.reset();
    };

    const closeLessonModal = () => {
        lessonHandlers.close();
        setEditingLesson(null);
        setActiveChapter(null);
        lessonForm.reset();
    };

    const openCreateChapter = () => {
        setEditingChapter(null);
        chapterForm.setValues({ title: '', is_published: true });
        chapterHandlers.open();
    };

    const openEditChapter = (chapter: AdminChapter) => {
        setEditingChapter(chapter);
        chapterForm.setValues({
            title: chapter.title,
            is_published: chapter.is_published,
        });
        chapterHandlers.open();
    };

    const openCreateLesson = (chapter: AdminChapter) => {
        setEditingLesson(null);
        setActiveChapter(chapter);
        lessonForm.setValues({
            title: '',
            duration_minutes: 0,
            is_free_preview: false,
            is_published: true,
            video: null,
        });
        lessonHandlers.open();
    };

    const openEditLesson = (chapter: AdminChapter, lesson: AdminLesson) => {
        setEditingLesson(lesson);
        setActiveChapter(chapter);
        lessonForm.setValues({
            title: lesson.title,
            duration_minutes: Math.round((lesson.duration_seconds / 60) * 10) / 10,
            is_free_preview: lesson.is_free_preview,
            is_published: lesson.is_published,
            video: null,
        });
        lessonHandlers.open();
    };

    const saveChapter = () => {
        if (chapterForm.validate().hasErrors) {
            return;
        }

        const options = {
            onStart: () => setSavingChapter(true),
            onFinish: () => setSavingChapter(false),
            onSuccess: () => closeChapterModal(),
        };

        if (editingChapter) {
            router.patch(`/admin/chapters/${editingChapter.id}`, chapterForm.values, options);
            return;
        }

        router.post(`/admin/courses/${course.id}/chapters`, chapterForm.values, options);
    };

    const saveLesson = () => {
        if (!activeChapter || lessonForm.validate().hasErrors) {
            return;
        }

        const payload = prepareMultipartPayload(
            {
                title: lessonForm.values.title,
                duration_seconds: Math.max(0, Math.round(lessonForm.values.duration_minutes * 60)),
                is_free_preview: lessonForm.values.is_free_preview,
                is_published: lessonForm.values.is_published,
                video: lessonForm.values.video,
            },
            ['video'],
        );

        const hasVideo = lessonForm.values.video instanceof File;

        const options = {
            forceFormData: true,
            onStart: () => {
                setSavingLesson(true);
                setUploadProgress(hasVideo ? 0 : null);
            },
            onProgress: (progress: { percentage: number | null }) => {
                if (hasVideo && progress.percentage !== null) {
                    setUploadProgress(Math.round(progress.percentage));
                }
            },
            onFinish: () => {
                setSavingLesson(false);
                setUploadProgress(null);
            },
            onSuccess: () => closeLessonModal(),
        };

        if (editingLesson) {
            router.post(
                `/admin/lessons/${editingLesson.id}`,
                { _method: 'patch', ...payload },
                options,
            );
            return;
        }

        router.post(`/admin/chapters/${activeChapter.id}/lessons`, payload, options);
    };

    const moveChapter = (index: number, direction: -1 | 1) => {
        const ids = chapters.map((c) => c.id);
        const target = index + direction;
        if (target < 0 || target >= ids.length) return;
        [ids[index], ids[target]] = [ids[target], ids[index]];
        router.post(`/admin/courses/${course.id}/chapters/reorder`, { ordered_ids: ids });
    };

    const moveLesson = (chapter: AdminChapter, index: number, direction: -1 | 1) => {
        const ids = chapter.lessons.map((l) => l.id);
        const target = index + direction;
        if (target < 0 || target >= ids.length) return;
        [ids[index], ids[target]] = [ids[target], ids[index]];
        router.post(`/admin/chapters/${chapter.id}/lessons/reorder`, { ordered_ids: ids });
    };

    return (
        <>
            <Head title={`Chương trình — ${course.title}`} />
            <AdminPageHeader
                title="Chương trình học"
                description={course.title}
                actions={
                    <Group>
                        <Button component={Link} href={`/admin/courses/${course.id}/edit`} variant="default">
                            Sửa khóa học
                        </Button>
                        <Button leftSection={<Plus size={16} />} onClick={openCreateChapter}>
                            Thêm chương
                        </Button>
                    </Group>
                }
            />

            {chapters.length === 0 ? (
                <Text c="dimmed">Chưa có chương nào. Thêm chương đầu tiên để bắt đầu.</Text>
            ) : (
                <Accordion variant="separated">
                    {chapters.map((chapter, chapterIndex) => (
                        <Accordion.Item key={chapter.id} value={chapter.id}>
                            <Accordion.Control>
                                <Group justify="space-between" wrap="nowrap" pr="md">
                                    <Group gap="xs" wrap="nowrap">
                                        <Text fw={600}>{chapter.title}</Text>
                                        {!chapter.is_published && (
                                            <Badge color="gray" variant="light" size="sm">
                                                Nháp
                                            </Badge>
                                        )}
                                    </Group>
                                    <Badge variant="light" size="sm">
                                        {chapter.lessons.length} bài
                                    </Badge>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Group mb="sm">
                                    <Button size="xs" variant="light" onClick={() => moveChapter(chapterIndex, -1)}>
                                        <ArrowUp size={14} />
                                    </Button>
                                    <Button size="xs" variant="light" onClick={() => moveChapter(chapterIndex, 1)}>
                                        <ArrowDown size={14} />
                                    </Button>
                                    <Button size="xs" variant="light" leftSection={<Pencil size={14} />} onClick={() => openEditChapter(chapter)}>
                                        Sửa
                                    </Button>
                                    <Button size="xs" variant="light" onClick={() => openCreateLesson(chapter)}>
                                        Thêm bài
                                    </Button>
                                    <Button
                                        size="xs"
                                        variant="light"
                                        color="red"
                                        onClick={() =>
                                            confirmDelete({
                                                message: `Xóa chương "${chapter.title}" và toàn bộ bài học bên trong? Hành động này không thể hoàn tác.`,
                                                onConfirm: () => router.delete(`/admin/chapters/${chapter.id}`),
                                            })
                                        }
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </Group>

                                <Stack gap="xs">
                                    {chapter.lessons.map((lesson, lessonIndex) => (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                                        >
                                            <div>
                                                <Group gap={6}>
                                                    <Text size="sm" fw={600}>
                                                        {lesson.title}
                                                    </Text>
                                                    {!lesson.is_published && (
                                                        <Badge color="gray" variant="light" size="xs">
                                                            Nháp
                                                        </Badge>
                                                    )}
                                                </Group>
                                                <Text size="xs" c="dimmed">
                                                    {formatDuration(lesson.duration_seconds)}
                                                    {lesson.video_s3_key ? ' · Có video' : ''}
                                                    {lesson.is_free_preview ? ' · Preview' : ''}
                                                </Text>
                                            </div>
                                            <Group gap={4}>
                                                <Button size="xs" variant="subtle" onClick={() => moveLesson(chapter, lessonIndex, -1)}>
                                                    <ArrowUp size={14} />
                                                </Button>
                                                <Button size="xs" variant="subtle" onClick={() => moveLesson(chapter, lessonIndex, 1)}>
                                                    <ArrowDown size={14} />
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="subtle"
                                                    onClick={() => openEditLesson(chapter, lesson)}
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="subtle"
                                                    color="red"
                                                    onClick={() =>
                                                        confirmDelete({
                                                            message: `Xóa bài học "${lesson.title}"? Hành động này không thể hoàn tác.`,
                                                            onConfirm: () =>
                                                                router.delete(`/admin/lessons/${lesson.id}`),
                                                        })
                                                    }
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </Group>
                                        </div>
                                    ))}
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}

            <Modal
                opened={chapterModal}
                onClose={closeChapterModal}
                title={editingChapter ? 'Sửa chương' : 'Thêm chương'}
            >
                <Stack>
                    <TextInput
                        label="Tên chương"
                        placeholder="VD: Chương 1 — Nền tảng"
                        withAsterisk
                        {...chapterForm.getInputProps('title')}
                    />
                    <Switch
                        label="Xuất bản"
                        {...chapterForm.getInputProps('is_published', { type: 'checkbox' })}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={closeChapterModal}>
                            Hủy
                        </Button>
                        <Button loading={savingChapter} onClick={saveChapter}>
                            {editingChapter ? 'Lưu chương' : 'Thêm chương'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal
                opened={lessonModal}
                onClose={savingLesson ? () => undefined : closeLessonModal}
                title={editingLesson ? 'Sửa bài học' : 'Thêm bài học'}
                size="md"
                closeOnClickOutside={!savingLesson}
                closeOnEscape={!savingLesson}
            >
                <Stack>
                    <TextInput
                        label="Tên bài học"
                        placeholder="VD: Giới thiệu khóa học"
                        withAsterisk
                        {...lessonForm.getInputProps('title')}
                    />
                    <NumberInput
                        label="Thời lượng"
                        suffix=" phút"
                        min={0}
                        decimalScale={1}
                        {...lessonForm.getInputProps('duration_minutes')}
                    />
                    <FileInput
                        label="Video bài học"
                        accept="video/mp4,video/webm,video/quicktime"
                        clearable
                        {...lessonForm.getInputProps('video')}
                    />
                    <Switch
                        label="Cho xem thử miễn phí"
                        {...lessonForm.getInputProps('is_free_preview', { type: 'checkbox' })}
                    />
                    <Switch
                        label="Xuất bản"
                        {...lessonForm.getInputProps('is_published', { type: 'checkbox' })}
                    />
                    {uploadProgress !== null && (
                        <Stack gap={6}>
                            <Text size="sm" c="dimmed">
                                Đang tải video lên… {uploadProgress}%
                            </Text>
                            <Progress value={uploadProgress} color="pink" size="sm" animated />
                        </Stack>
                    )}
                    <Group justify="flex-end">
                        <Button variant="default" onClick={closeLessonModal} disabled={savingLesson}>
                            Hủy
                        </Button>
                        <Button loading={savingLesson && uploadProgress === null} onClick={saveLesson}>
                            {editingLesson ? 'Lưu bài học' : 'Thêm bài học'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
