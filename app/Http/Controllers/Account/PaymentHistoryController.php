<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentHistoryController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $payments = Payment::query()
            ->whereHas('order', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with('order:id,code,status')
            ->orderByDesc('received_at')
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'gateway' => $payment->gateway,
                'amount' => (string) $payment->amount,
                'received_at' => $payment->received_at?->toIso8601String(),
                'order' => $payment->order ? [
                    'id' => $payment->order->id,
                    'code' => $payment->order->code,
                    'status' => $payment->order->status->value,
                ] : null,
            ])
            ->all();

        return Inertia::render('account/payments', [
            'payments' => $payments,
        ]);
    }
}
