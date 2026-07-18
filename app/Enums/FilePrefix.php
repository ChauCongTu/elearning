<?php

namespace App\Enums;

enum FilePrefix: string
{
    case Avatar = 'avatars';
    case CourseThumbnail = 'courses/thumbnails';
    case PostFeatured = 'posts/featured';
    case Banner = 'banners';
    case EditorImage = 'editor/images';
    case Certificate = 'certificates';
    case LessonVideo = 'lessons/videos';

    public function label(): string
    {
        return match ($this) {
            self::Avatar => 'Ảnh đại diện',
            self::CourseThumbnail => 'Ảnh khóa học',
            self::PostFeatured => 'Ảnh bài viết',
            self::Banner => 'Banner',
            self::EditorImage => 'Ảnh soạn thảo',
            self::Certificate => 'Chứng chỉ',
            self::LessonVideo => 'Video bài học',
        };
    }
}
