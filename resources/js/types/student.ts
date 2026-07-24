export type StudentLookupResult = {
    id: string;
    stt: number | null;
    name: string;
    student_code: string;
    cmnd: string | null;
    cmnd_issue_date: string | null;
    cmnd_issue_place: string | null;
    cmnd_issue_place_label: string | null;
    birthday: string | null;
    age: number | null;
    original_place: string | null;
    ethnic: string | null;
    course: string | null;
    class_name: string | null;
    graduation_date: string | null;
    type: string;
    is_revoked: boolean;
    created_at: string | null;
    updated_at: string | null;
};

export type AccountCertificate = {
    id: string;
    student_code: string | null;
    course_title: string | null;
    issued_at: string | null;
    lookup_url: string | null;
};

export type AdminStudentUserLink = {
    id: string;
    name: string;
    email: string;
};

export type AdminStudentListItem = {
    id: string;
    name: string;
    student_code: string;
    cmnd: string | null;
    course: string | null;
    class_name: string | null;
    graduation_date: string | null;
    source: string | null;
    is_revoked: boolean;
    created_at: string | null;
    user: AdminStudentUserLink | null;
};

export type AdminStudentDetail = {
    id: string;
    stt: number | null;
    name: string;
    student_code: string;
    cmnd: string | null;
    cmnd_issue_date: string | null;
    cmnd_issue_place: string | null;
    birthday: string | null;
    original_place: string | null;
    ethnic: string | null;
    course: string | null;
    class_name: string | null;
    graduation_date: string | null;
    type: string;
    source: string | null;
    user_id: string | null;
    course_id: string | null;
    enrollment_id: string | null;
    user: (AdminStudentUserLink & { phone: string | null }) | null;
    linked_course: { id: string; title: string } | null;
    enrollment: {
        id: string;
        status: string;
        course: { id: string; title: string } | null;
    } | null;
    is_revoked: boolean;
    revoked_at: string | null;
    created_at: string | null;
    has_certificate: boolean;
    certificate_id: string | null;
    certificate_email_sent_at: string | null;
};

export type AdminStudentFilterOptions = {
    courses: string[];
    class_names: string[];
    original_places: string[];
};

export type AdminStudentFormOptions = {
    courses: { id: string; title: string }[];
    sources: { value: string; label: string }[];
    cmnd_issue_places: { value: string; label: string }[];
};

export type AdminUserStudentProfile = {
    id: string;
    stt: number | null;
    name: string;
    student_code: string;
    cmnd: string | null;
    cmnd_issue_date: string | null;
    cmnd_issue_place: string | null;
    birthday: string | null;
    original_place: string | null;
    ethnic: string | null;
    course: string | null;
    class_name: string | null;
    graduation_date: string | null;
    type: string;
    source: string | null;
    user_id: string | null;
    course_id: string | null;
    enrollment_id: string | null;
    is_revoked: boolean;
    created_at: string | null;
};

export type AdminStudentFormValues = {
    stt: string;
    name: string;
    student_code: string;
    auto_generate_code: boolean;
    cmnd: string;
    cmnd_issue_date: string;
    cmnd_issue_place: string;
    birthday: string;
    original_place: string;
    ethnic: string;
    course: string;
    class_name: string;
    graduation_date: string;
    type: string;
    source: string;
    user_id: string;
    course_id: string;
    enrollment_id: string;
};

export const adminStudentFormValuesFromUserStudent = (
    student: AdminUserStudentProfile,
    userId: string,
): AdminStudentFormValues => ({
    stt: student.stt?.toString() ?? '',
    name: student.name,
    student_code: student.student_code,
    auto_generate_code: false,
    cmnd: student.cmnd ?? '',
    cmnd_issue_date: student.cmnd_issue_date ?? '',
    cmnd_issue_place: student.cmnd_issue_place ?? '',
    birthday: student.birthday ?? '',
    original_place: student.original_place ?? '',
    ethnic: student.ethnic ?? '',
    course: student.course ?? '',
    class_name: student.class_name ?? '',
    graduation_date: student.graduation_date ?? '',
    type: student.type,
    source: student.source ?? 'manual',
    user_id: userId,
    course_id: student.course_id ?? '',
    enrollment_id: student.enrollment_id ?? '',
});

export const emptyAdminStudentFormValues = (): AdminStudentFormValues => ({
    stt: '',
    name: '',
    student_code: '',
    auto_generate_code: false,
    cmnd: '',
    cmnd_issue_date: '',
    cmnd_issue_place: '',
    birthday: '',
    original_place: '',
    ethnic: '',
    course: '',
    class_name: '',
    graduation_date: '',
    type: 'X',
    source: 'manual',
    user_id: '',
    course_id: '',
    enrollment_id: '',
});

export const adminStudentFormValuesFromDetail = (student: AdminStudentDetail): AdminStudentFormValues => ({
    stt: student.stt?.toString() ?? '',
    name: student.name,
    student_code: student.student_code,
    auto_generate_code: false,
    cmnd: student.cmnd ?? '',
    cmnd_issue_date: student.cmnd_issue_date ?? '',
    cmnd_issue_place: student.cmnd_issue_place ?? '',
    birthday: student.birthday ?? '',
    original_place: student.original_place ?? '',
    ethnic: student.ethnic ?? '',
    course: student.course ?? '',
    class_name: student.class_name ?? '',
    graduation_date: student.graduation_date ?? '',
    type: student.type,
    source: student.source ?? 'manual',
    user_id: student.user_id ?? '',
    course_id: student.course_id ?? '',
    enrollment_id: student.enrollment_id ?? '',
});

export const serializeAdminStudentForm = (values: AdminStudentFormValues) => ({
    ...values,
    stt: values.stt ? Number(values.stt) : null,
    user_id: values.user_id || null,
    course_id: values.course_id || null,
    enrollment_id: values.enrollment_id || null,
    auto_generate_code: values.auto_generate_code || undefined,
});
