# Phase 6 — Tra cứu & Chứng chỉ

**Mục tiêu:** Tra cứu học viên công khai (thay legacy `tra-cuu-hoc-vien`) + cấp chứng chỉ PDF + email mã tra cứu + API JSON.  
**Phụ thuộc:** Phase 0, 3 (admin), 4 (enrollment + progress 100%)  
**Ước lượng:** 4–5 ngày  
**Legacy tham khảo:** `e:\CodeBase\tra-cuu-hoc-vien` — **cấu trúc dữ liệu giữ nguyên bảng `students`**

---

## Phạm vi gộp

| Tính năng | Ghi chú |
|-----------|---------|
| Tra cứu web (Inertia) | Giống legacy: tên, mã HV, CMND, khóa, lớp |
| Chứng chỉ PDF | Tự động khi 100%, in **mã học viên** (`student_code`) |
| Email mã tra cứu | Gửi `student_code` khi hoàn thành khóa |
| API public JSON | Trả về **cùng schema** legacy `Student` |

---

## 1. Cấu trúc dữ liệu (khớp legacy)

Bảng Laravel: **`students`** — map 1:1 Supabase legacy (`scripts/create-students-table.sql`).

| Cột | Kiểu | Legacy | Ghi chú |
|-----|------|--------|---------|
| `id` | uuid PK | ✅ | |
| `stt` | integer nullable | ✅ | Số thứ tự import |
| `name` | string, required | ✅ | Họ và tên |
| `student_code` | string, **unique**, required | ✅ | **Mã tra cứu / mã học viên** (VD: `SV001`, in trên PDF) |
| `cmnd` | string(20) nullable | ✅ | CMND/CCCD |
| `cmnd_issue_date` | date nullable | ✅ | |
| `cmnd_issue_place` | string nullable | ✅ | `C1`, `C2` hoặc tên tỉnh (legacy enum) |
| `birthday` | date nullable | ✅ | |
| `original_place` | string nullable | ✅ | Quê quán / nguyên quán |
| `ethnic` | string nullable | ✅ | Dân tộc |
| `course` | string nullable | ✅ | Tên khóa học (text, không FK bắt buộc) |
| `class_name` | string nullable | ✅ | Tên lớp |
| `graduation_date` | date nullable | ✅ | Ngày tốt nghiệp / hoàn thành |
| `type` | string(10), default `'X'` | ✅ | Loại bản ghi legacy |
| `created_at` / `updated_at` | timestamp | ✅ | |

### Cột mở rộng (e-learning — nullable)

| Cột | Mục đích |
|-----|----------|
| `enrollment_id` | FK → enrollments (học online auto-sync) |
| `user_id` | FK → users |
| `course_id` | FK → courses (optional, đồng bộ tên `course`) |
| `source` | `online` \| `manual` \| `import` |
| `is_revoked` | Thu hồi tra cứu (legacy không có — thêm mới) |
| `revoked_at` | |

> **Không đổi tên cột legacy.** `student_code` = mã tra cứu (không dùng tên `verification_code` riêng).

### Index (giống legacy + bổ sung)

```sql
idx_students_name
idx_students_student_code   -- unique
idx_students_course
idx_students_class_name
idx_students_graduation_date
idx_students_cmnd           -- tra cứu CMND
```

### Bảng phụ: `certificates` (PDF e-learning)

```
certificates
├── id
├── enrollment_id (unique)
├── student_id → students.id
├── file_path
├── issued_at
├── certificate_email_sent_at (nullable)
└── timestamps
```

---

## 2. Import CSV (đúng format legacy)

Header **bắt buộc** (12 cột, UTF-8, giống `lib/csvParser.ts`):

```csv
stt,name,student_code,cmnd,cmnd_issue_date,cmnd_issue_place,birthday,original_place,ethnic,course,class_name,graduation_date
```

- Bắt buộc: `name`, `student_code`
- Ngày: `YYYY-MM-DD` hoặc `DD/MM/YYYY`
- `cmnd_issue_place`: mã `C1`/`C2` hoặc tên địa phương
- File mẫu admin tải về giống legacy (`mau_import_hoc_vien.csv`)

**Phase 7 Migration:** import trực tiếp từ Supabase `students` → Laravel `students` (cùng schema).

---

## 3. Tra cứu công khai

**URL:** `GET /tra-cuu-hoc-vien` · `?q={keyword}`

### Logic tìm (giống legacy `studentAPI.search`)

Một keyword, **OR** khớp **chính xác** (`eq`):

- `name`
- `student_code`
- `cmnd`
- `course`
- `class_name`

Admin list dùng thêm `ilike` partial (giống legacy `getAll`).

### Kết quả hiển thị (card — giống legacy UI)

**Thông tin cá nhân**

- Họ tên, `student_code` (badge)
- Sinh nhật (+ tuổi)
- CMND/CCCD
- Quê quán, dân tộc

**Thông tin học tập**

- Khóa học (`course`)
- Lớp (`class_name`)
- Ngày tốt nghiệp (`graduation_date`)

**Thông tin CMND** (nếu có)

- Ngày cấp, nơi cấp (tooltip `C1`/`C2` → full text như legacy)

**Trạng thái e-learning**

- `is_revoked = true` → badge **Đã thu hồi** (không ẩn record)

- Rate limit `throttle:30,1`, `noindex`

---

## 4. Chứng chỉ PDF

- [x] `composer require barryvdh/laravel-dompdf`
- [x] Template in: tên, khóa (`course`), ngày (`graduation_date`), **`student_code`**
- [x] `CertificateService::issue(Enrollment)` → tạo/update `students` + sinh PDF
- [x] Job khi `progress_percent = 100` (idempotent)

### Auto-sync học online → `students`

| Cột students | Nguồn |
|--------------|--------|
| `name` | `users.name` |
| `student_code` | Auto unique (VD: `ELN2026-0001`) — **hoặc** copy từ rule khách |
| `cmnd` | `users.cmnd` (thêm cột profile nếu cần) |
| `birthday` | `users.birth_year` → `YYYY-01-01` hoặc field ngày sinh đầy đủ |
| `course` | `courses.title` |
| `graduation_date` | `enrollments.completed_at` |
| `class_name` | nullable / `"Online"` |
| `type` | `'X'` |
| `source` | `online` |
| `enrollment_id`, `user_id`, `course_id` | FK |

---

## 5. Email mã tra cứu

- Gửi **`student_code`** (không phải mã khác)
- Link: `/tra-cuu-hoc-vien?q={student_code}`
- Optional đính kèm PDF (`CERTIFICATE_EMAIL_ATTACH_PDF`)

---

## 6. API public JSON

```
GET /api/v1/students/search?q={keyword}
```

Response schema **legacy** (`SearchResponse`):

```json
{
  "success": true,
  "data": [{
    "id": "...",
    "stt": 1,
    "name": "Nguyễn Văn An",
    "student_code": "SV001",
    "cmnd": "123456789",
    "cmnd_issue_date": "2020-01-15",
    "cmnd_issue_place": "Hà Nội",
    "birthday": "1995-05-20",
    "original_place": "Hà Nội",
    "ethnic": "Kinh",
    "course": "Khóa phun xăm cơ bản",
    "class_name": "CNTT01",
    "graduation_date": "2023-06-15",
    "type": "X",
    "created_at": "...",
    "updated_at": "..."
  }],
  "total": 1,
  "message": "Tìm thấy 1 kết quả"
}
```

- Bản ghi `is_revoked` → `success: true`, thêm `"status": "revoked"` hoặc filter tùy config
- Rate limit, `Accept: application/json`
- **Không** trả email/SĐT user (legacy cũng không có)

---

## 7. Admin

Menu **Tra cứu học viên** (giống legacy admin, trong panel Laravel):

- Danh sách + phân trang + filter: `course`, `class_name`, `original_place`
- CRUD `students`
- Import CSV 12 cột
- Thu hồi (`is_revoked`) thay xóa cứng
- Gửi lại email `student_code`
- Tải lại PDF (nếu có enrollment)

---

## Routes

```
GET  /tra-cuu-hoc-vien
GET  /api/v1/students/search?q=

GET  /account/certificates
GET  /account/certificates/{id}/download

GET|POST|PUT  /admin/students/...
POST          /admin/students/import
POST          /admin/students/{id}/revoke
POST          /admin/students/{id}/resend-email
```

Model Eloquent: `App\Models\Student` (table `students`).

---

## Backend services

- `StudentLookupService` — search (legacy OR logic), import CSV, revoke
- `StudentSyncService` — enrollment 100% → upsert `students`
- `CertificateService` — PDF
- `StudentSearchApiController` — JSON legacy shape

---

## Mapping TypeScript ↔ Laravel (tham chiếu)

```typescript
// legacy lib/supabase.ts — giữ nguyên cho frontend types
interface Student {
  id: string
  stt: number | null
  name: string
  student_code: string
  cmnd: string | null
  cmnd_issue_date: string | null
  cmnd_issue_place: string | null
  birthday: string | null
  original_place: string | null
  ethnic: string | null
  course: string | null
  class_name: string | null
  graduation_date: string | null
  type: string
  created_at: string
  updated_at: string
}
```

---

## Tests

- [x] Import CSV legacy 12 cột → insert `students`
- [x] Search `q` khớp name / student_code / cmnd / course / class_name
- [x] API JSON schema khớp legacy
- [x] Enrollment 100% → upsert `students` + PDF + email `student_code`
- [x] `student_code` unique
- [x] Revoked record hiển thị đúng

---

## Acceptance criteria

1. Schema DB **tương thích import** từ Supabase legacy
2. CSV import **không đổi format** so với app cũ
3. Tra cứu public + API trả **cùng trường** legacy
4. Học online 100% → có bản ghi `students` + PDF + email mã
5. `student_code` trên PDF tra được trên web/API

---

## Không làm trong phase này

- Chữ ký số PKI
- App mobile / Supabase riêng
- Đổi tên cột legacy sang tiếng Anh khác (`full_name`, `national_id`, …)

---

## Tiếp theo

→ [phase-7-migration.md](./phase-7-migration.md)
