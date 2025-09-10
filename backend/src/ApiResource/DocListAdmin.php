<?php
namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Dto\DocListAdminOutput;
use App\State\DocListAdminProcessor;

#[ApiResource(
    shortName: 'DocListAdmin',
    operations: [
        new GetCollection(
            output: DocListAdminOutput::class,
            provider: DocListAdminProcessor::class,
            security: "is_granted('IS_AUTHENTICATED_FULLY')"
        )
    ]
)]
class DocListAdmin
{
}