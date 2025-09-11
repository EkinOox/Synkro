<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\BlistAddInput;
use App\Dto\BlistAddOutput;
use App\Entity\Wlist;
use App\Entity\User;
use App\Entity\Doc;
use Doctrine\ORM\EntityManagerInterface;

class WlistAddProcessor implements ProcessorInterface
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

        // Vérifie si le user est déjà dans la wlist du doc
        $existing = $this->em->getRepository(Wlist::class)->findOneBy(['user' => $user, 'doc' => $doc]);
        if ($existing) {
            return new BlistAddOutput(false, 'Utilisateur déjà dans la whitelist');
        }

        $wlist = new Wlist();
        $wlist->setUserId($user);
        $wlist->setDocId($doc);

        $this->em->persist($wlist);
        $this->em->flush();

        return new BlistAddOutput(true, 'Utilisateur ajouté à la whitelist');
    }
}