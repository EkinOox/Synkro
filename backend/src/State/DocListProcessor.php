<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\DocListOutput;
use App\Entity\Doc;
use Doctrine\ORM\EntityManagerInterface;

class DocListProcessor implements ProviderInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): iterable
    {
        $docs = $this->em->getRepository(Doc::class)->findAll();
        foreach ($docs as $doc) {
            yield new DocListOutput(
                $doc->getId(),
                $doc->getName(),
                $doc->getPassword(),
                $doc->getAdmin()?->getId()
            );
        }
    }
}