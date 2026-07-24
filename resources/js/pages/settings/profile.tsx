import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { AvatarUpload } from '@/components/avatar-upload';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth, GenderOption } from '@/types';

type PageProps = {
    auth: Auth;
    mustVerifyEmail: boolean;
    status?: string;
    genders: GenderOption[];
    errors: Partial<Record<'name' | 'email' | 'phone' | 'gender' | 'birth_year' | 'preference' | 'avatar', string>>;
};

function fieldValue(form: HTMLFormElement, name: string): string {
    const field = form.elements.namedItem(name);

    if (field instanceof RadioNodeList) {
        return field.value;
    }

    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        return field.value;
    }

    return '';
}

function buildProfileFormData(form: HTMLFormElement, avatarFile: File | null): FormData {
    const formData = new FormData();

    formData.append('name', fieldValue(form, 'name'));
    formData.append('email', fieldValue(form, 'email'));
    formData.append('phone', fieldValue(form, 'phone'));
    formData.append('gender', fieldValue(form, 'gender'));
    formData.append('birth_year', fieldValue(form, 'birth_year'));
    formData.append('preference', fieldValue(form, 'preference'));

    if (avatarFile) {
        formData.append('avatar', avatarFile, avatarFile.name);
    }

    return formData;
}

export default function Profile() {
    const { auth, mustVerifyEmail, status, genders, errors = {} } = usePage<PageProps>().props;
    const user = auth.user!;
    const formRef = useRef<HTMLFormElement>(null);
    const avatarFileRef = useRef<File | null>(null);
    const [processing, setProcessing] = useState(false);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = formRef.current;

        if (!form) {
            return;
        }

        router.visit(ProfileController.update.url(), {
            method: 'post',
            data: buildProfileFormData(form, avatarFileRef.current),
            forceFormData: true,
            preserveScroll: true,
            preserveState: false,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Hồ sơ cá nhân" />

            <h1 className="sr-only">Hồ sơ cá nhân</h1>

            <div className="space-y-6">
                <Heading variant="small" title="Hồ sơ cá nhân" />

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        Email chưa được xác minh.
                        {status === 'verification-link-sent' && (
                            <span className="mt-1 block">
                                Liên kết xác minh mới đã được gửi.
                            </span>
                        )}
                    </div>
                )}

                <form
                    ref={formRef}
                    onSubmit={submit}
                    encType="multipart/form-data"
                    className="space-y-6"
                >
                    <AvatarUpload
                        name={user.name}
                        currentUrl={user.avatar_url}
                        error={errors.avatar}
                        onFileSelect={(file) => {
                            avatarFileRef.current = file;
                        }}
                    />

                    <div className="grid gap-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={user.name}
                            required
                            autoComplete="name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={user.email}
                            required
                            autoComplete="username"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            defaultValue={user.phone ?? ''}
                            placeholder="0912345678"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="gender">Giới tính</Label>
                        <select
                            id="gender"
                            name="gender"
                            defaultValue={user.gender ?? ''}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                        >
                            <option value="">— Chọn —</option>
                            {genders.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.gender} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="birth_year">Năm sinh</Label>
                        <Input
                            id="birth_year"
                            name="birth_year"
                            type="number"
                            min={1940}
                            max={new Date().getFullYear()}
                            defaultValue={user.birth_year ?? ''}
                            placeholder="1995"
                        />
                        <InputError message={errors.birth_year} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="preference">Ghi chú / Yêu cầu đặc biệt</Label>
                        <textarea
                            id="preference"
                            name="preference"
                            defaultValue={user.preference ?? ''}
                            rows={4}
                            placeholder="Ví dụ: Muốn tư vấn khóa phun xăm buổi tối..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                        />
                        <InputError message={errors.preference} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing} data-test="update-profile-button">
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Hồ sơ cá nhân',
            href: edit(),
        },
    ],
};
