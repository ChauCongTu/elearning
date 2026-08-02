import { Form, Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Anchor,
    Button,
    Checkbox,
    Group,
    Modal,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AuthShell from '@/components/public/auth-shell';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { register } from '@/routes';

type SessionTakeover = {
    email: string;
    device: string;
};

type Props = {
    status?: string;
    canResetPassword: boolean;
    sessionTakeover?: SessionTakeover | null;
};

export default function Login({
    status,
    canResetPassword,
    sessionTakeover,
}: Props) {
    const [takeoverModal, takeoverHandlers] = useDisclosure(false);
    const [takeover, setTakeover] = useState<SessionTakeover | null>(
        sessionTakeover ?? null,
    );
    const [defaultEmail, setDefaultEmail] = useState(sessionTakeover?.email ?? '');

    useEffect(() => {
        if (sessionTakeover) {
            setTakeover(sessionTakeover);
            setDefaultEmail(sessionTakeover.email);
            takeoverHandlers.open();
        }
    }, [sessionTakeover, takeoverHandlers]);

    const closeTakeoverModal = () => {
        takeoverHandlers.close();
        setTakeover(null);
    };

    return (
        <>
            <Head title="Đăng nhập" />
            <AuthShell
                title="Đăng nhập"
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
                                autoFocus={!takeover}
                                defaultValue={defaultEmail}
                                key={defaultEmail}
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

            <Modal
                opened={takeoverModal}
                onClose={closeTakeoverModal}
                title="Tài khoản đang được sử dụng"
                centered
            >
                <Stack gap="md">
                    <Text size="sm">
                        Tài khoản của bạn đang đăng nhập trên{' '}
                        <Text span fw={600}>
                            {takeover?.device ?? 'thiết bị khác'}
                        </Text>
                        . Nếu tiếp tục, phiên đăng nhập trên thiết bị đó sẽ
                        bị đăng xuất.
                    </Text>
                    <Text size="sm" c="dimmed">
                        Bạn có muốn tiếp tục đăng nhập trên thiết bị này không?
                    </Text>

                    <Form {...store.form()} resetOnSuccess={['password']}>
                        {({ processing, errors }) => (
                            <Stack gap="md">
                                <input
                                    type="hidden"
                                    name="confirm_session_takeover"
                                    value="1"
                                />
                                <TextInput
                                    label="Email"
                                    name="email"
                                    type="email"
                                    required
                                    readOnly
                                    defaultValue={takeover?.email ?? ''}
                                    error={errors.email}
                                />
                                <PasswordInput
                                    label="Mật khẩu"
                                    name="password"
                                    required
                                    autoFocus
                                    placeholder="••••••••"
                                    error={errors.password}
                                />
                                <Group justify="flex-end" gap="sm">
                                    <Button
                                        variant="default"
                                        onClick={closeTakeoverModal}
                                        disabled={processing}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="pink"
                                        loading={processing}
                                        data-test="confirm-session-takeover-button"
                                    >
                                        Tiếp tục đăng nhập
                                    </Button>
                                </Group>
                            </Stack>
                        )}
                    </Form>
                </Stack>
            </Modal>
        </>
    );
}
