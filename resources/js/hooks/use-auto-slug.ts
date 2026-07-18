import { useEffect, useRef } from 'react';
import type { UseFormReturnType } from '@mantine/form';
import { slugify } from '@/lib/admin-form';

export function useAutoSlug<T extends Record<string, unknown>>(
    form: UseFormReturnType<T>,
    titleField: keyof T & string,
    slugField: keyof T & string,
    enabled: boolean,
) {
    const slugTouched = useRef(false);

    useEffect(() => {
        if (!enabled || slugTouched.current) {
            return;
        }

        const title = String(form.values[titleField] ?? '');
        if (title) {
            form.setFieldValue(slugField, slugify(title) as never);
        }
    }, [enabled, form, slugField, titleField, form.values[titleField]]);

    const slugInputProps = form.getInputProps(slugField);

    return {
        slugInputProps: {
            ...slugInputProps,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                slugTouched.current = event.currentTarget.value.length > 0;
                slugInputProps.onChange(event);
            },
        },
        regenerateSlug: () => {
            const title = String(form.values[titleField] ?? '');
            form.setFieldValue(slugField, slugify(title) as never);
            slugTouched.current = true;
        },
        resetSlugTouch: () => {
            slugTouched.current = false;
        },
    };
}
