export type CourseReviewSummary = {
    average: number | null;
    count: number;
};

export type CourseReviewItem = {
    id: string;
    user_id: string | null;
    reviewer_name?: string | null;
    course_id: string;
    rating: number;
    body: string | null;
    created_at: string;
    is_admin_created?: boolean;
    user?: {
        id: string;
        name: string;
    };
    course?: {
        id: string;
        title: string;
        slug: string;
    };
    is_published?: boolean;
};
