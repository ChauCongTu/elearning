import { Form, Head, router } from '@inertiajs/react';
import { Button, Stack, Text } from '@mantine/core';
import AuthShell from '@/components/public/auth-shell';

type Props = {
    status?: string;
};

export default function VerifyEmail({ status }: Props) {
    return (
        <>
            <Head title="Xác minh email" />
            <AuthShell title="Xác minh email">
                {status === 'verification-link-sent' && (
                    <Text size="sm" c="teal" ta="center">
                        Liên kết xác minh mới đã được gửi đến email của bạn.
                    </Text>
                )}

                <Stack gap="md">
                    <Button
                        color="pink"
                        fullWidth
                        onClick={() => router.post('/email/verification-notification')}
                    >
                        Gửi lại email xác minh
                    </Button>

                    <Form action="/logout" method="post">
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="subtle"
                                color="gray"
                                fullWidth
                                loading={processing}
                            >
                                Đăng xuất
                            </Button>
                        )}
                    </Form>
                </Stack>
            </AuthShell>
        </>
    );
}
