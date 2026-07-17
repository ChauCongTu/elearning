export type EnrollmentCard = {
    id: string;
    progress_percent: string;
    enrolled_at: string | null;
    completed_at: string | null;
    course: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        thumbnail_path: string | null;
        duration_label: string | null;
        lesson_count_label: string | null;
    } | null;
};
