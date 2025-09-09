<?php
namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Dto\UserRegisterInput;
use App\State\UserRegisterProcessor;

#[ApiResource(
    shortName: 'UserRegister',
    operations: [
        new Post(
            input: UserRegisterInput::class,
            output: null,
            processor: UserRegisterProcessor::class,
            security: "is_granted('PUBLIC_ACCESS')"
        )
    ]
)]
class UserRegister
{
}