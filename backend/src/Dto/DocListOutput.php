<?php
namespace App\Dto;

class DocListOutput
{
    public function __construct(
        public int $id,
        public ?string $name,
        public ?string $password,
        public int $adminId
    ) {}
}