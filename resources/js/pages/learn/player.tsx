import { Head, Link, router } from '@inertiajs/react';
import {
    Alert,
    Badge,
    Button,
    Group,
    NavLink,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ChevronLeft, ChevronRight, CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import LearnResumePromptModal, {
    shouldOfferLearnResume,
} from '@/components/learn/learn-resume-prompt-modal';
import LearnVideoPlayer from '@/components/learn/learn-video-player';
import VideoWatermarkOverlay from '@/components/learn/video-watermark-overlay';
import { useGuardedVideo } from '@/hooks/use-guarded-video';
import { useLearnPageGuard } from '@/hooks/use-learn-page-guard';
import { useSiteConfig } from '@/hooks/use-site-config';
import { useVideoCaptureGuard } from '@/hooks/use-video-capture-guard';
import { useVideoShellFullscreen } from '@/hooks/use-video-shell-fullscreen';
import { useVideoWatermark } from '@/hooks/use-video-watermark';
import LearnLayout from '@/layouts/learn-layout';
import { patchLearnProgress, postMarkLessonComplete } from '@/lib/learn-progress';
import { formatDuration } from '@/lib/format';
import type { LearnPlayerProps } from '@/types';

const HEARTBEAT_INTERVAL_MS = 20_000;

export default function LearnPlayer({
    course,
    currentLesson,
    videoStreamUrl,
    chapters,
    navigation,
    canTrackProgress,
    unlock_ratio: unlockRatio,
    watermark,
    capture_guard: captureGuard,
}: LearnPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const shellRef = useRef<HTMLDivElement>(null);
    const lastSentRef = useRef(0);
    const unlockReloadedRef = useRef(false);
    const [markingDone, setMarkingDone] = useState(false);
    const [watchedSeconds, setWatchedSeconds] = useState(currentLesson.watched_seconds);
    const [progressPercent, setProgressPercent] = useState(
        Number.parseFloat(course.progress_percent),
    );
    const [lessonCompleted, setLessonCompleted] = useState(currentLesson.completed);
    const [resumePromptOpen, setResumePromptOpen] = useState(false);
    const [videoStartAt, setVideoStartAt] = useState(0);
    const { name: appName } = useSiteConfig();

    const unlockThreshold =
        currentLesson.duration_seconds > 0
            ? Math.max(1, Math.floor(currentLesson.duration_seconds * unlockRatio))
            : null;

    const canMarkAsDone =
        canTrackProgress &&
        !lessonCompleted &&
        unlockThreshold !== null &&
        watchedSeconds >= unlockThreshold;

    const lessonUrl = (lessonId: string) =>
        `/learn/${course.slug}/lessons/${lessonId}`;

    const { isFullscreen, toggleFullscreen } = useVideoShellFullscreen(
        videoRef,
        shellRef,
        Boolean(videoStreamUrl),
    );

    useGuardedVideo({
        videoRef,
        resumeAt: currentLesson.watched_seconds,
        lessonKey: currentLesson.id,
        enabled: Boolean(videoStreamUrl),
    });

    useLearnPageGuard(true);

    useVideoCaptureGuard({
        videoRef,
        config: captureGuard,
        lessonKey: currentLesson.id,
        active: Boolean(videoStreamUrl),
    });

    const videoWatermark = useVideoWatermark({
        watermark,
        lessonKey: currentLesson.id,
        active: Boolean(videoStreamUrl),
    });

    const reloadAfterUnlock = useCallback(
        (hadNextLesson: boolean) => {
            if (unlockReloadedRef.current) {
                return;
            }

            unlockReloadedRef.current = true;

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
        },
        [],
    );

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
                setWatchedSeconds(result.watched_seconds);
                setLessonCompleted(result.completed);
                setProgressPercent(Number.parseFloat(result.progress_percent));

                const threshold =
                    currentLesson.duration_seconds > 0
                        ? Math.max(
                              1,
                              Math.floor(currentLesson.duration_seconds * unlockRatio),
                          )
                        : null;

                if (
                    !unlockReloadedRef.current &&
                    threshold !== null &&
                    (result.completed || result.watched_seconds >= threshold)
                ) {
                    reloadAfterUnlock(navigation.next !== null);
                }
            } catch {
                // Ignore transient network errors during heartbeat.
            }
        },
        [
            canTrackProgress,
            currentLesson.duration_seconds,
            currentLesson.id,
            navigation.next,
            reloadAfterUnlock,
            unlockRatio,
        ],
    );

    const handleMarkAsDone = useCallback(async () => {
        if (!canTrackProgress || lessonCompleted || markingDone) {
            return;
        }

        setMarkingDone(true);

        try {
            const result = await postMarkLessonComplete(currentLesson.id);
            lastSentRef.current = result.watched_seconds;
            setWatchedSeconds(result.watched_seconds);
            setLessonCompleted(true);
            setProgressPercent(Number.parseFloat(result.progress_percent));

            notifications.show({
                title: 'Đã đánh dấu hoàn thành',
                message: 'Bài học này được ghi nhận là đã học. Bạn có thể chuyển sang bài tiếp theo.',
                color: 'green',
                autoClose: 5000,
            });

            reloadAfterUnlock(navigation.next !== null);
        } catch {
            notifications.show({
                title: 'Không thể lưu',
                message: 'Vui lòng thử lại sau.',
                color: 'red',
            });
        } finally {
            setMarkingDone(false);
        }
    }, [
        canTrackProgress,
        currentLesson.id,
        lessonCompleted,
        markingDone,
        navigation.next,
        reloadAfterUnlock,
    ]);

    useEffect(() => {
        lastSentRef.current = currentLesson.watched_seconds;
        unlockReloadedRef.current = false;
        setWatchedSeconds(currentLesson.watched_seconds);
        setLessonCompleted(currentLesson.completed);
        setProgressPercent(Number.parseFloat(course.progress_percent));

        const offerResume = shouldOfferLearnResume(
            currentLesson.watched_seconds,
            currentLesson.duration_seconds,
            currentLesson.completed,
            canTrackProgress,
        );

        if (offerResume) {
            setResumePromptOpen(true);
            setVideoStartAt(0);
        } else {
            setResumePromptOpen(false);
            setVideoStartAt(
                currentLesson.watched_seconds > 0 && !currentLesson.completed
                    ? currentLesson.watched_seconds
                    : 0,
            );
        }
    }, [
        canTrackProgress,
        course.progress_percent,
        currentLesson.completed,
        currentLesson.duration_seconds,
        currentLesson.id,
        currentLesson.watched_seconds,
    ]);

    const handleContinueFromSaved = useCallback(() => {
        setVideoStartAt(currentLesson.watched_seconds);
        setResumePromptOpen(false);
    }, [currentLesson.watched_seconds]);

    const handleStartFromBeginning = useCallback(() => {
        setVideoStartAt(0);
        setResumePromptOpen(false);
    }, []);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !videoStreamUrl) {
            return;
        }

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
            router.reload({ preserveScroll: true });
        };

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
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('error', handleError);
            window.clearInterval(interval);
        };
    }, [currentLesson.id, currentLesson.watched_seconds, sendProgress, videoStreamUrl]);

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
                                            description={`Xem ít nhất ${Math.round(unlockRatio * 100)}% bài trước để mở khóa`}
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

                    {videoStreamUrl ? (
                        <LearnVideoPlayer
                            videoRef={videoRef}
                            shellRef={shellRef}
                            src={videoStreamUrl}
                            lessonKey={currentLesson.id}
                            lessonTitle={currentLesson.title}
                            appName={appName}
                            startAt={videoStartAt}
                            maxSeekSeconds={watchedSeconds}
                            playbackBlocked={resumePromptOpen}
                            isFullscreen={isFullscreen}
                            onToggleFullscreen={() => void toggleFullscreen()}
                            hasPreviousLesson={navigation.prev !== null}
                            hasNextLesson={navigation.next !== null}
                            onPreviousLesson={
                                navigation.prev
                                    ? () => router.visit(lessonUrl(navigation.prev!.id))
                                    : undefined
                            }
                            onNextLesson={
                                navigation.next
                                    ? () => router.visit(lessonUrl(navigation.next!.id))
                                    : undefined
                            }
                            watermark={
                                videoWatermark.label ? (
                                    <VideoWatermarkOverlay
                                        label={videoWatermark.label}
                                        visible={videoWatermark.visible}
                                        corner={videoWatermark.corner}
                                    />
                                ) : undefined
                            }
                        />
                    ) : (
                        <Alert color="yellow" title="Chưa có video">
                            Bài học này chưa được tải video lên. Vui lòng quay lại sau.
                        </Alert>
                    )}

                    <LearnResumePromptModal
                        opened={resumePromptOpen && Boolean(videoStreamUrl)}
                        watchedSeconds={currentLesson.watched_seconds}
                        lessonTitle={currentLesson.title}
                        onContinue={handleContinueFromSaved}
                        onStartOver={handleStartFromBeginning}
                    />

                    {!canTrackProgress && (
                        <Alert color="blue" variant="light">
                            Đăng nhập và đăng ký khóa học để lưu tiến độ học tập.
                        </Alert>
                    )}

                    {canMarkAsDone && (
                        <Group justify="flex-end">
                            <Button
                                variant="light"
                                color="green"
                                leftSection={<CheckCircle2 className="size-4" />}
                                loading={markingDone}
                                onClick={() => void handleMarkAsDone()}
                            >
                                Đánh dấu đã học
                            </Button>
                        </Group>
                    )}

                    {canTrackProgress && !lessonCompleted && unlockThreshold !== null && watchedSeconds < unlockThreshold && (
                        <Text size="sm" c="dimmed" ta="right">
                            Xem thêm để đánh dấu hoàn thành: {Math.round(unlockRatio * 100)}% (
                            {formatDuration(unlockThreshold)}).
                        </Text>
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
