import { Head } from '@inertiajs/react';
import AboutAcademy from '@/components/public/sections/about-academy';
import ArticleTeasers from '@/components/public/sections/article-teasers';
import CategoryShowcase from '@/components/public/sections/category-showcase';
import ConsultationSection from '@/components/public/sections/consultation-section';
import CourseShowcase from '@/components/public/sections/course-showcase';
import FounderSpotlight from '@/components/public/sections/founder-spotlight';
import HeroBanner from '@/components/public/sections/hero-banner';
import HotlineCta from '@/components/public/sections/hotline-cta';
import QuickSearchBar from '@/components/public/sections/quick-search-bar';
import ServiceHighlights from '@/components/public/sections/service-highlights';
import StatsStrip from '@/components/public/sections/stats-strip';
import VideoGallery from '@/components/public/sections/video-gallery';
import WhyChooseUs from '@/components/public/sections/why-choose-us';
import type { ArticleSection, Banner, Category, Course, SiteContent } from '@/types';

type Props = {
    banners: Banner[];
    enrollmentCourses: Course[];
    featuredCourses: Course[];
    latestCourses: Course[];
    categories: Category[];
    siteContent: SiteContent;
    articleSections: ArticleSection[];
};

export default function Home({
    banners,
    enrollmentCourses,
    featuredCourses,
    latestCourses,
    siteContent,
    articleSections,
}: Props) {
    return (
        <>
            <Head title="Trang chủ" />

            <HeroBanner
                banners={banners}
                slides={siteContent.hero_slides}
            />
            <QuickSearchBar />
            <StatsStrip stats={siteContent.stats} />
            <AboutAcademy content={siteContent.about} />
            <CourseShowcase courses={enrollmentCourses} />
            <WhyChooseUs items={siteContent.why_choose_us} />
            <ServiceHighlights services={siteContent.services} />
            <CategoryShowcase items={siteContent.category_showcase} />
            <FounderSpotlight founder={siteContent.founder} />
            <VideoGallery videos={siteContent.videos} />

            {featuredCourses.length > 0 && (
                <CourseShowcase
                    courses={featuredCourses}
                    title="Khóa học nổi bật"
                    description="Các chương trình được học viên quan tâm nhất."
                />
            )}

            {latestCourses.length > 0 && (
                <CourseShowcase
                    courses={latestCourses}
                    title="Khóa học mới"
                    description="Cập nhật chương trình mới nhất trên nền tảng."
                />
            )}

            <ArticleTeasers sections={articleSections} />
            <ConsultationSection config={siteContent.consultation} />
            <HotlineCta />
        </>
    );
}
