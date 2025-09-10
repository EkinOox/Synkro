<?php
namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Dto\BlistAddInput;
use App\Dto\BlistAddOutput;
use App\State\BlistAddProcessor;

#[ApiResource(
    shortName: 'BlistAdd',
    operations: [
        new Post(
            input: BlistAddInput::class,
            output: BlistAddOutput::class,
            processor: BlistAddProcessor::class,
            security: "is_granted('IS_AUTHENTICATED_FULLY')"
        )
    ]
)]
class BlistAdd
{
}