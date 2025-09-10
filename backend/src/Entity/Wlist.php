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

    #[ORM\Column]
    private ?int $DocId = null;

    #[ORM\Column]
    private ?int $UserId = null;

    #[ORM\ManyToOne(inversedBy: 'wlists')]
    private ?user $userId = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    private ?doc $docId = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDocId(): ?int
    {
        return $this->DocId;
    }

    public function setDocId(int $DocId): static
    {
        $this->DocId = $DocId;

        return $this;
    }

    public function getUserId(): ?int
    {
        return $this->UserId;
    }

    public function setUserId(int $UserId): static
    {
        $this->UserId = $UserId;

        return $this;
    }
}
