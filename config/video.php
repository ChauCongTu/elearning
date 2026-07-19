<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Video Storage Disk
    |--------------------------------------------------------------------------
    |
    | Disk used for lesson videos (signed URLs, presigned uploads).
    | Defaults to UPLOAD_DISK so S3 and local stay in sync.
    |
    */

    'disk' => env('VIDEO_DISK', env('UPLOAD_DISK', 's3')),

    /*
    |--------------------------------------------------------------------------
    | Signed URL TTL (minutes)
    |--------------------------------------------------------------------------
    */

    'signed_url_ttl_minutes' => (int) env('VIDEO_SIGNED_URL_TTL', 120),

    /*
    |--------------------------------------------------------------------------
    | Presigned upload TTL (minutes)
    |--------------------------------------------------------------------------
    */

    'upload_url_ttl_minutes' => (int) env('VIDEO_UPLOAD_URL_TTL', 30),

    /*
    |--------------------------------------------------------------------------
    | Lesson completion threshold
    |--------------------------------------------------------------------------
    */

    'completion_ratio' => 0.9,

    /*
    |--------------------------------------------------------------------------
    | Unlock next lesson threshold
    |--------------------------------------------------------------------------
    |
    | Học viên phải xem ít nhất tỷ lệ này của bài trước mới mở bài tiếp theo.
    |
    */

    'unlock_ratio' => 0.8,

    /*
    |--------------------------------------------------------------------------
    | Anti-seek (server-side cap per heartbeat)
    |--------------------------------------------------------------------------
    */

    'max_progress_advance_seconds' => 35,

    /*
    |--------------------------------------------------------------------------
    | Viewer watermark (anti-leak overlay)
    |--------------------------------------------------------------------------
    |
    | Hiển thị email học viên trên video theo chu kỳ ngẫu nhiên để truy vết leak.
    |
    */

    'watermark' => [
        'enabled' => filter_var(env('VIDEO_WATERMARK_ENABLED', true), FILTER_VALIDATE_BOOL),
        'min_interval_seconds' => (int) env('VIDEO_WATERMARK_MIN_INTERVAL', 90),
        'max_interval_seconds' => (int) env('VIDEO_WATERMARK_MAX_INTERVAL', 210),
        'min_visible_seconds' => (int) env('VIDEO_WATERMARK_MIN_VISIBLE', 5),
        'max_visible_seconds' => (int) env('VIDEO_WATERMARK_MAX_VISIBLE', 10),
        'initial_delay_min_seconds' => (int) env('VIDEO_WATERMARK_INITIAL_DELAY_MIN', 30),
        'initial_delay_max_seconds' => (int) env('VIDEO_WATERMARK_INITIAL_DELAY_MAX', 75),
    ],

    /*
    |--------------------------------------------------------------------------
    | Capture guard (best-effort in browser)
    |--------------------------------------------------------------------------
    |
    | Không chặn được phần mềm quay màn hình hệ điều hành (OBS, iPhone…).
    | Chỉ hỗ trợ: tạm dừng khi ẩn tab, chặn phím tắt chụp màn hình phổ biến.
    |
    */

    'capture_guard' => [
        'enabled' => filter_var(env('VIDEO_CAPTURE_GUARD_ENABLED', true), FILTER_VALIDATE_BOOL),
        'pause_on_hidden' => filter_var(env('VIDEO_CAPTURE_GUARD_PAUSE_ON_HIDDEN', true), FILTER_VALIDATE_BOOL),
        'block_capture_shortcuts' => filter_var(env('VIDEO_CAPTURE_GUARD_BLOCK_SHORTCUTS', true), FILTER_VALIDATE_BOOL),
    ],

];
