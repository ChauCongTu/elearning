export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

export type AdminOverview = {
    summary: {
        orders_today: number;
        revenue_month: number;
        new_students_month: number;
        active_courses: number;
    };
    totals: {
        users: number;
        courses: number;
        enrollments: number;
        orders: number;
    };
    revenue_trend: { label: string; value: number }[];
    orders_by_status: { status: string; count: number }[];
    recent_orders: {
        id: string;
        code: string;
        status: string;
        amount: string;
        created_at: string | null;
        user_name: string | null;
    }[];
    recent_enrollments: {
        id: string;
        enrolled_at: string | null;
        user_name: string | null;
        course_title: string | null;
        source: string;
    }[];
};

export type AdminCategory = {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    sort_order: number;
    is_active: boolean;
    courses_count?: number;
};

export type AdminCourseListItem = {
    id: string;
    title: string;
    slug: string;
    price: string;
    is_published: boolean;
    is_featured: boolean;
    thumbnail_path: string | null;
    category: { id: string; name: string } | null;
    updated_at: string | null;
};

export type AdminCourseForm = {
    id: string;
    category_id: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    description: string;
    price: string;
    compare_price: string | null;
    thumbnail_path: string | null;
    instructor_name: string | null;
    instructor_title: string | null;
    duration_label: string | null;
    lesson_count_label: string | null;
    benefits: string[];
    faq: { q: string; a: string }[];
    is_featured: boolean;
    is_published: boolean;
    published_at: string | null;
};

export type AdminLesson = {
    id: string;
    title: string;
    sort_order: number;
    video_s3_key: string | null;
    duration_seconds: number;
    is_free_preview: boolean;
    is_published: boolean;
};

export type AdminChapter = {
    id: string;
    title: string;
    sort_order: number;
    is_published: boolean;
    lessons: AdminLesson[];
};

export type AdminUserListItem = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    created_at: string | null;
    last_login_at: string | null;
};

export type AdminUserDetail = AdminUserListItem & {
    enrollments: {
        id: string;
        status: string;
        source: string;
        progress_percent: string;
        enrolled_at: string | null;
        course: { id: string; title: string; slug: string } | null;
    }[];
};

export type AdminOrderListItem = {
    id: string;
    code: string;
    status: string;
    amount: string;
    paid_at: string | null;
    created_at: string | null;
    user: { id: string; name: string; email: string } | null;
    courses: string[];
};

export type AdminOrderDetail = {
    id: string;
    code: string;
    status: string;
    amount: string;
    paid_at: string | null;
    sepay_transaction_id: string | null;
    expires_at: string | null;
    created_at: string | null;
    user: { id: string; name: string; email: string; phone: string | null } | null;
    items: {
        id: string;
        price: string;
        course: { id: string; title: string; slug: string } | null;
    }[];
    payments: {
        id: string;
        gateway: string;
        amount: string;
        received_at: string | null;
    }[];
};

export type AdminBanner = {
    id: string;
    title: string;
    image_path: string;
    link_url: string | null;
    sort_order: number;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
};

export type AdminPostListItem = {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    is_featured: boolean;
    published_at: string | null;
    category: { id: string; name: string } | null;
};

export type AdminPostForm = {
    id: string;
    post_category_id: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featured_image: string | null;
    author_name: string | null;
    is_published: boolean;
    is_featured: boolean;
    published_at: string | null;
};

export type AdminPostCategory = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    posts_count?: number;
};
