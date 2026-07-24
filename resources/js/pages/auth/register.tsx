import { Form, Head, Link } from '@inertiajs/react';
import {
    Anchor,
    Button,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import AuthShell from '@/components/public/auth-shell';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Đăng ký" />
            <AuthShell
                title="Tạo tài khoản"
                footer={
                    <Text size="sm" ta="center" c="dimmed">
                        Đã có tài khoản?{' '}
                        <Anchor component={Link} href={login()} fw={500}>
                            Đăng nhập
                        </Anchor>
                    </Text>
                }
            >
                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                >
                    {({ processing, errors }) => (
                        <Stack gap="md">
                            <TextInput
                                label="Họ và tên"
                                name="name"
                                required
                                autoFocus
                                placeholder="Nguyễn Văn A"
                                error={errors.name}
                            />
                            <TextInput
                                label="Email"
                                name="email"
                                type="email"
                                required
                                placeholder="email@example.com"
                                error={errors.email}
                            />
                            <TextInput
                                label="Số điện thoại"
                                name="phone"
                                type="tel"
                                placeholder="0912345678"
                                error={errors.phone}
                            />
                            <PasswordInput
                                label="Mật khẩu"
                                name="password"
                                required
                                placeholder="••••••••"
                                description={passwordRules}
                                error={errors.password}
                            />
                            <PasswordInput
                                label="Xác nhận mật khẩu"
                                name="password_confirmation"
                                required
                                placeholder="••••••••"
                                error={errors.password_confirmation}
                            />
                            <Button
                                type="submit"
                                color="pink"
                                fullWidth
                                loading={processing}
                                data-test="register-user-button"
                            >
                                Đăng ký
                            </Button>
                        </Stack>
                    )}
                </Form>
            </AuthShell>
        </>
    );
}
