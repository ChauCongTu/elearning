import { Form, Head, Link } from '@inertiajs/react';
import { Anchor, Button, Stack, Text, TextInput } from '@mantine/core';
import AuthShell from '@/components/public/auth-shell';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Quên mật khẩu" />
            <AuthShell
                title="Quên mật khẩu"
                footer={
                    <Text size="sm" ta="center" c="dimmed">
                        <Anchor component={Link} href={login()}>
                            Quay lại đăng nhập
                        </Anchor>
                    </Text>
                }
            >
                {status && (
                    <Text size="sm" c="teal" ta="center">
                        {status}
                    </Text>
                )}

                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <Stack gap="md">
                            <TextInput
                                label="Email"
                                name="email"
                                type="email"
                                required
                                autoFocus
                                placeholder="email@example.com"
                                error={errors.email}
                            />
                            <Button
                                type="submit"
                                color="pink"
                                fullWidth
                                loading={processing}
                                data-test="email-password-reset-link-button"
                            >
                                Gửi liên kết đặt lại
                            </Button>
                        </Stack>
                    )}
                </Form>
            </AuthShell>
        </>
    );
}
