# Phase 4 — Online Learning

**Mục tiêu:** Giao diện học theo chương, video S3 signed URL, lưu tiến độ.  
**Phụ thuộc:** Phase 0, 2, 3 (enrollment qua admin manual grant + seeder demo — chưa cần payment)  
**Ước lượng:** 4–5 ngày

## Checklist

### AWS S3

- [ ] Cấu hình `filesystems.php` disk `s3`
- [ ] `VideoStreamService::signedUrl(lesson)` — TTL configurable (default 2h)
- [ ] Policy: chỉ user có `enrollment.active` mới lấy URL (trừ `is_free_preview`)

### Admin upload (minimal — full UI phase 3)

- [ ] `POST /admin/lessons/{id}/upload-url` — presigned PUT cho admin
- [ ] Callback confirm upload → save `video_s3_key`, probe duration (ffprobe local hoặc manual input tạm)

### Learning routes

```
GET  /learn/{course:slug}                    → redirect lesson đang học dở hoặc first
GET  /learn/{course:slug}/lessons/{lesson}   → player page
PATCH /learn/progress                        → heartbeat watched_seconds
POST /learn/lessons/{lesson}/complete        → đánh dấu bài đã học (bỏ qua nếu không cần xem hết)
```

### Backend logic

- [ ] `LearningController@show` — sidebar chapters/lessons, current lesson, signed video URL
- [ ] `ProgressController@update` — validate enrollment, update `lesson_progress`
- [ ] `ProgressController@complete` — đánh dấu `completed=true`, mở khóa bài tiếp theo
- [ ] `EnrollmentProgressService::recalculate` — % hoàn thành course
- [ ] Mark lesson `completed` khi watched >= 90% duration hoặc học viên bấm "Đánh dấu đã học"
- [ ] Queue job debounce recalculate (optional)

### Frontend

- [ ] `pages/learn/player.tsx`
  - Layout: sidebar curriculum (Mantine NavLink) + main video area
  - Video player HTML5 — không download dễ (no controls download best-effort)
  - Heartbeat mỗi 15–30s gửi `watched_seconds`
  - Nút **Đánh dấu đã học** — hoàn thành bài mà không cần xem hết video (mở khóa bài tiếp theo)
  - Nút prev/next lesson
  - Hiển thị % tiến độ course trên header
- [ ] Mobile: sidebar collapse drawer
- [ ] Bật nút "Tiếp tục học" trên `/account/courses` (Phase 2)

### Tests

- [ ] User without enrollment → 403
- [ ] User with enrollment → receives signed URL
- [ ] Progress update increases watched_seconds
- [ ] 90% watch marks completed
- [ ] Mark as done completes lesson and unlocks next lesson
- [ ] Preview lesson accessible without enrollment

## Acceptance criteria

1. Học viên có enrollment (admin grant hoặc seeder) xem được video
2. Reload trang resume từ `watched_seconds` gần nhất
3. Hoàn thành tất cả bài → `progress_percent = 100`
4. URL video hết hạn → request URL mới (player error handler)

## Bảo mật video

- Bucket private, video phát qua **proxy same-origin** (`/learn/lessons/{id}/stream`) — không lộ signed URL S3 ra client
- Stream yêu cầu quyền học + cookie session; chặn mở trực tiếp tab mới (`Sec-Fetch-Dest`)
- Không đưa `video_s3_key` ra Inertia props client — chỉ signed URL
- Player: `controlsList=nodownload`, chặn PiP / remote playback, chặn menu chuột phải
- Chặn tua nhanh / tua vượt tiến độ (client + server)
- Chặn phím DevTools / Save / Print (best-effort trên trình duyệt)
- Capture guard: tạm dừng khi ẩn tab, chặn phím chụp màn hình phổ biến (best-effort)
- Watermark `Tên - email` theo chu kỳ ngẫu nhiên để truy vết leak quay màn hình
- **Không thể** chặn hoàn toàn: OBS, quay màn hình iPhone/Android, extension tải video — cần app native + DRM nếu yêu cầu cao hơn
- CORS S3 chỉ domain production

## Không làm trong phase này

- Thanh toán tự động (Phase 5)
- Chứng chỉ PDF (Phase 6)
- Quiz, bài tập
- DRM chuyên sâu

## Tiếp theo

→ [phase-5-payment.md](./phase-5-payment.md)
