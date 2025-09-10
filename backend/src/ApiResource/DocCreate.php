<?php
namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Dto\DocCreateInput;
use App\Dto\DocCreateOutput;
use App\State\DocCreateProcessor;

#[ApiResource(
    shortName: 'DocCreate',
    operations: [
        new Post(
            input: DocCreateInput::class,
            output: DocCreateOutput::class,
            processor: DocCreateProcessor::class,
            security: "is_granted('IS_AUTHENTICATED_FULLY')"
        )
    ]
)]
class DocCreate
{
}