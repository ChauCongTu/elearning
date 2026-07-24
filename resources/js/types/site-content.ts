export type SiteStat = {
    value: string;
    label: string;
};

export type WhyChooseItem = {
    number: string;
    title: string;
    description: string;
};

export type FounderContent = {
    name: string;
    title: string;
    subtitle: string;
    bio: string;
    achievements: string[];
};

export type CategoryShowcaseItem = {
    title: string;
    description: string;
    slug: string;
};

export type ServiceItem = {
    title: string;
    description: string;
};

export type VideoItem = {
    title: string;
    youtube_id: string;
};

export type ArticleItem = {
    title: string;
    excerpt: string;
    url: string;
    slug?: string;
    featured_image?: string | null;
    featured_image_url?: string | null;
    published_at?: string | null;
};

export type ArticleSection = {
    key: string;
    title: string;
    view_all_url: string;
    articles: ArticleItem[];
};

export type HeroSlide = {
    title: string;
    subtitle: string;
    cta_label: string;
    cta_url: string;
};

export type AboutContent = {
    eyebrow: string;
    headline: string;
    story_title: string;
    story: string;
    mission: string;
};

export type ConsultationConfig = {
    course_options: string[];
    branches: string[];
};

export type NavLink = {
    href: string;
    label: string;
};

export type HotlineItem = {
    label: string;
    number: string;
    href: string;
};

export type BranchItem = {
    name: string;
    address: string;
};

export type ContactContent = {
    intro: string;
    hotlines: HotlineItem[];
    zalo: string;
    facebook_url: string;
    hours: string;
    branches: BranchItem[];
};

export type PricingItem = {
    name: string;
    price: string;
};

export type PricingGroup = {
    title: string;
    items: PricingItem[];
};

export type PricingContent = {
    intro: string;
    note: string;
    groups: PricingGroup[];
};

export type InfoSection = {
    title: string;
    content: string;
};

export type InfoContent = {
    intro: string;
    sections: InfoSection[];
};

export type SiteContent = {
    about: AboutContent;
    stats: SiteStat[];
    why_choose_us: WhyChooseItem[];
    founder: FounderContent;
    category_showcase: CategoryShowcaseItem[];
    services: ServiceItem[];
    videos: VideoItem[];
    article_sections: ArticleSection[];
    consultation: ConsultationConfig;
    hero_slides: HeroSlide[];
    hero_trust_stats: SiteStat[];
    navigation: NavLink[];
    contact: ContactContent;
    pricing: PricingContent;
    info: InfoContent;
};
