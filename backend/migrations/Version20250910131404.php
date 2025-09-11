<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250910131404 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE wlist DROP CONSTRAINT fk_e85cecc610adf301');
        $this->addSql('ALTER TABLE wlist DROP CONSTRAINT fk_e85cecc69d86650f');
        $this->addSql('DROP INDEX idx_e85cecc69d86650f');
        $this->addSql('DROP INDEX uniq_e85cecc610adf301');
        $this->addSql('ALTER TABLE wlist DROP user_id_id');
        $this->addSql('ALTER TABLE wlist DROP doc_id_id');
        $this->addSql('ALTER TABLE wlist ADD CONSTRAINT FK_E85CECC6A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE wlist ADD CONSTRAINT FK_E85CECC6895648BC FOREIGN KEY (doc_id) REFERENCES doc (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_E85CECC6A76ED395 ON wlist (user_id)');
        $this->addSql('CREATE INDEX IDX_E85CECC6895648BC ON wlist (doc_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE wlist DROP CONSTRAINT FK_E85CECC6A76ED395');
        $this->addSql('ALTER TABLE wlist DROP CONSTRAINT FK_E85CECC6895648BC');
        $this->addSql('DROP INDEX IDX_E85CECC6A76ED395');
        $this->addSql('DROP INDEX IDX_E85CECC6895648BC');
        $this->addSql('ALTER TABLE wlist ADD user_id_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE wlist ADD doc_id_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE wlist ADD CONSTRAINT fk_e85cecc610adf301 FOREIGN KEY (doc_id_id) REFERENCES doc (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE wlist ADD CONSTRAINT fk_e85cecc69d86650f FOREIGN KEY (user_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_e85cecc69d86650f ON wlist (user_id_id)');
        $this->addSql('CREATE UNIQUE INDEX uniq_e85cecc610adf301 ON wlist (doc_id_id)');
    }
}
