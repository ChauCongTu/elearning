import { Head, Link } from '@inertiajs/react';
import { Badge, Button, Group, Stack, Table, Title } from '@mantine/core';
import { Award, Download, ExternalLink } from 'lucide-react';
import { EmptyState } from '@/components/account/account-ui';
import { formatDateTime } from '@/lib/format';
import type { AccountCertificate } from '@/types';

type Props = {
    certificates: AccountCertificate[];
};

export default function AccountCertificates({ certificates }: Props) {
    return (
        <>
            <Head title="Chứng chỉ của tôi" />

            <Title order={2} mb="xl">
                Chứng chỉ của tôi
            </Title>

            {certificates.length === 0 ? (
                <EmptyState
                    icon={<Award className="size-12" />}
                    title="Chưa có chứng chỉ"
                    description="Hoàn thành khóa học để nhận chứng chỉ."
                    action={
                        <Button component={Link} href="/account/courses" color="pink" radius="xl">
                            Xem khóa học của tôi
                        </Button>
                    }
                />
            ) : (
                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Khóa học</Table.Th>
                            <Table.Th>Mã tra cứu</Table.Th>
                            <Table.Th>Ngày cấp</Table.Th>
                            <Table.Th>Thao tác</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {certificates.map((certificate) => (
                            <Table.Tr key={certificate.id}>
                                <Table.Td>{certificate.course_title ?? '—'}</Table.Td>
                                <Table.Td>
                                    {certificate.student_code ? (
                                        <Badge variant="light">{certificate.student_code}</Badge>
                                    ) : (
                                        '—'
                                    )}
                                </Table.Td>
                                <Table.Td>{formatDateTime(certificate.issued_at)}</Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Button
                                            size="xs"
                                            variant="light"
                                            component="a"
                                            href={`/account/certificates/${certificate.id}/download`}
                                            leftSection={<Download size={14} />}
                                        >
                                            Tải PDF
                                        </Button>
                                        {certificate.lookup_url && (
                                            <Button
                                                size="xs"
                                                variant="default"
                                                component="a"
                                                href={certificate.lookup_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                leftSection={<ExternalLink size={14} />}
                                            >
                                                Tra cứu
                                            </Button>
                                        )}
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}
        </>
    );
}
