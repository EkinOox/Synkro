<?php
namespace App\Dto;

class DocCreateOutput
{
    public function __construct(
        public bool $success,
        public ?int $docId = null,
        public string $message = ''
    ) {}
}