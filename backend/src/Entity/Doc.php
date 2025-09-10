<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Patch;
use App\Dto\DocCreateOutput;
use App\Dto\DocUpdateInput;
use App\Repository\DocRepository;
use App\State\DocUpdateProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DocRepository::class)]
#[ApiResource(
    operations: [
        new Patch(
            input: DocUpdateInput::class,
            output: DocCreateOutput::class,
            processor: DocUpdateProcessor::class,
            security: "is_granted('IS_AUTHENTICATED_FULLY')"
        ),
    ]
)]
class Doc
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $text = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $password = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'docs')]
    #[ORM\JoinColumn(name: 'admin', referencedColumnName: 'id', nullable: false)]
    private ?User $admin = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $name = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getText(): ?string
    {
        return $this->text;
    }

    public function setText(string $text): static
    {
        $this->text = $text;

        return $this;
    }

    public function getAdmin(): ?User
    {
        return $this->admin;
    }

    public function setAdmin(?User $admin): static
    {
        $this->admin = $admin;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }
}
