import { Form, Head } from '@inertiajs/react';
import { Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import AuthShell from '@/components/public/auth-shell';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Đặt lại mật khẩu" />
            <AuthShell
                title="Đặt lại mật khẩu"
                description="Nhập mật khẩu mới cho tài khoản của bạn."
            >
                <Form
                    {...update.form()}
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={['password', 'password_confirmation']}
                >
                    {({ processing, errors }) => (
                        <Stack gap="md">
                            <TextInput
                                label="Email"
                                name="email"
                                type="email"
                                value={email}
                                readOnly
                                error={errors.email}
                            />
                            <PasswordInput
                                label="Mật khẩu mới"
                                name="password"
                                required
                                autoFocus
                                description={passwordRules}
                                error={errors.password}
                            />
                            <PasswordInput
                                label="Xác nhận mật khẩu"
                                name="password_confirmation"
                                required
                                error={errors.password_confirmation}
                            />
                            <Button
                                type="submit"
                                color="pink"
                                fullWidth
                                loading={processing}
                                data-test="reset-password-button"
                            >
                                Đặt lại mật khẩu
                            </Button>
                        </Stack>
                    )}
                </Form>
            </AuthShell>
        </>
    );
}
