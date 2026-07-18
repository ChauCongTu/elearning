import { Link, RichTextEditor } from '@mantine/tiptap';
import { Button, FileButton, Group, Input, Modal, Stack, TextInput } from '@mantine/core';
import { useEditor } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import { ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { uploadEditorImage } from '@/lib/admin-list';

type Props = {
    label: string;
    description?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    minHeight?: number;
    required?: boolean;
    enableImageUpload?: boolean;
};

export default function AdminRichTextField({
    label,
    description,
    value,
    onChange,
    error,
    minHeight = 240,
    required,
    enableImageUpload = true,
}: Props) {
    const [uploading, setUploading] = useState(false);
    const [pendingImage, setPendingImage] = useState<File | null>(null);
    const [imageDescription, setImageDescription] = useState('');
    const fileInputReset = useRef<() => void>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
            }),
            Image.configure({
                HTMLAttributes: { class: 'admin-rich-text__image' },
            }),
        ],
        content: value || '',
        onUpdate: ({ editor: currentEditor }) => {
            onChange(currentEditor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const current = editor.getHTML();
        const normalized = value || '';

        if (normalized !== current && normalized !== current.replace('<p></p>', '')) {
            editor.commands.setContent(normalized, { emitUpdate: false });
        }
    }, [editor, value]);

    const closeImageModal = () => {
        setPendingImage(null);
        setImageDescription('');
        fileInputReset.current?.();
    };

    const handleImageSelected = (file: File | null) => {
        if (!file || !editor) {
            return;
        }

        setPendingImage(file);
        setImageDescription('');
    };

    const insertImageWithDescription = async () => {
        if (!pendingImage || !editor) {
            return;
        }

        setUploading(true);

        try {
            const url = await uploadEditorImage(pendingImage);
            const alt = imageDescription.trim() || pendingImage.name;
            editor.chain().focus().setImage({ src: url, alt, title: alt }).run();
            closeImageModal();
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Input.Wrapper label={label} description={description} error={error} withAsterisk={required}>
                <RichTextEditor editor={editor} className="admin-rich-text" styles={{ content: { minHeight } }}>
                    <RichTextEditor.Toolbar sticky stickyOffset={72}>
                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Bold />
                            <RichTextEditor.Italic />
                            <RichTextEditor.Strikethrough />
                            <RichTextEditor.ClearFormatting />
                        </RichTextEditor.ControlsGroup>
                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.H2 />
                            <RichTextEditor.H3 />
                            <RichTextEditor.BulletList />
                            <RichTextEditor.OrderedList />
                            <RichTextEditor.Blockquote />
                        </RichTextEditor.ControlsGroup>
                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Link />
                            <RichTextEditor.Unlink />
                        </RichTextEditor.ControlsGroup>
                        {enableImageUpload && (
                            <RichTextEditor.ControlsGroup>
                                <FileButton
                                    resetRef={fileInputReset}
                                    accept="image/*"
                                    onChange={handleImageSelected}
                                >
                                    {(props) => (
                                        <RichTextEditor.Control
                                            {...props}
                                            aria-label="Chèn ảnh"
                                            title="Chèn ảnh"
                                            disabled={uploading}
                                        >
                                            <ImageIcon size={16} />
                                        </RichTextEditor.Control>
                                    )}
                                </FileButton>
                            </RichTextEditor.ControlsGroup>
                        )}
                    </RichTextEditor.Toolbar>
                    <RichTextEditor.Content />
                </RichTextEditor>
            </Input.Wrapper>

            <Modal
                opened={pendingImage !== null}
                onClose={closeImageModal}
                title="Mô tả ảnh"
                centered
            >
                <Stack gap="md">
                    <TextInput
                        label="Mô tả / alt text"
                        description="Hiển thị khi ảnh không tải được và hỗ trợ SEO."
                        placeholder="VD: Học viên thực hành trên mẫu thật"
                        value={imageDescription}
                        onChange={(event) => setImageDescription(event.currentTarget.value)}
                        data-autofocus
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={closeImageModal} disabled={uploading}>
                            Hủy
                        </Button>
                        <Button onClick={insertImageWithDescription} loading={uploading}>
                            Chèn ảnh
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
