import { Select, Stack, Switch, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import AdminUserSearchSelect from '@/components/admin/admin-user-search-select';
import type { AdminStudentFormOptions, AdminStudentFormValues, AdminStudentUserLink } from '@/types';

type Props = {
    form: UseFormReturnType<AdminStudentFormValues>;
    formOptions: AdminStudentFormOptions;
    showUserLink?: boolean;
    showAutoCode?: boolean;
    linkedUser?: AdminStudentUserLink | null;
    enrollmentOptions?: { value: string; label: string }[];
};

export default function AdminStudentFormFields({
    form,
    formOptions,
    showUserLink = true,
    showAutoCode = true,
    linkedUser,
    enrollmentOptions = [],
}: Props) {
    const autoGenerate = form.values.auto_generate_code;

    return (
        <Stack gap="sm">
            <TextInput label="STT" {...form.getInputProps('stt')} />
            <TextInput label="Họ tên" required {...form.getInputProps('name')} />

            {showAutoCode && (
                <Switch
                    label="Tự sinh mã học viên"
                    {...form.getInputProps('auto_generate_code', { type: 'checkbox' })}
                />
            )}

            {!autoGenerate && (
                <TextInput label="Mã học viên" required {...form.getInputProps('student_code')} />
            )}

            <TextInput label="CMND/CCCD" {...form.getInputProps('cmnd')} />
            <TextInput label="Ngày cấp CMND" type="date" {...form.getInputProps('cmnd_issue_date')} />
            <Select
                label="Nơi cấp CMND"
                placeholder="C1 / C2"
                clearable
                searchable
                data={formOptions.cmnd_issue_places}
                {...form.getInputProps('cmnd_issue_place')}
            />
            <TextInput label="Ngày sinh" type="date" {...form.getInputProps('birthday')} />
            <TextInput label="Quê quán" {...form.getInputProps('original_place')} />
            <TextInput label="Dân tộc" {...form.getInputProps('ethnic')} />

            <Select
                label="Khóa học (hệ thống)"
                placeholder="Chọn khóa"
                clearable
                searchable
                data={formOptions.courses.map((course) => ({ value: course.id, label: course.title }))}
                {...form.getInputProps('course_id')}
            />
            <TextInput label="Tên khóa học (tra cứu)" {...form.getInputProps('course')} />
            <TextInput label="Lớp" {...form.getInputProps('class_name')} />
            <TextInput label="Ngày tốt nghiệp" type="date" {...form.getInputProps('graduation_date')} />

            {enrollmentOptions.length > 0 && (
                <Select
                    label="Ghi danh"
                    placeholder="Chọn ghi danh"
                    clearable
                    searchable
                    data={enrollmentOptions}
                    {...form.getInputProps('enrollment_id')}
                />
            )}

            <Select
                label="Nguồn"
                data={formOptions.sources.map((source) => ({ value: source.value, label: source.label }))}
                {...form.getInputProps('source')}
            />

            {showUserLink && (
                <AdminUserSearchSelect
                    value={form.values.user_id}
                    onChange={(userId) => form.setFieldValue('user_id', userId)}
                    linkedUser={linkedUser}
                />
            )}
        </Stack>
    );
}
