<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\WlistRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: WlistRepository::class)]
#[ApiResource]
class Wlist
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'wlists')]
    #[ORM\JoinColumn(nullable: false)]
    private ?user $user = null;

    #[ORM\ManyToOne(targetEntity: Doc::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?doc $doc = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDocId(): ?Doc
    {
        return $this->doc;
    }

    public function setDocId(?doc $doc): static
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
