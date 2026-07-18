import { Link, usePage } from '@inertiajs/react';
import { Carousel } from '@mantine/carousel';
import { Box, Container } from '@mantine/core';
import { Check } from 'lucide-react';
import BrandLogo from '@/components/public/brand-logo';
import { useSiteConfig } from '@/hooks/use-site-config';
import { mediaUrl, withBannerSourceParam } from '@/lib/format';
import type { Banner, HeroSlide } from '@/types';

import '@mantine/carousel/styles.css';

/** Khổ banner quảng cáo ngang (theo mẫu thiết kế) */
export const BANNER_ASPECT_RATIO = '16 / 7';

type Props = {
    banners: Banner[];
    slides: HeroSlide[];
};

type PromoSlide = {
    title: string;
    subtitle: string;
    offer: string;
    cta_label: string;
    cta_url: string;
    image_url: string | null;
    fullImage: boolean;
};

const promoBenefits = [
    'Cam kết việc làm khi tốt nghiệp',
    'Thu nhập từ 10–15 triệu',
    'Hỗ trợ chỗ ở cho học viên',
    'Thành thạo chuyên nghiệp trong 2 tháng',
];

function buildSlides(banners: Banner[], slides: HeroSlide[], tagline: string): PromoSlide[] {
    if (banners.length > 0) {
        return banners.map((banner) => ({
            title: banner.title ?? 'Banner tuyển sinh',
            subtitle: tagline,
            offer: 'Ưu đãi học phí — tuyển sinh liên tục',
            cta_label: 'Đăng ký ngay',
            cta_url: banner.link_url ?? '',
            image_url: mediaUrl(banner.image_path),
            fullImage: true,
        }));
    }

    return slides.map((slide) => ({
        title: slide.title,
        subtitle: slide.subtitle,
        offer: tagline,
        cta_label: slide.cta_label,
        cta_url: slide.cta_url,
        image_url: null,
        fullImage: false,
    }));
}

type SlideCardProps = {
    slide: PromoSlide;
};

function PromoBannerImage({ slide }: SlideCardProps) {
    const { appUrl } = usePage<{ appUrl: string }>().props;
    const href = slide.cta_url ? withBannerSourceParam(slide.cta_url, appUrl) : '';

    const content = (
        <img
            src={slide.image_url!}
            alt={slide.title}
            className="promo-hero__banner-img"
            loading={slide.fullImage ? 'eager' : 'lazy'}
            decoding="async"
        />
    );

    return (
        <article className="promo-hero promo-hero--banner">
            <div className="promo-hero__banner-frame">
                {href ? (
                    <a
                        href={href}
                        className="promo-hero__banner-link"
                        aria-label={slide.title}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {content}
                    </a>
                ) : (
                    content
                )}
            </div>
        </article>
    );
}

function PromoContentCard({ slide }: SlideCardProps) {
    return (
        <article className="promo-hero promo-hero--split">
            <div className="promo-hero__visual promo-hero__visual--empty" aria-hidden>
                <div className="promo-hero__visual-placeholder" />
            </div>

            <div className="promo-hero__content">
                <div className="promo-hero__logo">
                    <BrandLogo variant="large" maxWidth={120} height={72} />
                </div>

                <p className="promo-hero__eyebrow">Tuyển sinh liên tục</p>
                <h1 className="promo-hero__title">{slide.title}</h1>
                <p className="promo-hero__offer">{slide.offer}</p>
                <p className="promo-hero__subtitle">{slide.subtitle}</p>

                <ul className="promo-hero__benefits">
                    {promoBenefits.map((benefit) => (
                        <li key={benefit}>
                            <span className="promo-hero__check" aria-hidden>
                                <Check size={14} strokeWidth={3} />
                            </span>
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>

                <Link href={slide.cta_url} className="promo-hero__cta">
                    {slide.cta_label}
                </Link>
            </div>
        </article>
    );
}

function PromoSlideCard({ slide }: SlideCardProps) {
    if (slide.fullImage && slide.image_url) {
        return <PromoBannerImage slide={slide} />;
    }

    return <PromoContentCard slide={slide} />;
}

export default function HeroBanner({ banners, slides }: Props) {
    const site = useSiteConfig();
    const items = buildSlides(banners, slides, site.tagline);

    return (
        <Box component="section" className="promo-hero-section" aria-label="Banner tuyển sinh">
            <Container size="xl" py={{ base: 28, md: 40 }}>
                <Carousel
                    withIndicators={items.length > 1}
                    slideSize="100%"
                    slideGap="md"
                    emblaOptions={{ loop: items.length > 1, align: 'start' }}
                    classNames={{
                        root: 'promo-hero-carousel',
                        indicators: 'promo-hero-carousel__indicators',
                        indicator: 'promo-hero-carousel__indicator',
                    }}
                >
                    {items.map((slide, index) => (
                        <Carousel.Slide key={`${slide.title}-${index}`}>
                            <PromoSlideCard slide={slide} />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </Box>
    );
}
