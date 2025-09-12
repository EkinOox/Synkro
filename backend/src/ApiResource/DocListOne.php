<?php
namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\Dto\DocListOneOutput;
use App\State\DocListOneProcessor;

#[ApiResource(
    shortName: 'DocListOne',
    operations: [
        new Get(
            uriTemplate: '/doc_list_one/{id}',
            output: DocListOneOutput::class,
            provider: DocListOneProcessor::class,
            security: "is_granted('IS_AUTHENTICATED_FULLY')"
        )
    ]
)]
class DocListOne
{
}