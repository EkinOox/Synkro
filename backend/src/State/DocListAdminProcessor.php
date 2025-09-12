<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\DocListAdminOutput;
use App\Entity\Doc;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class DocListAdminProcessor implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): iterable
    {
        $user = $this->security->getUser();
        if (!$user) {
            return [];
        }

        // Retourner TOUTES les rooms pour tous les utilisateurs
        $docs = $this->em->getRepository(Doc::class)->findAll();
        foreach ($docs as $doc) {
            yield new DocListAdminOutput(
                $doc->getId(),
                $doc->getName(),
                $doc->getPassword()
            );
        }
    }
}