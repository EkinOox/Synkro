<?php
namespace App\Dto;

class UserLoginOutput
{
    public function __construct(
        public bool $success,
        public string $token = '',
        public string $message = ''
    ) {}
}