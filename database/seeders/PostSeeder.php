<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            ['name' => 'Tin tức', 'slug' => 'tin-tuc', 'description' => 'Tin tức và cập nhật từ Học Viện Bông Nhài Trắng'],
            ['name' => 'Tin tức nổi bật', 'slug' => 'tin-tuc-noi-bat', 'description' => 'Bài viết được quan tâm nhất'],
            ['name' => 'Hướng nghiệp', 'slug' => 'huong-nghiep', 'description' => 'Định hướng nghề nghiệp làm đẹp'],
            ['name' => 'Kiến thức', 'slug' => 'kien-thuc', 'description' => 'Kiến thức chuyên môn thẩm mỹ'],
        ])->mapWithKeys(function (array $data, int $index) {
            $category = PostCategory::create([
                ...$data,
                'sort_order' => $index,
                'is_active' => true,
            ]);

            return [$data['slug'] => $category];
        });

        $posts = [
            [
                'category' => 'huong-nghiep',
                'slug' => 'phu-nu-nen-hoc-nghe-gi',
                'title' => 'Phụ Nữ Nên Học Nghề Gì Nhanh Và Có Thu Nhập Ổn Định?',
                'excerpt' => 'Phụ nữ nên học nghề gì là câu hỏi không có một đáp án chung. Bài viết phân tích theo từng hoàn cảnh thực tế và tiêu chí chọn nghề phù hợp.',
                'is_featured' => true,
                'content' => $this->phuNuNenHocNgheGiContent(),
            ],
            [
                'category' => 'kien-thuc',
                'slug' => 'phun-moi-nano-la-gi',
                'title' => 'Phun Môi Nano Là Gì? Kỹ Thuật, Ưu Điểm Và Lưu Ý Quan Trọng',
                'excerpt' => 'Phun môi nano là gì? Câu hỏi này xuất hiện ngày càng nhiều khi chị em tìm hiểu kỹ thuật làm đẹp môi hiện đại.',
                'is_featured' => true,
                'content' => '<p>Phun môi nano là kỹ thuật phun môi sử dụng đầu kim siêu nhỏ, tạo màu tự nhiên và giảm đau so với phương pháp truyền thống. Bài viết tổng hợp ưu điểm, quy trình và lưu ý sau khi làm.</p><h2>Ưu điểm nổi bật</h2><ul><li>Màu môi tự nhiên, không bị bệt</li><li>Thời gian làm nhanh, ít sưng</li><li>Phù hợp nhiều tone da</li></ul>',
            ],
            [
                'category' => 'huong-nghiep',
                'slug' => 'lo-trinh-hoc-phun-xam',
                'title' => 'Lộ Trình Học Phun Xăm Toàn Diện Từ Cơ Bản Đến Chuyên Nghiệp',
                'excerpt' => 'Lộ trình học phun xăm từ cơ bản đến chuyên nghiệp không phải một đường thẳng — cần lộ trình rõ ràng cho từng mục tiêu.',
                'content' => '<p>Lộ trình chuẩn gồm: nền tảng lý thuyết da và màu sắc, thực hành trên da giả, thực hành có giám sát và luyện tập sau khóa 2–4 tháng trước khi nhận khách trả phí.</p>',
            ],
            [
                'category' => 'huong-nghiep',
                'slug' => 'sai-lam-khi-moi-hoc-phun-xam',
                'title' => 'Những Sai Lầm Khi Mới Học Phun Xăm Cần Biết Để Tránh Mất Tiền Oan',
                'excerpt' => 'Sai lầm khi mới học phun xăm thường không phải do thiếu năng khiếu mà do thiếu định hướng và luyện tập đúng cách.',
                'content' => '<p>Chọn khóa học chỉ vì giá rẻ, bỏ qua luyện tập sau khóa, nhận khách quá sớm là ba sai lầm phổ biến nhất gây tốn kém thời gian và tiền bạc.</p>',
            ],
            [
                'category' => 'huong-nghiep',
                'slug' => 'nghe-phun-xam-co-tuong-lai-khong',
                'title' => 'Nghề Phun Xăm Có Tương Lai Không? Bí Quyết Cạnh Tranh Cho Người Mới',
                'excerpt' => 'Nghề phun xăm có tương lai không? Câu hỏi này thường đến từ hai lo lắng: thị trường đã bão hòa và lo ngại bị thay thế.',
                'content' => '<p>Nhu cầu làm đẹp vẫn tăng trưởng ổn định. Người mới cạnh tranh bằng tay nghề vững, dịch vụ tận tâm và xây dựng uy tín từ khách đầu tiên.</p>',
            ],
            [
                'category' => 'huong-nghiep',
                'slug' => 'nhan-vien-van-phong-nen-hoc-them-nghe-gi',
                'title' => 'Nhân Viên Văn Phòng Nên Học Thêm Nghề Gì? Xu Hướng Nghề Tay Trái 2026',
                'excerpt' => 'Nhân viên văn phòng nên học thêm nghề gì khi chỉ có buổi tối và cuối tuần? Phun xăm và spa là hai hướng phổ biến nhất.',
                'content' => '<p>Nghề tay trái lý tưởng cho dân văn phòng cần lịch linh hoạt, vốn đầu tư ban đầu hợp lý và có thể bắt đầu nhận khách theo hẹn ngoài giờ hành chính.</p>',
            ],
            [
                'category' => 'huong-nghiep',
                'slug' => 'nghe-tay-trai-cho-me-bim-sua',
                'title' => 'Nghề Tay Trái Cho Mẹ Bỉm Sữa: Có Nên Học Phun Xăm Không?',
                'excerpt' => 'Nghề tay trái cho mẹ bỉm sữa cần đáp ứng lịch linh hoạt và có thể làm tại nhà khi tay nghề đủ vững.',
                'content' => '<p>Phun xăm phù hợp mẹ bỉm nếu có người hỗ trợ trông con trong giờ học và luyện tập. Nhận khách theo hẹn từng ca giúp chủ động thời gian.</p>',
            ],
            [
                'category' => 'tin-tuc-noi-bat',
                'slug' => 'giai-ma-phun-moi-collagen',
                'title' => 'Giải Mã Phun Môi Collagen Màu Nào Đẹp Và Hot Nhất Hiện Nay',
                'excerpt' => 'Phun môi collagen đang là xu hướng làm đẹp được nhiều chị em ưa chuộng nhờ màu tự nhiên và độ bền màu.',
                'content' => '<p>Tông hồng cam nhạt, hồng đất và cam đào là những màu collagen được chọn nhiều nhất. Màu phù hợp phụ thuộc tone da và sắc tố môi ban đầu.</p>',
            ],
            [
                'category' => 'tin-tuc-noi-bat',
                'slug' => 'phun-xam-phong-thuy-cai-van',
                'title' => 'Chuyên Đề: Phun Xăm Phong Thủy Cải Vận Diện Tướng',
                'excerpt' => 'Kỹ thuật phun xăm kết hợp phong thủy giúp cải thiện vận may và thẩm mỹ — xu hướng được nhiều khách hàng quan tâm.',
                'content' => '<p>Phun lông mày và môi theo ngũ hành, tướng mạo giúp gương mặt hài hòa hơn. Cần chuyên gia am hiểu cả kỹ thuật lẫn tư vấn phong thủy.</p>',
            ],
            [
                'category' => 'kien-thuc',
                'slug' => 'hoc-phun-xam-online-co-hieu-qua-khong',
                'title' => 'Học Phun Xăm Online Có Hiệu Quả Không? Ưu Nhược Điểm Thực Tế',
                'excerpt' => 'Học phun xăm online phù hợp cho lý thuyết và ôn tập, nhưng thực hành tay nghề vẫn cần được kèm sát trực tiếp.',
                'content' => '<p>Kết hợp học online lý thuyết và offline thực hành là lộ trình hiệu quả nhất cho người bận rộn muốn vào nghề bài bản.</p>',
            ],
        ];

        foreach ($posts as $index => $data) {
            Post::create([
                'post_category_id' => $categories[$data['category']]->id,
                'title' => $data['title'],
                'slug' => $data['slug'],
                'excerpt' => $data['excerpt'],
                'content' => $data['content'],
                'author_name' => 'Học Viện Bông Nhài Trắng',
                'is_published' => true,
                'is_featured' => $data['is_featured'] ?? false,
                'published_at' => now()->subDays($index),
            ]);
        }
    }

    private function phuNuNenHocNgheGiContent(): string
    {
        return <<<'HTML'
<p>Phụ nữ nên học nghề gì là câu hỏi không có một đáp án chung. Vì hoàn cảnh của mỗi người khác nhau: có người đang đi làm văn phòng muốn thêm nghề tay trái, có người đang nuôi con nhỏ cần lịch học linh hoạt, có người vừa ra trường chưa tìm được hướng rõ ràng.</p>

<h2>Tiêu chí thực tế khi chọn nghề</h2>
<ul>
<li><strong>Lịch học và làm việc linh hoạt</strong> — phù hợp người đi làm hoặc mẹ bỉm</li>
<li><strong>Vốn đầu tư ban đầu hợp lý</strong> — có thể bắt đầu nhỏ, mở rộng dần</li>
<li><strong>Thời gian ra nghề chấp nhận được</strong> — không quá dài nhưng vẫn đủ vững tay nghề</li>
<li><strong>Phát triển lâu dài</strong> — không dễ bị thay thế bởi xu hướng ngắn hạn</li>
</ul>

<h2>So sánh: Phun xăm, Nail, Spa</h2>
<table>
<thead><tr><th>Tiêu chí</th><th>Phun xăm</th><th>Nail</th><th>Spa / Chăm sóc da</th></tr></thead>
<tbody>
<tr><td>Lịch làm việc</td><td>Rất linh hoạt, nhận khách theo hẹn</td><td>Ít linh hoạt hơn</td><td>Cần không gian cố định</td></tr>
<tr><td>Vốn ban đầu</td><td>Tương đối thấp</td><td>Thấp</td><td>Cao hơn</td></tr>
<tr><td>Thời gian ra nghề</td><td>Vài tháng + luyện tập</td><td>Tương tự</td><td>Lâu hơn</td></tr>
</tbody>
</table>

<h2>Phun xăm phù hợp với nhóm nào?</h2>
<p><strong>Nhân viên văn phòng</strong> — học buổi tối/cuối tuần, nhận khách ngoài giờ hành chính.</p>
<p><strong>Mẹ bỉm sữa</strong> — nhận khách từng ca theo hẹn, có thể làm tại nhà khi tay nghề vững.</p>
<p><strong>Người mới ra trường</strong> — có nhiều thời gian luyện tập, cần định hướng rõ mục tiêu.</p>
<p><strong>Người muốn tự kinh doanh</strong> — bắt đầu nhận khách tại nhà, xây khách quen trước khi thuê mặt bằng.</p>

<blockquote>
<p>“Không phải hỏi nghề nào tốt, mà hỏi nghề nào phù hợp với lịch, vốn và mục tiêu 1–2 năm tới của bạn.”</p>
<cite>— Master Đỗ Thị Thu Hằng</cite>
</blockquote>

<h2>Chuẩn bị trước khi đăng ký học</h2>
<ol>
<li>Xác định mục tiêu: tay trái, mở tiệm hay đi làm tại cơ sở</li>
<li>Tính thời gian luyện tập sau khóa (2–4 tháng)</li>
<li>Hỏi rõ ai trực tiếp dạy và chính sách hỗ trợ sau khóa</li>
</ol>

<p>Liên hệ Học Viện Bông Nhài Trắng qua hotline <strong>0918.068.063</strong> hoặc Zalo để được tư vấn lộ trình phù hợp với hoàn cảnh của bạn.</p>
HTML;
    }
}
