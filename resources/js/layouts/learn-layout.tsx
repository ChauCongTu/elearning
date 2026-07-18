import { AppShell, Box, Burger, Group, Progress, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { PropsWithChildren } from 'react';

type LearnLayoutProps = PropsWithChildren<{
    courseTitle: string;
    progressPercent: number;
    sidebar: React.ReactNode;
}>;

export default function LearnLayout({
    children,
    courseTitle,
    progressPercent,
    sidebar,
}: LearnLayoutProps) {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 56 }}
            navbar={{
                width: 320,
                breakpoint: 'md',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
                        <Link
                            href="/account/courses"
                            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-pink-600"
                        >
                            <ArrowLeft className="size-4" />
                            <span className="hidden sm:inline">Khóa học của tôi</span>
                        </Link>
                        <Text fw={600} lineClamp={1} className="max-w-[12rem] sm:max-w-md">
                            {courseTitle}
                        </Text>
                    </Group>
                    <Group gap="xs" wrap="nowrap" className="min-w-[8rem]">
                        <Text size="sm" c="dimmed" visibleFrom="sm">
                            Tiến độ
                        </Text>
                        <Text size="sm" fw={600} c="pink">
                            {progressPercent}%
                        </Text>
                        <Progress
                            value={Math.min(progressPercent, 100)}
                            color="pink"
                            size="sm"
                            className="w-24"
                        />
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">{sidebar}</AppShell.Navbar>

            <AppShell.Main>
                <Box maw={960} mx="auto">
                    {children}
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}
