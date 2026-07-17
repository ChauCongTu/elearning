<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    protected function prepareForValidation(): void
    {
        $avatar = $this->file('avatar');

        if ($avatar instanceof UploadedFile && ! $avatar->isValid() && $avatar->getError() === UPLOAD_ERR_NO_FILE) {
            $this->files->remove('avatar');
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->profileRules($this->user()->id);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'avatar.image' => 'Ảnh đại diện phải là file ảnh (JPG, PNG, WebP, GIF).',
            'avatar.max' => 'Ảnh đại diện không được lớn hơn 2MB.',
            'avatar.uploaded' => 'Không thể tải ảnh lên. Hãy chọn file ảnh khác và thử lại.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->hasFile('avatar')) {
                return;
            }

            $file = $this->file('avatar');

            if ($file instanceof UploadedFile && ! $file->isValid()) {
                $validator->errors()->add('avatar', $this->uploadErrorMessage($file->getError()));
            }
        });
    }

    private function uploadErrorMessage(int $errorCode): string
    {
        return match ($errorCode) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Ảnh vượt quá giới hạn dung lượng. Hãy chọn file nhỏ hơn 1,5MB, hoặc tăng post_max_size trong php.ini (khuyến nghị ≥ 8M).',
            UPLOAD_ERR_PARTIAL => 'Ảnh chỉ được tải lên một phần. Vui lòng thử lại.',
            UPLOAD_ERR_NO_FILE => 'Chưa chọn file ảnh.',
            UPLOAD_ERR_NO_TMP_DIR => 'PHP chưa có thư mục tạm để lưu file upload (upload_tmp_dir). Mở php.ini (herd ini), thêm dòng: upload_tmp_dir = "'.str_replace('\\', '/', storage_path('framework/tmp')).'" rồi restart Herd.',
            UPLOAD_ERR_CANT_WRITE, UPLOAD_ERR_EXTENSION => 'Máy chủ không ghi được file tạm. Kiểm tra quyền thư mục storage/framework/tmp.',
            default => 'Không thể tải ảnh lên. Hãy chọn file ảnh khác và thử lại.',
        };
    }
}
