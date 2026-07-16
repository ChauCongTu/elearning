import { Link } from '@inertiajs/react';
import {
    Alert,
    Grid,
    Paper,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';
import { Info } from 'lucide-react';
import type { PricingContent } from '@/types';

type Props = {
    pricing: PricingContent;
};

export default function PricingTables({ pricing }: Props) {
    return (
        <Stack gap="xl">
            <Text c="dimmed" maw={720} style={{ lineHeight: 1.7 }}>
                {pricing.intro}
            </Text>

            <Grid>
                {pricing.groups.map((group) => (
                    <Grid.Col key={group.title} span={{ base: 12, md: 6 }}>
                        <Paper withBorder radius="lg" p="lg" h="100%">
                            <Title order={4} mb="md">
                                {group.title}
                            </Title>
                            <Table striped highlightOnHover withTableBorder>
                                <Table.Tbody>
                                    {group.items.map((item) => (
                                        <Table.Tr key={item.name}>
                                            <Table.Td>
                                                <Text size="sm">{item.name}</Text>
                                            </Table.Td>
                                            <Table.Td ta="right">
                                                <Text size="sm" fw={600} c="pink.7">
                                                    {item.price} đ
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Paper>
                    </Grid.Col>
                ))}
            </Grid>

            <Alert
                icon={<Info size={18} />}
                color="pink"
                variant="light"
                title="Lưu ý"
            >
                {pricing.note}{' '}
                <Link href="/lien-he">Liên hệ tư vấn</Link> hoặc{' '}
                <Link href="/courses">xem giá khóa học online</Link>.
            </Alert>
        </Stack>
    );
}
