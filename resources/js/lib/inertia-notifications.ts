import { router } from '@inertiajs/react';
import { notifications } from '@mantine/notifications';
import type { Page } from '@inertiajs/core';

export type InertiaErrors = Record<string, string | string[]>;

export function flattenInertiaErrors(errors: InertiaErrors): string[] {
    return Object.values(errors).flatMap((value) => {
        const messages = Array.isArray(value) ? value : [value];

        return messages.filter(Boolean);
    });
}

export function formatInertiaErrors(errors: InertiaErrors): string {
    const messages = flattenInertiaErrors(errors);

    if (messages.length === 0) {
        return 'Vui lòng kiểm tra lại thông tin đã nhập.';
    }

    if (messages.length === 1) {
        return messages[0];
    }

    return messages.slice(0, 4).join(' · ');
}

export function showSuccessNotification(message: string): void {
    notifications.show({
        id: `success:${message}`,
        title: 'Thành công',
        message,
        color: 'teal',
    });
}

export function showErrorNotification(message: string, title = 'Không thể lưu'): void {
    notifications.show({
        id: `error:${message}`,
        title,
        message,
        color: 'red',
        autoClose: 9000,
    });
}

type FlashPayload = {
    success?: unknown;
    error?: unknown;
};

function readFlashMessage(flash: FlashPayload | undefined, key: 'success' | 'error'): string | null {
    const value = flash?.[key];

    if (value == null || value === '') {
        return null;
    }

    return String(value);
}

export function notifyFromFlash(flash: FlashPayload | undefined): void {
    const success = readFlashMessage(flash, 'success');
    const error = readFlashMessage(flash, 'error');

    if (success) {
        showSuccessNotification(success);
    }

    if (error) {
        showErrorNotification(error, 'Không thể thực hiện');
    }
}

let lastFlashKey = '';

function readFlashPayload(page: Page & { flash?: FlashPayload }): FlashPayload | undefined {
    const topLevelFlash = page.flash;
    const sharedFlash = page.props?.flash as FlashPayload | undefined;

    if (!topLevelFlash && !sharedFlash) {
        return undefined;
    }

    return {
        success: topLevelFlash?.success ?? sharedFlash?.success,
        error: topLevelFlash?.error ?? sharedFlash?.error,
    };
}

function notifyFlashFromPage(page: Page): void {
    const flash = readFlashPayload(page);
    const key = `${page.url}|${readFlashMessage(flash, 'success') ?? ''}|${readFlashMessage(flash, 'error') ?? ''}`;

    if (!readFlashMessage(flash, 'success') && !readFlashMessage(flash, 'error')) {
        return;
    }

    if (lastFlashKey === key) {
        return;
    }

    lastFlashKey = key;
    notifyFromFlash(flash);
}

export function setupInertiaNotifications(): void {
    router.on('start', () => {
        lastFlashKey = '';
    });

    router.on('navigate', (event) => {
        notifyFlashFromPage(event.detail.page);
    });

    router.on('success', (event) => {
        notifyFlashFromPage(event.detail.page);
    });

    router.on('flash', (event) => {
        notifyFromFlash(event.detail.flash as FlashPayload);
    });

    router.on('error', (errors) => {
        if (!errors || typeof errors !== 'object') {
            showErrorNotification('Vui lòng kiểm tra lại thông tin đã nhập.');
            return;
        }

        showErrorNotification(formatInertiaErrors(errors as InertiaErrors));
    });

    router.on('networkError', () => {
        showErrorNotification('Mất kết nối mạng. Vui lòng thử lại.', 'Lỗi kết nối');
    });

    router.on('httpException', (response) => {
        const status = response.status;

        if (status === 403) {
            showErrorNotification('Bạn không có quyền thực hiện thao tác này.', 'Không có quyền');
            return;
        }

        if (status === 419) {
            showErrorNotification('Phiên làm việc hết hạn. Tải lại trang và thử lại.', 'Phiên hết hạn');
            return;
        }

        if (status >= 500) {
            showErrorNotification('Lỗi máy chủ. Vui lòng thử lại sau.', 'Lỗi hệ thống');
        }
    });
}
