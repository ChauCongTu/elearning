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
    videoUrl: string | null;
    videoUrlExpiresAt: string | null;
    chapters: LearnChapter[];
    navigation: {
        prev: LearnNavigationItem | null;
        next: LearnNavigationItem | null;
    };
    unlock_ratio: number;
};

export type LearnProgressResponse = {
    watched_seconds: number;
    completed: boolean;
    progress_percent: string;
};
