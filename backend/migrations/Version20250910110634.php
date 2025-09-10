<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250910110634 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blist DROP CONSTRAINT fk_405cf43410adf301');
        $this->addSql('ALTER TABLE blist DROP CONSTRAINT fk_405cf4349d86650f');
        $this->addSql('DROP INDEX idx_405cf4349d86650f');
        $this->addSql('DROP INDEX uniq_405cf43410adf301');
        $this->addSql('ALTER TABLE blist DROP user_id_id');
        $this->addSql('ALTER TABLE blist DROP doc_id_id');
        $this->addSql('ALTER TABLE blist ADD CONSTRAINT FK_405CF434A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE blist ADD CONSTRAINT FK_405CF434895648BC FOREIGN KEY (doc_id) REFERENCES doc (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_405CF434A76ED395 ON blist (user_id)');
        $this->addSql('CREATE INDEX IDX_405CF434895648BC ON blist (doc_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE blist DROP CONSTRAINT FK_405CF434A76ED395');
        $this->addSql('ALTER TABLE blist DROP CONSTRAINT FK_405CF434895648BC');
        $this->addSql('DROP INDEX IDX_405CF434A76ED395');
        $this->addSql('DROP INDEX IDX_405CF434895648BC');
        $this->addSql('ALTER TABLE blist ADD user_id_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE blist ADD doc_id_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE blist ADD CONSTRAINT fk_405cf43410adf301 FOREIGN KEY (doc_id_id) REFERENCES doc (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE blist ADD CONSTRAINT fk_405cf4349d86650f FOREIGN KEY (user_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_405cf4349d86650f ON blist (user_id_id)');
        $this->addSql('CREATE UNIQUE INDEX uniq_405cf43410adf301 ON blist (doc_id_id)');
    }
}
