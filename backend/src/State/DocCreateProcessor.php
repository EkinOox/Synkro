<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\DocCreateInput;
use App\Dto\DocCreateOutput;
use App\Entity\Doc;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class DocCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security
    ) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = []): DocCreateOutput
    {
        $user = $this->security->getUser();
        if (!$user) {
            return new DocCreateOutput(false, null, 'Utilisateur non authentifié');
        }

        $doc = new Doc();
        $doc->setText($data->text);
        $doc->setName($data->name);
        $doc->setPassword($data->password);
        $doc->setAdmin($user);

        $this->em->persist($doc);
        $this->em->flush();

        return new DocCreateOutput(true, $doc->getId(), 'Doc créé avec succès');
    }
}