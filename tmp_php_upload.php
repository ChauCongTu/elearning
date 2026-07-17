<?php

echo 'upload_tmp_dir='.(ini_get('upload_tmp_dir') ?: '(not set)').PHP_EOL;
echo 'sys_temp_dir='.(sys_get_temp_dir()).PHP_EOL;
echo 'file_uploads='.ini_get('file_uploads').PHP_EOL;
echo 'recommended='.str_replace('\\', '/', __DIR__.'/storage/framework/tmp').PHP_EOL;
