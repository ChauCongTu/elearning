export type CourseReviewSummary = {
    average: number | null;
    count: number;
};

export type CourseReviewItem = {
    id: string;
    user_id: string;
    course_id: string;
    rating: number;
    body: string | null;
    created_at: string;
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
