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

    #[ORM\Column]
    private ?int $DocId = null;

    #[ORM\Column]
    private ?int $UserId = null;

    #[ORM\ManyToOne(inversedBy: 'blists')]
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
