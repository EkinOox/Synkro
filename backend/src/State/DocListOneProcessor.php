<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\DocListOneOutput;
use App\Entity\Doc;
use App\Entity\Blist;
use App\Entity\Wlist;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class DocListOneProcessor implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?DocListOneOutput
    {
        $user = $this->security->getUser();
        $userPseudo = $user ? $user->getPseudo() : null;

        $docId = $uriVariables['id'] ?? null;
        if (!$docId) {
            return null;
        }
        $doc = $this->em->getRepository(Doc::class)->find($docId);
        if (!$doc) {
            return null;
        }

        $isBanned = false;
        $isAllowed = false;
        $textdoc = null;

        foreach ($this->em->getRepository(Blist::class)->findBy(['doc' => $doc]) as $blist) {
            $blistUser = $blist->getUserId();
            if ($blistUser && $userPseudo && $blistUser->getPseudo() === $userPseudo) {
                $isBanned = true;
                break;
            }
        }

        foreach ($this->em->getRepository(Wlist::class)->findBy(['doc' => $doc]) as $wlist) {
            $wlistUser = $wlist->getUserId();
            if ($wlistUser && $userPseudo && $wlistUser->getPseudo() === $userPseudo) {
                $isAllowed = true;
                break;
            }
        }
        if(!$isBanned){
            $textdoc = $doc->getText();
        }
        return new DocListOneOutput(
            $doc->getId(),
            $doc->getName(),
            $textdoc,
            $doc->getPassword(),
            $doc->getAdmin()?->getId(),
            $isBanned,
            $isAllowed
        );
    }
}