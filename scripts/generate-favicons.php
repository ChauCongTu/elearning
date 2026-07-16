<?php

$src = __DIR__.'/../public/images/logo-hoc-vien-bong-nhai-trang.png';
$img = imagecreatefrompng($src);

if (! $img) {
    fwrite(STDERR, "Failed to load source image\n");
    exit(1);
}

function resizeSquare($src, int $size)
{
    $sw = imagesx($src);
    $sh = imagesy($src);
    $scale = $size / max($sw, $sh);
    $nw = (int) round($sw * $scale);
    $nh = (int) round($sh * $scale);
    $dst = imagecreatetruecolor($size, $size);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    $trans = imagecolorallocatealpha($dst, 0, 0, 0, 127);
    imagefill($dst, 0, 0, $trans);
    imagecopyresampled(
        $dst,
        $src,
        (int) (($size - $nw) / 2),
        (int) (($size - $nh) / 2),
        0,
        0,
        $nw,
        $nh,
        $sw,
        $sh
    );

    return $dst;
}

$outDir = __DIR__.'/../public';

foreach ([16 => 'favicon-16.png', 32 => 'favicon-32.png', 180 => 'apple-touch-icon.png'] as $size => $name) {
    $resized = resizeSquare($img, $size);
    imagepng($resized, "{$outDir}/{$name}");
    imagedestroy($resized);
}

copy("{$outDir}/favicon-32.png", "{$outDir}/favicon.png");

// Minimal ICO with embedded 32x32 PNG (supported by modern browsers)
$pngData = file_get_contents("{$outDir}/favicon-32.png");
$pngLen = strlen($pngData);
$header = pack('vvv', 0, 1, 1);
$entry = pack('CCCCvvVV', 32, 32, 0, 0, 1, 32, $pngLen, 22);
file_put_contents("{$outDir}/favicon.ico", $header.$entry.$pngData);

echo "Generated favicons in public/\n";
