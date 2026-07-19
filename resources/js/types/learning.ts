export type LearnLessonNav = {
    id: string;
    title: string;
    duration_seconds: number;
    is_free_preview: boolean;
    is_current: boolean;
    is_locked: boolean;
    completed: boolean;
    watched_seconds: number;
};

export type LearnChapter = {
    id: string;
    title: string;
    lessons: LearnLessonNav[];
};

export type LearnNavigationItem = {
    id: string;
    title: string;
};

export type LearnPlayerProps = {
    course: {
        id: string;
        title: string;
        slug: string;
        progress_percent: string;
    };
    currentLesson: {
        id: string;
        title: string;
        duration_seconds: number;
        watched_seconds: number;
        completed: boolean;
        is_free_preview: boolean;
    };
    videoStreamUrl: string | null;
    chapters: LearnChapter[];
    navigation: {
        prev: LearnNavigationItem | null;
        next: LearnNavigationItem | null;
    };
    canTrackProgress: boolean;
    unlock_ratio: number;
    watermark: LearnVideoWatermark;
    capture_guard: LearnVideoCaptureGuard;
};

export type LearnVideoCaptureGuard = {
    enabled: boolean;
    pause_on_hidden: boolean;
    block_capture_shortcuts: boolean;
};

export type LearnVideoWatermark = {
    enabled: boolean;
    label: string | null;
    min_interval_seconds: number;
    max_interval_seconds: number;
    min_visible_seconds: number;
    max_visible_seconds: number;
    initial_delay_min_seconds: number;
    initial_delay_max_seconds: number;
};

export type LearnProgressResponse = {
    watched_seconds: number;
    completed: boolean;
    progress_percent: string;
};
