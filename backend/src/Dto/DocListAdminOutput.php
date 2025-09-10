<?php
namespace App\Dto;

class DocListAdminOutput
{
    public function __construct(
        public int $id,
        public ?string $name,
        public ?string $password
    ) {}
}