import { Box, Container, SimpleGrid, Stack, Text } from '@mantine/core';
import SectionHeading from '@/components/public/section-heading';
import type { VideoItem } from '@/types';

type Props = {
    videos: VideoItem[];
};

export default function VideoGallery({ videos }: Props) {
    return (
        <Container size="xl" py={72}>
            <SectionHeading title="Video nổi bật" />
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                {videos.map((video) => (
                    <Stack key={video.title} gap="sm">
                        <Box
                            className="public-soft-card"
                            style={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                overflow: 'hidden',
                                padding: 0,
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
                        <Text fw={600} size="sm" lh={1.5}>
                            {video.title}
                        </Text>
                    </Stack>
                ))}
            </SimpleGrid>
        </Container>
    );
}
