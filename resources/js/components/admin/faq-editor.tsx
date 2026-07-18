import { ActionIcon, Button, Group, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { Plus, Trash2 } from 'lucide-react';

export type FaqItem = { q: string; a: string };

type Props = {
    value: FaqItem[];
    onChange: (value: FaqItem[]) => void;
    error?: string;
};

export default function FaqEditor({ value, onChange, error }: Props) {
    const addItem = () => {
        onChange([...value, { q: '', a: '' }]);
    };

    const updateItem = (index: number, field: keyof FaqItem, fieldValue: string) => {
        onChange(value.map((item, i) => (i === index ? { ...item, [field]: fieldValue } : item)));
    };

    const removeItem = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <Stack gap="sm">
            <Group justify="space-between" align="center">
                <Text size="sm" fw={500}>
                    Câu hỏi thường gặp (FAQ)
                </Text>
                <Button variant="light" size="xs" leftSection={<Plus size={14} />} onClick={addItem}>
                    Thêm câu hỏi
                </Button>
            </Group>
            <Text size="xs" c="dimmed">
                Hiển thị trên trang chi tiết khóa học. Để trống nếu không cần FAQ.
            </Text>
            {error && (
                <Text size="xs" c="red">
                    {error}
                </Text>
            )}
            {value.length === 0 ? (
                <Text size="sm" c="dimmed" fs="italic">
                    Chưa có câu hỏi nào.
                </Text>
            ) : (
                value.map((item, index) => (
                    <Stack key={index} gap="xs" className="admin-faq-item">
                        <Group justify="space-between" align="center">
                            <Text size="xs" fw={600} c="dimmed">
                                Câu {index + 1}
                            </Text>
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                aria-label="Xóa câu hỏi"
                                onClick={() => removeItem(index)}
                            >
                                <Trash2 size={14} />
                            </ActionIcon>
                        </Group>
                        <TextInput
                            label="Câu hỏi"
                            placeholder="VD: Khóa học kéo dài bao lâu?"
                            value={item.q}
                            onChange={(event) => updateItem(index, 'q', event.currentTarget.value)}
                        />
                        <Textarea
                            label="Trả lời"
                            placeholder="Nội dung trả lời..."
                            minRows={3}
                            value={item.a}
                            onChange={(event) => updateItem(index, 'a', event.currentTarget.value)}
                        />
                    </Stack>
                ))
            )}
        </Stack>
    );
}

export function sanitizeFaqItems(items: FaqItem[]): FaqItem[] {
    return items
        .map((item) => ({ q: item.q.trim(), a: item.a.trim() }))
        .filter((item) => item.q !== '' || item.a !== '');
}
