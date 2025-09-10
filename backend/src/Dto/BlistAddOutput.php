<?php
namespace App\Dto;

class BlistAddOutput
{
    public function __construct(
        public bool $success,
        public string $message = ''
    ) {}
}