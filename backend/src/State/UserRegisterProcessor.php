<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\UserRegisterInput;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserRegisterProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        // Vérification si l'utilisateur existe déjà
        $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $data->email]);
        if ($existing) {
            throw new BadRequestHttpException('Un utilisateur avec cet email existe déjà.');
        }

        $user = new User();
        $user->setPseudo($data->pseudo);
        $user->setEmail($data->email);
        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $data->password)
        );

        $this->em->persist($user);
        $this->em->flush();

        // Retourne un message de succès
        return [
            'success' => true,
            'message' => 'Compte créé avec succès.'
        ];
    }
}