<?php

$path = __DIR__.'/site.json';

if (! is_readable($path)) {
    throw new RuntimeException('Missing or unreadable config/site.json');
}

/** @var array<string, mixed> */
$config = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

return $config;
