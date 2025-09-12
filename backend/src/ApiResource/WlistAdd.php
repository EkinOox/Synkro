<?php
namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Dto\BlistAddInput;
use App\Dto\BlistAddOutput;
use App\State\WlistAddProcessor;

#[ApiResource(
    shortName: 'WlistAdd',
    operations: [
        new Post(
            input: BlistAddInput::class,
            output: BlistAddOutput::class,
            processor: WlistAddProcessor::class,
            security: "is_granted('IS_AUTHENTICATED_FULLY')"
        )
    ]
)]
class WlistAdd
{
}