import { Link } from '@inertiajs/react';
import {
    ActionIcon,
    Anchor,
    Grid,
    Group,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { Clock, Facebook, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ContactContent } from '@/types';

type Props = {
    contact: ContactContent;
};

export default function ContactChannels({ contact }: Props) {
    return (
        <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper withBorder radius="lg" p="lg" h="100%">
                    <Stack gap="md">
                        <Title order={4}>Liên hệ trực tiếp</Title>
                        {contact.hotlines.map((line) => (
                            <Group key={line.number} gap="sm">
                                <ActionIcon
                                    component="a"
                                    href={line.href}
                                    variant="light"
                                    color="pink"
                                    size="lg"
                                    radius="xl"
                                >
                                    <Phone size={18} />
                                </ActionIcon>
                                <div>
                                    <Text size="xs" c="dimmed">
                                        {line.label}
                                    </Text>
                                    <Anchor href={line.href} fw={600} c="pink.7">
                                        {line.number}
                                    </Anchor>
                                </div>
                            </Group>
                        ))}
                        <Group gap="sm">
                            <ActionIcon
                                component="a"
                                href={`https://zalo.me/${contact.zalo}`}
                                target="_blank"
                                rel="noreferrer"
                                variant="light"
                                color="blue"
                                size="lg"
                                radius="xl"
                            >
                                <MessageCircle size={18} />
                            </ActionIcon>
                            <div>
                                <Text size="xs" c="dimmed">
                                    Zalo
                                </Text>
                                <Anchor
                                    href={`https://zalo.me/${contact.zalo}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    fw={600}
                                >
                                    Chat Zalo ngay
                                </Anchor>
                            </div>
                        </Group>
                        <Group gap="sm">
                            <ActionIcon
                                component="a"
                                href={contact.facebook_url}
                                target="_blank"
                                rel="noreferrer"
                                variant="light"
                                color="indigo"
                                size="lg"
                                radius="xl"
                            >
                                <Facebook size={18} />
                            </ActionIcon>
                            <div>
                                <Text size="xs" c="dimmed">
                                    Facebook
                                </Text>
                                <Anchor
                                    href={contact.facebook_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    fw={600}
                                >
                                    Học Viện Bông Nhài Trắng
                                </Anchor>
                            </div>
                        </Group>
                        <Group gap="sm">
                            <Clock size={18} color="var(--mantine-color-dimmed)" />
                            <Text size="sm" c="dimmed">
                                Giờ làm việc: {contact.hours}
                            </Text>
                        </Group>
                    </Stack>
                </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper withBorder radius="lg" p="lg" h="100%">
                    <Stack gap="md">
                        <Title order={4}>Hệ thống cơ sở</Title>
                        {contact.branches.map((branch) => (
                            <Group key={branch.name} align="flex-start" gap="sm">
                                <MapPin
                                    size={18}
                                    style={{ marginTop: 2, flexShrink: 0 }}
                                    color="var(--mantine-color-pink-6)"
                                />
                                <div>
                                    <Text fw={600} size="sm">
                                        {branch.name}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {branch.address}
                                    </Text>
                                </div>
                            </Group>
                        ))}
                        <Text size="sm" c="dimmed">
                            Cần tư vấn khóa học online?{' '}
                            <Link href="/courses">Xem danh sách khóa học</Link> hoặc điền
                            form bên dưới.
                        </Text>
                    </Stack>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}
