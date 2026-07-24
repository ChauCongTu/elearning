import { router } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { formatDate } from '@/lib/format';
import type { StudentLookupResult } from '@/types';

type Props = {
    query: string;
    results: StudentLookupResult[];
};

function StudentCard({ student }: { student: StudentLookupResult }) {
    return (
        <Card withBorder padding="lg" radius="md" shadow="sm">
            <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={4}>{student.name}</Title>
                        <Badge variant="light" color="yellow" mt="xs">
                            {student.student_code}
                        </Badge>
                    </div>
                    {student.is_revoked && (
                        <Badge color="red" variant="filled">
                            Đã thu hồi
                        </Badge>
                    )}
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Stack gap={4}>
                        <Text size="sm" fw={600}>
                            Thông tin cá nhân
                        </Text>
                        {student.birthday && (
                            <Text size="sm">
                                Sinh nhật: {formatDate(student.birthday)}
                                {student.age !== null ? ` (${student.age} tuổi)` : ''}
                            </Text>
                        )}
                        {student.cmnd && <Text size="sm">CMND/CCCD: {student.cmnd}</Text>}
                        {student.original_place && (
                            <Text size="sm">Quê quán: {student.original_place}</Text>
                        )}
                        {student.ethnic && <Text size="sm">Dân tộc: {student.ethnic}</Text>}
                    </Stack>

                    <Stack gap={4}>
                        <Text size="sm" fw={600}>
                            Thông tin học tập
                        </Text>
                        {student.course && <Text size="sm">Khóa học: {student.course}</Text>}
                        {student.class_name && <Text size="sm">Lớp: {student.class_name}</Text>}
                        {student.graduation_date && (
                            <Text size="sm">Ngày tốt nghiệp: {formatDate(student.graduation_date)}</Text>
                        )}
                    </Stack>
                </SimpleGrid>

                {(student.cmnd_issue_date || student.cmnd_issue_place) && (
                    <Stack gap={4}>
                        <Text size="sm" fw={600}>
                            Thông tin CMND
                        </Text>
                        {student.cmnd_issue_date && (
                            <Text size="sm">Ngày cấp: {formatDate(student.cmnd_issue_date)}</Text>
                        )}
                        {student.cmnd_issue_place && (
                            <Tooltip
                                label={student.cmnd_issue_place_label ?? student.cmnd_issue_place}
                                withArrow
                            >
                                <Text size="sm" style={{ cursor: 'help' }}>
                                    Nơi cấp: {student.cmnd_issue_place}
                                </Text>
                            </Tooltip>
                        )}
                    </Stack>
                )}
            </Stack>
        </Card>
    );
}

export default function StudentLookupSection({ query, results }: Props) {
    const [keyword, setKeyword] = useState(query);

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get('/thong-tin', { q: keyword.trim() }, { preserveState: true });
    };

    return (
        <Paper id="tra-cuu-hoc-vien" withBorder radius="lg" p="xl">
            <Title order={3} mb="xs">
                Tra cứu học viên
            </Title>
            <Text c="dimmed" mb="lg" size="sm">
                Nhập tên, mã học viên, CMND/CCCD, khóa học hoặc lớp để xác minh chứng chỉ.
            </Text>

            <Stack gap="lg">
                <form onSubmit={handleSearch}>
                    <Group align="flex-end" wrap="wrap">
                        <TextInput
                            label="Từ khóa tra cứu"
                            placeholder="VD: SV001, Nguyễn Văn An..."
                            leftSection={<Search size={16} />}
                            value={keyword}
                            onChange={(event) => setKeyword(event.currentTarget.value)}
                            style={{ flex: 1, minWidth: 220 }}
                        />
                        <Button type="submit">Tra cứu</Button>
                    </Group>
                </form>

                {query && results.length === 0 && (
                    <Text ta="center" c="dimmed" py="md">
                        Không tìm thấy kết quả phù hợp cho &ldquo;{query}&rdquo;.
                    </Text>
                )}

                {results.length > 0 && (
                    <Stack gap="md">
                        <Text size="sm" c="dimmed">
                            Tìm thấy {results.length} kết quả
                        </Text>
                        {results.map((student) => (
                            <StudentCard key={student.id} student={student} />
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
