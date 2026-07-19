<?php

namespace App\Console\Commands;

use App\Contracts\Payment\OrderServiceInterface;
use Illuminate\Console\Command;

class ExpirePendingOrdersCommand extends Command
{
    protected $signature = 'orders:expire-pending';

    protected $description = 'Đánh dấu các đơn pending đã quá hạn thanh toán là expired';

    public function handle(OrderServiceInterface $orders): int
    {
        $count = $orders->expirePendingOrders();

        $this->info("Đã hết hạn {$count} đơn pending.");

        return self::SUCCESS;
    }
}
