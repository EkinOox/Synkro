<?php
namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Dto\UserLoginInput;
use App\Dto\UserLoginOutput;
use App\State\UserLoginProcessor;

#[ApiResource(
    shortName: 'UserLogin',
    operations: [
        new Post(
            input: UserLoginInput::class,
            output: UserLoginOutput::class,
            processor: UserLoginProcessor::class,
            security: "is_granted('PUBLIC_ACCESS')"
        )
    ]
)]
class UserLogin
{
}