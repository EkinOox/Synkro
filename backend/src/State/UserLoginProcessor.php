<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\UserLoginInput;
use App\Dto\UserLoginOutput;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserLoginProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager
    ) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = []): UserLoginOutput
    {
        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $data->email]);
        if (!$user || !$this->passwordHasher->isPasswordValid($user, $data->password)) {
            return new UserLoginOutput(false, '', 'Identifiants invalides');
        }

        $token = $this->jwtManager->create($user);

        return new UserLoginOutput(true, $token, 'Connexion réussie');
    }
}