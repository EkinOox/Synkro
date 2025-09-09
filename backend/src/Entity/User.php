<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ApiResource]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $pseudo = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    /**
     * @var Collection<int, Blist>
     */
    #[ORM\OneToMany(targetEntity: Blist::class, mappedBy: 'userId')]
    private Collection $blists;

    /**
     * @var Collection<int, Wlist>
     */
    #[ORM\OneToMany(targetEntity: Wlist::class, mappedBy: 'userId')]
    private Collection $wlists;

    public function __construct()
    {
        $this->blists = new ArrayCollection();
        $this->wlists = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): static
    {
        $this->pseudo = $pseudo;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * @return Collection<int, Blist>
     */
    public function getBlists(): Collection
    {
        return $this->blists;
    }

    public function addBlist(Blist $blist): static
    {
        if (!$this->blists->contains($blist)) {
            $this->blists->add($blist);
            $blist->setUserId($this);
        }

        return $this;
    }

    public function removeBlist(Blist $blist): static
    {
        if ($this->blists->removeElement($blist)) {
            // set the owning side to null (unless already changed)
            if ($blist->getUserId() === $this) {
                $blist->setUserId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Wlist>
     */
    public function getWlists(): Collection
    {
        return $this->wlists;
    }

    public function addWlist(Wlist $wlist): static
    {
        if (!$this->wlists->contains($wlist)) {
            $this->wlists->add($wlist);
            $wlist->setUserId($this);
        }

        return $this;
    }

    public function removeWlist(Wlist $wlist): static
    {
        if ($this->wlists->removeElement($wlist)) {
            // set the owning side to null (unless already changed)
            if ($wlist->getUserId() === $this) {
                $wlist->setUserId(null);
            }
        }

        return $this;
    }
}
