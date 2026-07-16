import { Box, Container, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Award, ShieldCheck, Sparkles, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import SectionHeading from '@/components/public/section-heading';
import type { WhyChooseItem } from '@/types';

type Props = {
    items: WhyChooseItem[];
};

const icons = [Sparkles, Users, ShieldCheck, Award];

export default function WhyChooseUs({ items }: Props) {
    return (
        <Box py={72} style={{ background: '#fff' }}>
            <Container size="xl">
                <SectionHeading
                    eyebrow="Lý do chọn chúng tôi"
                    title="Vì sao chọn Bông Nhài Trắng"
                    description="Không chỉ dạy nghề — chúng tôi dẫn dắt bạn xây dựng sự nghiệp bền vững trong ngành thẩm mỹ."
                    align="center"
                />
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                    {items.map((item, index) => {
                        const Icon = icons[index % icons.length];

                        return (
                            <Paper
                                key={item.number}
                                p="xl"
                                radius="xl"
                                className="public-glass public-card-hover"
                            >
                                <Stack gap="md">
                                    <GroupRow
                                        icon={<Icon size={22} />}
                                        number={item.number}
                                    />
                                    <Title order={4} lh={1.3}>
                                        {item.title}
                                    </Title>
                                    <Text size="sm" c="dimmed" lh={1.7}>
                                        {item.description}
                                    </Text>
                                </Stack>
                            </Paper>
                        );
                    })}
                </SimpleGrid>
            </Container>
        </Box>
    );
}

function GroupRow({ icon, number }: { icon: React.ReactNode; number: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="public-feature-icon">{icon}</div>
            <Text size="xl" fw={800} c="pink.2">
                {number}
            </Text>
        </div>
    );
}
