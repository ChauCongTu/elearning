import { Box, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import SectionHeading from '@/components/public/section-heading';
import type { VideoItem } from '@/types';

type Props = {
    videos: VideoItem[];
};

export default function VideoGallery({ videos }: Props) {
    return (
        <Container size="xl" py={64}>
            <SectionHeading
                title="Video nổi bật"
                description="Cùng khám phá hành trình học nghề và dịch vụ tại học viện."
                align="center"
            />
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                {videos.map((video) => (
                    <Stack key={video.title} gap="sm">
                        <Box
                            style={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                borderRadius: 'var(--mantine-radius-lg)',
                                overflow: 'hidden',
                                background: '#111',
                            }}
                        >
                            <iframe
                                title={video.title}
                                src={`https://www.youtube.com/embed/${video.youtube_id}`}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 0,
                                }}
                                allowFullScreen
                            />
                        </Box>
                        <Text fw={500} size="sm">
                            {video.title}
                        </Text>
                    </Stack>
                ))}
            </SimpleGrid>
        </Container>
    );
}
