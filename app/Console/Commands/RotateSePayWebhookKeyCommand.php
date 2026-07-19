<?php

namespace App\Console\Commands;

use App\Contracts\Payment\SePayWebhookKeyServiceInterface;
use Illuminate\Console\Command;
use RuntimeException;

class RotateSePayWebhookKeyCommand extends Command
{
    protected $signature = 'sepay:rotate-webhook-key
                            {--show : Hiển thị 4 ký tự cuối của key (không lộ full key)}
                            {--dry-run : Sinh key mới, hiện plaintext một lần, không ghi .env}';

    protected $description = 'Sinh API Key webhook SePay — plaintext chỉ hiện lúc chạy lệnh; .env lưu bản mã hóa';

    public function handle(SePayWebhookKeyServiceInterface $keys): int
    {
        if ($this->option('show')) {
            if (! $keys->isConfigured()) {
                $this->warn('SEPAY_WEBHOOK_API_KEY chưa được cấu hình.');

                return self::FAILURE;
            }

            $suffix = $keys->keySuffix();
            $this->line('Key hiện tại: ****'.$suffix);
            $this->comment('Full key không thể khôi phục từ .env. Nếu quên/mất → chạy lại lệnh rotate (không --dry-run).');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $plain = $keys->rotate(persist: false);
            $this->warn('Dry-run — key mới (CHƯA ghi .env). Copy ngay — sẽ không hiện lại:');
            $this->newLine();
            $this->line('<fg=green>'.$plain.'</>');
            $this->newLine();
            $this->comment('Chạy lại không --dry-run để mã hóa và ghi vào .env.');

            return self::SUCCESS;
        }

        try {
            $plain = $keys->rotate(persist: true);
        } catch (RuntimeException $exception) {
            $this->error($exception->getMessage());
            $this->comment('Tạo file .env trước, rồi chạy lại lệnh này.');

            return self::FAILURE;
        }

        $this->info('Đã mã hóa và ghi SEPAY_WEBHOOK_API_KEY vào .env.');
        $this->warn('Copy API Key dưới đây NGAY — sẽ không hiển thị lại:');
        $this->newLine();
        $this->line('<fg=green>'.$plain.'</>');
        $this->newLine();
        $this->comment('Bước tiếp theo trên SePay Dashboard:');
        $this->line('1. Webhooks → Sửa webhook → Security → API Key');
        $this->line('2. Dán key ở trên (SePay cũng chỉ lưu suffix sau khi tạo)');
        $this->line('3. Chạy: php artisan config:clear');

        return self::SUCCESS;
    }
}
