export type PostCategory = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
};

export type PostSummary = {
    id: number;
    post_category_id: number | null;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    author_name: string | null;
    is_featured: boolean;
    published_at: string | null;
    category?: PostCategory | null;
};

export type PostDetail = PostSummary & {
    content: string;
};

export type PostFilters = {
    q: string;
    category: string;
};

export type PaginatedPosts = {
    data: PostSummary[];
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
