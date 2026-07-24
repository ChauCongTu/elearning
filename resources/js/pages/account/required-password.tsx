import { Head, router } from '@inertiajs/react';
import { Alert, Button, PasswordInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import AuthShell from '@/components/public/auth-shell';

type Props = {
    passwordRules?: string;
};

export default function RequiredPassword({ passwordRules }: Props) {
    const form = useForm({
        initialValues: {
            password: '',
            password_confirmation: '',
        },
        validate: {
            password: (value) => (value.length >= 8 ? null : 'Mật khẩu tối thiểu 8 ký tự'),
            password_confirmation: (value, values) =>
                value === values.password ? null : 'Xác nhận mật khẩu không khớp',
        },
    });

    return (
        <>
            <Head title="Đổi mật khẩu bắt buộc" />
            <AuthShell title="Đổi mật khẩu">
                <Alert color="orange" variant="light" mb="md">
                    Quản trị viên yêu cầu bạn đổi mật khẩu trước khi sử dụng tài khoản.
                </Alert>

                <form
                    onSubmit={form.onSubmit((values) => {
                        router.put('/account/password/required', values);
                    })}
                >
                    <Stack gap="sm">
                        <PasswordInput
                            label="Mật khẩu mới"
                            required
                            autoComplete="new-password"
                            {...form.getInputProps('password')}
                        />
                        <PasswordInput
                            label="Xác nhận mật khẩu mới"
                            required
                            autoComplete="new-password"
                            {...form.getInputProps('password_confirmation')}
                        />
                        {passwordRules && (
                            <Text size="xs" c="dimmed">
                                Yêu cầu: {passwordRules}
                            </Text>
                        )}
                        <Button type="submit" fullWidth mt="xs">
                            Lưu mật khẩu mới
                        </Button>
                    </Stack>
                </form>
            </AuthShell>
        </>
    );
}
