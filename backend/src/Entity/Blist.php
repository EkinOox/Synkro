<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\BlistRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BlistRepository::class)]
#[ApiResource]
class Blist
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'blists')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Doc::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Doc $doc = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDocId(): ?Doc
    {
        return $this->doc;
    }

    public function setDocId(?Doc $doc): static
    {
        $this->doc = $doc;

        return $this;
    }

    public function getUserId(): ?User
    {
        return $this->user;
    }

    public function setUserId(?User $user): static
    {
        $this->user = $user;

        return $this;
    }
}
