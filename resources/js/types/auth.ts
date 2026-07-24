export type User = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: 'student' | 'admin';
    is_root_account?: boolean;
    can_complete_orders?: boolean;
    avatar?: string | null;
    avatar_url?: string | null;
    gender?: 'male' | 'female' | 'other' | 'undisclosed' | null;
    birth_year?: number | null;
    preference?: string | null;
    email_verified_at: string | null;
    last_login_at?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type Auth = {
    user: User | null;
};

export type GenderOption = {
    value: string;
    label: string;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */
