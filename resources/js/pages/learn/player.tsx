import { Head, Link, router } from '@inertiajs/react';
import {
    Alert,
    Badge,
    Box,
    Button,
    Group,
    NavLink,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ChevronLeft, ChevronRight, Lock, PlayCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGuardedVideo } from '@/hooks/use-guarded-video';
import { useLearnPageGuard } from '@/hooks/use-learn-page-guard';
import LearnLayout from '@/layouts/learn-layout';
import { patchLearnProgress } from '@/lib/learn-progress';
import { formatDuration } from '@/lib/format';
import type { LearnPlayerProps } from '@/types';

const HEARTBEAT_INTERVAL_MS = 20_000;

export default function LearnPlayer({
    course,
    currentLesson,
    videoUrl,
    chapters,
    navigation,
    canTrackProgress,
    unlock_ratio: unlockRatio,
}: LearnPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastSentRef = useRef(0);
    const unlockReloadedRef = useRef(false);
    const [progressPercent, setProgressPercent] = useState(
        Number.parseFloat(course.progress_percent),
    );
    const [lessonCompleted, setLessonCompleted] = useState(currentLesson.completed);

    const lessonUrl = (lessonId: string) =>
        `/learn/${course.slug}/lessons/${lessonId}`;

    useGuardedVideo({
        videoRef,
        resumeAt: currentLesson.watched_seconds,
        lessonKey: currentLesson.id,
        enabled: Boolean(videoUrl),
    });

    useLearnPageGuard(true);

    const sendProgress = useCallback(
        async (seconds: number, force = false) => {
            if (!canTrackProgress) {
                return;
            }

            const floored = Math.floor(seconds);

            if (!force && floored <= lastSentRef.current) {
                return;
            }

            lastSentRef.current = floored;

            try {
                const result = await patchLearnProgress(currentLesson.id, floored);
                setLessonCompleted(result.completed);
                setProgressPercent(Number.parseFloat(result.progress_percent));

                const unlockThreshold =
                    currentLesson.duration_seconds > 0
                        ? Math.max(
                              1,
                              Math.floor(currentLesson.duration_seconds * unlockRatio),
                          )
                        : 1;

                if (
                    !unlockReloadedRef.current &&
                    result.watched_seconds >= unlockThreshold
                ) {
                    unlockReloadedRef.current = true;
                    const hadNextLesson = navigation.next !== null;

                    router.reload({
                        only: ['chapters', 'navigation'],
                        preserveScroll: true,
                        onSuccess: (page) => {
                            const nextLesson = (page.props as LearnPlayerProps).navigation?.next;

                            if (nextLesson && !hadNextLesson) {
                                notifications.show({
                                    title: 'Đã mở khóa bài tiếp theo',
                                    message: `Bạn có thể học: «${nextLesson.title}»`,
                                    color: 'green',
                                    autoClose: 6000,
                                });
                            }
                        },
                    });
                }
            } catch {
                // Ignore transient network errors during heartbeat.
            }
        },
        [canTrackProgress, currentLesson.duration_seconds, currentLesson.id, navigation.next, unlockRatio],
    );

    useEffect(() => {
        lastSentRef.current = currentLesson.watched_seconds;
        unlockReloadedRef.current = false;
        setLessonCompleted(currentLesson.completed);
        setProgressPercent(Number.parseFloat(course.progress_percent));
    }, [course.progress_percent, currentLesson.completed, currentLesson.id, currentLesson.watched_seconds]);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !videoUrl) {
            return;
        }

        const resumeAt = currentLesson.watched_seconds;

        const handleLoadedMetadata = () => {
            if (resumeAt > 0 && resumeAt < video.duration) {
                video.currentTime = resumeAt;
            }
        };

        const handleTimeUpdate = () => {
            if (video.currentTime - lastSentRef.current >= 15) {
                void sendProgress(video.currentTime);
            }
        };

        const handlePause = () => {
            void sendProgress(video.currentTime, true);
        };

        const handleEnded = () => {
            void sendProgress(video.duration || video.currentTime, true);
        };

        const handleError = () => {
            router.reload({ only: ['videoUrl', 'videoUrlExpiresAt'] });
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('error', handleError);

        const interval = window.setInterval(() => {
            if (!video.paused && !video.ended) {
                void sendProgress(video.currentTime);
            }
        }, HEARTBEAT_INTERVAL_MS);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('error', handleError);
            window.clearInterval(interval);
        };
    }, [currentLesson.id, currentLesson.watched_seconds, sendProgress, videoUrl]);

    const sidebar = (
        <Stack gap="md">
            <div>
                <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                    Nội dung khóa học
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                    {chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} bài học
                </Text>
            </div>

            <Stack gap="lg">
                {chapters.map((chapter) => (
                    <Stack key={chapter.id} gap={4}>
                        <Text size="sm" fw={600}>
                            {chapter.title}
                        </Text>
                        <Stack gap={2}>
                            {chapter.lessons.map((lesson) => {
                                const leftSection = lesson.is_locked ? (
                                    <Lock className="size-4" />
                                ) : lesson.completed ? (
                                    <span className="text-xs text-green-600">✓</span>
                                ) : (
                                    <PlayCircle className="size-4" />
                                );

                                if (lesson.is_locked) {
                                    return (
                                        <NavLink
                                            key={lesson.id}
                                            label={lesson.title}
                                            description="Xem ít nhất 80% bài trước để mở khóa"
                                            leftSection={leftSection}
                                            disabled
                                        />
                                    );
                                }

                                return (
                                    <NavLink
                                        key={lesson.id}
                                        component={Link}
                                        href={lessonUrl(lesson.id)}
                                        label={lesson.title}
                                        description={
                                            lesson.duration_seconds > 0
                                                ? formatDuration(lesson.duration_seconds)
                                                : undefined
                                        }
                                        leftSection={leftSection}
                                        active={lesson.is_current}
                                    />
                                );
                            })}
                        </Stack>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );

    return (
        <>
            <Head title={`${currentLesson.title} — ${course.title}`} />

            <LearnLayout
                courseTitle={course.title}
                progressPercent={progressPercent}
                sidebar={sidebar}
            >
                <Stack gap="lg">
                    <Group justify="space-between" align="flex-start" wrap="wrap">
                        <div>
                            <Title order={2}>{currentLesson.title}</Title>
                            {currentLesson.duration_seconds > 0 && (
                                <Text size="sm" c="dimmed" mt={4}>
                                    {formatDuration(currentLesson.duration_seconds)}
                                </Text>
                            )}
                        </div>
                        <Group gap="xs">
                            {currentLesson.is_free_preview && (
                                <Badge color="blue" variant="light">
                                    Học thử miễn phí
                                </Badge>
                            )}
                            {lessonCompleted && (
                                <Badge color="green" variant="light">
                                    Đã hoàn thành
                                </Badge>
                            )}
                        </Group>
                    </Group>

                    {videoUrl ? (
                        <div
                            className="overflow-hidden rounded-xl bg-black shadow-lg select-none"
                            onContextMenu={(event) => event.preventDefault()}
                        >
                            <video
                                ref={videoRef}
                                key={`${currentLesson.id}-${videoUrl}`}
                                src={videoUrl}
                                controls
                                controlsList="nodownload noplaybackrate"
                                disablePictureInPicture
                                className="aspect-video w-full bg-black"
                                preload="metadata"
                                playsInline
                                onContextMenu={(event) => event.preventDefault()}
                            />
                        </div>
                    ) : (
                        <Alert color="yellow" title="Chưa có video">
                            Bài học này chưa được tải video lên. Vui lòng quay lại sau.
                        </Alert>
                    )}

                    {!canTrackProgress && (
                        <Alert color="blue" variant="light">
                            Đăng nhập và đăng ký khóa học để lưu tiến độ học tập.
                        </Alert>
                    )}

                    <Group justify="space-between">
                        {navigation.prev ? (
                            <Button
                                component={Link}
                                href={lessonUrl(navigation.prev.id)}
                                variant="default"
                                leftSection={<ChevronLeft className="size-4" />}
                            >
                                {navigation.prev.title}
                            </Button>
                        ) : (
                            <span />
                        )}

                        {navigation.next ? (
                            <Button
                                component={Link}
                                href={lessonUrl(navigation.next.id)}
                                color="pink"
                                rightSection={<ChevronRight className="size-4" />}
                            >
                                {navigation.next.title}
                            </Button>
                        ) : (
                            <Button component={Link} href="/account/courses" color="pink">
                                Về khóa học của tôi
                            </Button>
                        )}
                    </Group>
                </Stack>
            </LearnLayout>
        </>
    );
}
