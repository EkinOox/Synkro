<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\BlistAddInput;
use App\Dto\BlistAddOutput;
use App\Entity\Blist;
use App\Entity\User;
use App\Entity\Doc;
use Doctrine\ORM\EntityManagerInterface;

class BlistAddProcessor implements ProcessorInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = []): BlistAddOutput
    {
        $user = $this->em->getRepository(User::class)->findOneBy(['pseudo' => $data->userPseudo]);
        if (!$user) {
            return new BlistAddOutput(false, 'Utilisateur non trouvé');
        }

        $doc = $this->em->getRepository(Doc::class)->find($data->docId);
        if (!$doc) {
            return new BlistAddOutput(false, 'Doc non trouvé');
        }

        // Vérifie si le user est déjà dans la blist du doc
        $existing = $this->em->getRepository(Blist::class)->findOneBy(['user' => $user, 'doc' => $doc]);
        if ($existing) {
            return new BlistAddOutput(false, 'Utilisateur déjà dans la blacklist');
        }

        $blist = new Blist();
        $blist->setUserId($user);
        $blist->setDocId($doc);

        $this->em->persist($blist);
        $this->em->flush();

        return new BlistAddOutput(true, 'Utilisateur ajouté à la blacklist');
    }
}