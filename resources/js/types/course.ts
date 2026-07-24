export type Category = {
    id: string;
    name: string;
    slug: string;
};

export type CourseMeta = {
    badge?: string;
};

export type Course = {
    id: string;
    category_id: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    description?: string | null;
    price: string;
    compare_price: string | null;
    thumbnail_path: string | null;
    thumbnail_url?: string | null;
    is_featured: boolean;
    duration_label: string | null;
    lesson_count_label: string | null;
    instructor_name: string | null;
    instructor_title?: string | null;
    benefits?: string[] | null;
    faq?: { q: string; a: string }[] | null;
    meta?: CourseMeta | null;
    purchase_count?: number;
    category: Category | null;
};

export type LessonSummary = {
    id: string;
    chapter_id: string;
    title: string;
    sort_order: number;
    duration_seconds: number;
    is_free_preview: boolean;
};

export type ChapterWithLessons = Chapter & {
    lessons: LessonSummary[];
};

export type CourseDetail = Course & {
    description: string | null;
    instructor_title: string | null;
    benefits: string[] | null;
    faq: { q: string; a: string }[] | null;
    chapters: ChapterWithLessons[];
};

export type Banner = {
    id: string;
    title: string | null;
    image_path: string;
    image_url?: string | null;
    link_url: string | null;
};

export type CourseFilters = {
    q: string;
    category: string;
    sort: string;
};

export type Chapter = {
    id: string;
    course_id: string;
    title: string;
    sort_order: number;
    is_published: boolean;
};

export type Lesson = {
    id: string;
    chapter_id: string;
    title: string;
    sort_order: number;
    duration_seconds: number;
    is_free_preview: boolean;
    is_published: boolean;
};

export type Enrollment = {
    id: string;
    user_id: string;
    course_id: string;
    status: 'active' | 'revoked';
    progress_percent: string;
    enrolled_at: string;
    completed_at: string | null;
    source: 'purchase' | 'migration' | 'manual';
    course?: Course;
};
