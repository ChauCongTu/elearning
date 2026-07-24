export type CheckoutQr = {
    qr_url: string;
    image_url: string;
    download_url: string;
    transfer_content: string;
    amount: number;
    bank_code: string;
    bank_name: string;
    account_number: string | null;
    account_name: string | null;
    is_configured: boolean;
};

export type CheckoutOrder = {
    code: string;
    status: string;
    amount: string;
    created_at: string | null;
    expires_at: string | null;
    course: {
        title: string;
        slug: string;
        thumbnail_path: string | null;
        thumbnail_url?: string | null;
    } | null;
    qr: CheckoutQr;
};

export type CoursePurchaseState = {
    is_enrolled: boolean;
    pending_order_code: string | null;
};
