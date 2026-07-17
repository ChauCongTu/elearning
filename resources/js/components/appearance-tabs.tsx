import { Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600',
                className,
            )}
            {...props}
        >
            <Sun className="size-4 text-amber-500" />
            <span>Giao diện sáng được sử dụng mặc định.</span>
        </div>
    );
}
