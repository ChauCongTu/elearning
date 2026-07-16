import { Link } from '@inertiajs/react';
import { Carousel } from '@mantine/carousel';
import {
    Box,
    Button,
    Container,
    Grid,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { ArrowRight, Headphones, Sparkles } from 'lucide-react';
import { brandGradients } from '@/theme/brand';
import { useSiteConfig } from '@/hooks/use-site-config';
import type { Banner, HeroSlide, SiteStat } from '@/types';

import '@mantine/carousel/styles.css';

type Props = {
    banners: Banner[];
    slides: HeroSlide[];
    trustStats: SiteStat[];
};

export default function HeroBanner({ banners, slides, trustStats }: Props) {
    const site = useSiteConfig();
    const items =
        banners.length > 0
            ? banners.map((banner) => ({
                  title: banner.title ?? 'Khóa học đang tuyển sinh',
                  subtitle:
                      'Học online linh hoạt — thanh toán VietQR — mở khóa ngay sau chuyển khoản.',
                  cta_label: 'Xem chi tiết',
                  cta_url: banner.link_url ?? '/courses',
              }))
            : slides;

    return (
        <Box className="public-mesh" style={{ background: brandGradients.soft }}>
            <Container size="xl" py={{ base: 48, md: 72 }}>
                <Carousel
                    withIndicators
                    height="auto"
                    emblaOptions={{ loop: true, align: 'start' }}
                    styles={{
                        indicator: {
                            width: 10,
                            height: 10,
                            transition: 'width 250ms ease',
                            '&[data-active]': {
                                width: 28,
                                background: brandGradients.primary,
                            },
                        },
                    }}
                >
                    {items.map((slide, index) => (
                        <Carousel.Slide key={`${slide.title}-${index}`}>
                            <Grid align="center" gap="xl">
                                <Grid.Col span={{ base: 12, md: 7 }}>
                                    <Stack gap="lg" className="public-fade-up">
                                        <span className="public-eyebrow">
                                            <Sparkles size={14} />
                                            {site.shortName} Academy
                                        </span>
                                        <Title
                                            order={1}
                                            style={{
                                                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                                                lineHeight: 1.1,
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            <span className="public-gradient-text">
                                                {slide.title}
                                            </span>
                                        </Title>
                                        <Text size="lg" c="dimmed" maw={560} lh={1.7}>
                                            {slide.subtitle}
                                        </Text>
                                        <Group gap="md">
                                            <Button
                                                component={Link}
                                                href={slide.cta_url}
                                                size="md"
                                                radius="xl"
                                                rightSection={<ArrowRight size={18} />}
                                                style={{
                                                    background: brandGradients.primary,
                                                    border: 'none',
                                                }}
                                            >
                                                {slide.cta_label}
                                            </Button>
                                            <Button
                                                component="a"
                                                href={site.zaloUrl}
                                                target="_blank"
                                                variant="light"
                                                color="pink"
                                                radius="xl"
                                                leftSection={<Headphones size={18} />}
                                            >
                                                Tư vấn miễn phí
                                            </Button>
                                        </Group>
                                        <SimpleGrid cols={3} spacing="sm" maw={420}>
                                            {trustStats.map((stat) => (
                                                <Box
                                                    key={stat.label}
                                                    className="public-stat-pill"
                                                >
                                                    <Text fw={800} size="sm" c="pink.7">
                                                        {stat.value}
                                                    </Text>
                                                    <Text size="xs" c="dimmed" ta="center">
                                                        {stat.label}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    </Stack>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 5 }}>
                                    <Paper
                                        radius="xl"
                                        p="xl"
                                        className="public-glass public-card-hover"
                                        style={{
                                            minHeight: 280,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Stack gap="md" align="center">
                                            <Box
                                                style={{
                                                    width: 88,
                                                    height: 88,
                                                    borderRadius: '50%',
                                                    background: brandGradients.primary,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: 'var(--brand-shadow)',
                                                }}
                                            >
                                                <Sparkles size={40} color="#fff" />
                                            </Box>
                                            <Title order={3}>Học online — Mở khóa ngay</Title>
                                            <Text c="dimmed" size="sm" maw={280}>
                                                Thanh toán VietQR, tiến độ tự động lưu, chứng chỉ
                                                điện tử khi hoàn thành.
                                            </Text>
                                            <Button
                                                component={Link}
                                                href="/courses"
                                                variant="light"
                                                color="pink"
                                                radius="xl"
                                            >
                                                Khám phá khóa học
                                            </Button>
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                            </Grid>
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </Box>
    );
}
