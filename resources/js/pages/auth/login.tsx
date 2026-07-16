import { Form, Head, Link } from '@inertiajs/react';
import {
    Anchor,
    Button,
    Checkbox,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import AuthShell from '@/components/public/auth-shell';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { register } from '@/routes';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Đăng nhập" />
            <AuthShell
                title="Đăng nhập"
                description="Nhập email và mật khẩu để tiếp tục học."
                footer={
                    <Text size="sm" ta="center" c="dimmed">
                        Chưa có tài khoản?{' '}
                        <Anchor component={Link} href={register()} fw={500}>
                            Đăng ký ngay
                        </Anchor>
                    </Text>
                }
            >
                {status && (
                    <Text size="sm" c="teal" ta="center">
                        {status}
                    </Text>
                )}

                <Form {...store.form()} resetOnSuccess={['password']}>
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
                            <PasswordInput
                                label="Mật khẩu"
                                name="password"
                                required
                                placeholder="••••••••"
                                error={errors.password}
                            />
                            {canResetPassword && (
                                <Anchor
                                    component={Link}
                                    href={request()}
                                    size="sm"
                                    ta="right"
                                >
                                    Quên mật khẩu?
                                </Anchor>
                            )}
                            <Checkbox label="Ghi nhớ đăng nhập" name="remember" />
                            <Button
                                type="submit"
                                color="pink"
                                fullWidth
                                loading={processing}
                                data-test="login-button"
                            >
                                Đăng nhập
                            </Button>
                        </Stack>
                    )}
                </Form>
            </AuthShell>
        </>
    );
}
