import { Camera, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Leave headroom for multipart overhead when PHP post_max_size equals upload_max_filesize (often 2M). */
const MAX_AVATAR_BYTES = Math.floor(1.5 * 1024 * 1024);

type Props = {
    name: string;
    currentUrl?: string | null;
    error?: string;
    onFileSelect?: (file: File | null) => void;
};

export function AvatarUpload({ name, currentUrl, error, onFileSelect }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const displayUrl = preview ?? currentUrl ?? null;
    const displayError = localError ?? error;

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.size > MAX_AVATAR_BYTES) {
            setLocalError('Ảnh không được lớn hơn 1,5MB.');
            onFileSelect?.(null);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
            return;
        }

        if (!file.type.startsWith('image/')) {
            setLocalError('Vui lòng chọn file ảnh (JPG, PNG, WebP, GIF).');
            onFileSelect?.(null);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
            return;
        }

        setLocalError(null);

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview(URL.createObjectURL(file));
        onFileSelect?.(file);
    };

    const clearSelection = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview(null);
        setLocalError(null);
        onFileSelect?.(null);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-5">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        'group relative size-24 overflow-hidden rounded-full border-2 border-dashed border-pink-200 bg-pink-50 transition-colors hover:border-pink-300 hover:bg-pink-100/80',
                        displayError && 'border-red-300',
                    )}
                >
                    {displayUrl ? (
                        <img
                            src={displayUrl}
                            alt={name}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full flex-col items-center justify-center text-pink-400">
                            <UserRound className="size-8" />
                            <span className="mt-1 text-[10px] font-medium uppercase tracking-wide">
                                Ảnh
                            </span>
                        </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera className="size-6 text-white" />
                    </div>
                </button>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Ảnh đại diện</p>
                    <p className="max-w-xs text-sm text-gray-500">
                        JPG, PNG hoặc WebP. Tối đa 1,5MB. Nhấn vào ảnh để chọn file mới.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                        >
                            Chọn ảnh
                        </Button>
                        {preview && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearSelection}
                            >
                                <X className="mr-1 size-4" />
                                Bỏ chọn
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <input
                ref={inputRef}
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleFileChange}
            />

            {displayError && <p className="text-sm text-red-600">{displayError}</p>}
        </div>
    );
}
