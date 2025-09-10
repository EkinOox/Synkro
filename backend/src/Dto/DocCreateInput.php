<?php
namespace App\Dto;

class DocCreateInput
{
    public string $text;
    public ?string $name = null;
    public ?string $password = null;
}