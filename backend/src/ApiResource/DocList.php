<?php
namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Dto\DocListOutput;
use App\State\DocListProcessor;

#[ApiResource(
    shortName: 'DocList',
    operations: [
        new GetCollection(
            output: DocListOutput::class,
            provider: DocListProcessor::class,
            security: "is_granted('IS_AUTHENTICATED_FULLY')"
        )
    ]
)]
class DocList
{
}