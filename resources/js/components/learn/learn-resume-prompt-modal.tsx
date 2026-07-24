import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { PlayCircle, RotateCcw } from 'lucide-react';
import { formatVideoTime } from '@/lib/format';

const MIN_RESUME_PROMPT_SECONDS = 5;

export function shouldOfferLearnResume(
    watchedSeconds: number,
    durationSeconds: number,
    completed: boolean,
    canTrackProgress: boolean,
): boolean {
    if (!canTrackProgress || completed || watchedSeconds < MIN_RESUME_PROMPT_SECONDS) {
        return false;
    }

    if (durationSeconds > 0 && watchedSeconds >= durationSeconds - 3) {
        return false;
    }

    return true;
}

type LearnResumePromptModalProps = {
    opened: boolean;
    watchedSeconds: number;
    lessonTitle: string;
    onContinue: () => void;
    onStartOver: () => void;
};

export default function LearnResumePromptModal({
    opened,
    watchedSeconds,
    lessonTitle,
    onContinue,
    onStartOver,
}: LearnResumePromptModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={() => undefined}
            withCloseButton={false}
            closeOnClickOutside={false}
            closeOnEscape={false}
            centered
            title="Tiếp tục bài học?"
            radius="md"
            zIndex={400}
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    Bài: <strong>{lessonTitle}</strong>
                </Text>

                <Text>
                    Bạn đã học tới{' '}
                    <Text span fw={700} c="pink">
                        {formatVideoTime(watchedSeconds)}
                    </Text>
                    . Bạn có muốn tiếp tục từ đó không?
                </Text>

                <Group justify="flex-end" gap="sm" mt="xs">
                    <Button
                        variant="default"
                        leftSection={<RotateCcw className="size-4" />}
                        onClick={onStartOver}
                    >
                        Học lại từ đầu
                    </Button>
                    <Button
                        color="pink"
                        leftSection={<PlayCircle className="size-4" />}
                        onClick={onContinue}
                    >
                        Tiếp tục học
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
