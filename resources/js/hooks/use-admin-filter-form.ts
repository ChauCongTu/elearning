import { useForm, type UseFormReturnType } from '@mantine/form';
import { useEffect, useMemo, useRef } from 'react';

export function useAdminFilterForm<T extends Record<string, string>>(
    initialValues: T,
): UseFormReturnType<T> {
    const valuesKey = useMemo(() => JSON.stringify(initialValues), [initialValues]);
    const syncedKeyRef = useRef(valuesKey);

    const form = useForm<T>({
        initialValues,
    });

    useEffect(() => {
        if (syncedKeyRef.current === valuesKey) {
            return;
        }

        syncedKeyRef.current = valuesKey;
        form.setValues(initialValues);
    }, [form.setValues, initialValues, valuesKey]);

    return form;
}
