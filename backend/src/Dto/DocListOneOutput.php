<?php
namespace App\Dto;

class DocListOneOutput
{
    public function __construct(
        public int $id,
        public ?string $name,
        public ?string $text,
        public ?string $password,
        public int $adminId,
        public bool $isBanned,
        public bool $isAllowed
    ) {}
}