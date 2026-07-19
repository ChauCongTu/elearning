<?php

namespace App\Http\Controllers\Webhook;

use App\Contracts\Payment\SePayServiceInterface;
use App\Exceptions\Payment\WebhookProcessingException;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SePayWebhookController extends Controller
{
    public function __construct(
        private SePayServiceInterface $sepay,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        if (! $this->sepay->verifyWebhookAuthorization($request->header('Authorization'))) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        try {
            $result = $this->sepay->processWebhook($request->all());

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (WebhookProcessingException $exception) {
            Log::warning('SePay webhook rejected', [
                'message' => $exception->getMessage(),
                'payload' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], $exception->httpStatus);
        } catch (\Throwable $exception) {
            Log::error('SePay webhook failed', [
                'message' => $exception->getMessage(),
                'payload' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal error',
            ], 500);
        }
    }
}
