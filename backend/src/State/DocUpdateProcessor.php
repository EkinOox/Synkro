<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\DocUpdateInput;
use App\Dto\DocCreateOutput;
use App\Entity\Doc;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class DocUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = []): DocCreateOutput
    {
        $user = $this->security->getUser();

        $docId = $uriVariables['id'] ?? null;

        $doc = $this->em->getRepository(Doc::class)->find($docId);
        if (!$doc) {
            return new DocCreateOutput(false, null, 'Doc introuvable');
        }

        if ($doc->getAdmin()?->getId() !== $user->getId()) {
            return new DocCreateOutput(false, $doc->getId(), 'Accès refusé');
        }

        if ($data->name !== null) {
            $doc->setName($data->name);
        }
        if ($data->text !== null) {
            $doc->setText($data->text);
        }
        if ($data->password !== null) {
            // Hash le mot de passe avant de le sauvegarder
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data->password);
            $doc->setPassword($hashedPassword);
        }

        $this->em->flush();

        return new DocCreateOutput(true, $doc->getId(), 'Doc modifié avec succès');
    }
}