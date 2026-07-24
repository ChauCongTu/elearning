export type PurchaseOrderItem = {
    id: string;
    price: string;
    course: {
        id: string;
        title: string;
        slug: string;
        thumbnail_path: string | null;
        thumbnail_url?: string | null;
    } | null;
};

export type PurchaseOrder = {
    id: string;
    code: string;
    status: 'pending' | 'paid' | 'expired' | 'cancelled';
    amount: string;
    paid_at: string | null;
    created_at: string | null;
    items: PurchaseOrderItem[];
};

export type PaymentRecord = {
    id: string;
    gateway: string;
    amount: string;
    received_at: string | null;
    order: {
        id: string;
        code: string;
        status: string;
    } | null;
};

export type LoginHistoryEntry = {
    id: string;
    ip_address: string | null;
    device: string | null;
    location: string | null;
    logged_in_at: string | null;
};
