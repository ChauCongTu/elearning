import { Form, usePage } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Container,
    Grid,
    Group,
    NativeSelect,
    Paper,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { CheckCircle2, Phone } from 'lucide-react';
import { useSiteConfig } from '@/hooks/use-site-config';
import type { ConsultationConfig } from '@/types';

type Props = {
    config: ConsultationConfig;
};

type PageProps = {
    flash?: { consultation_success?: boolean };
};

export default function ConsultationSection({ config }: Props) {
    const { flash } = usePage<PageProps>().props;
    const site = useSiteConfig();

    return (
        <Box id="tu-van" py={64}>
            <Container size="xl">
                <Grid gap="xl">
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Stack gap="md">
                            <Text size="sm" fw={700} c="brand.7" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
                                Miễn phí 100%
                            </Text>
                            <Title order={2} className="public-display">Đặt lịch tư vấn trực tiếp</Title>
                            <Text c="dimmed">
                                Cùng các chuyên gia hàng đầu tại {site.shortName}.
                                Cam kết bảo mật thông tin khách hàng.
                            </Text>
                            <Paper p="lg" radius={0} withBorder className="public-surface">
                                <Group gap="sm">
                                    <Phone color="var(--color-accent)" />
                                    <div>
                                        <Text size="xs" c="dimmed">
                                            Hotline 24/7
                                        </Text>
                                        <Text fw={700} size="lg">
                                            {site.hotline}
                                        </Text>
                                    </div>
                                </Group>
                            </Paper>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Paper p="xl" radius={0} withBorder className="public-surface">
                            {flash?.consultation_success && (
                                <Alert
                                    icon={<CheckCircle2 size={16} />}
                                    color="teal"
                                    mb="md"
                                    title="Đã gửi yêu cầu tư vấn"
                                >
                                    Chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất.
                                </Alert>
                            )}

                            <Form action="/consultation" method="post">
                                {({ processing, errors }) => (
                                    <Stack gap="md">
                                        <TextInput
                                            label="Họ và tên"
                                            name="name"
                                            required
                                            placeholder="Nguyễn Văn A"
                                            error={errors.name}
                                        />
                                        <TextInput
                                            label="Số điện thoại"
                                            name="phone"
                                            required
                                            placeholder="0912345678"
                                            error={errors.phone}
                                        />
                                        <TextInput
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="email@example.com"
                                            error={errors.email}
                                        />
                                        <NativeSelect
                                            label="Khóa học / dịch vụ cần tư vấn"
                                            name="course_interest"
                                            required
                                            data={[
                                                { value: '', label: 'Chọn khóa học' },
                                                ...config.course_options.map((o) => ({
                                                    value: o,
                                                    label: o,
                                                })),
                                            ]}
                                            error={errors.course_interest}
                                        />
                                        <NativeSelect
                                            label="Chi nhánh gần nhất"
                                            name="branch"
                                            data={[
                                                { value: '', label: 'Chọn địa điểm' },
                                                ...config.branches.map((b) => ({
                                                    value: b,
                                                    label: b,
                                                })),
                                            ]}
                                            error={errors.branch}
                                        />
                                        <Textarea
                                            label="Ghi chú"
                                            name="note"
                                            placeholder="Nhu cầu học tập của bạn..."
                                            minRows={3}
                                            error={errors.note}
                                        />
                                        <Button
                                            type="submit"
                                            color="brand"
                                            size="md"
                                            loading={processing}
                                            fullWidth
                                        >
                                            Gửi yêu cầu tư vấn
                                        </Button>
                                    </Stack>
                                )}
                            </Form>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}
