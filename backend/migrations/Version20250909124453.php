<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250909124453 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE blist (id SERIAL NOT NULL, user_id_id INT DEFAULT NULL, doc_id_id INT DEFAULT NULL, doc_id INT NOT NULL, user_id INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_405CF4349D86650F ON blist (user_id_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_405CF43410ADF301 ON blist (doc_id_id)');
        $this->addSql('CREATE TABLE doc (id SERIAL NOT NULL, text TEXT NOT NULL, admin INT NOT NULL, password TEXT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE "user" (id SERIAL NOT NULL, pseudo VARCHAR(255) NOT NULL, password TEXT NOT NULL, email VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE wlist (id SERIAL NOT NULL, user_id_id INT DEFAULT NULL, doc_id_id INT DEFAULT NULL, doc_id INT NOT NULL, user_id INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_E85CECC69D86650F ON wlist (user_id_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_E85CECC610ADF301 ON wlist (doc_id_id)');
        $this->addSql('ALTER TABLE blist ADD CONSTRAINT FK_405CF4349D86650F FOREIGN KEY (user_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE blist ADD CONSTRAINT FK_405CF43410ADF301 FOREIGN KEY (doc_id_id) REFERENCES doc (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE wlist ADD CONSTRAINT FK_E85CECC69D86650F FOREIGN KEY (user_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE wlist ADD CONSTRAINT FK_E85CECC610ADF301 FOREIGN KEY (doc_id_id) REFERENCES doc (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE blist DROP CONSTRAINT FK_405CF4349D86650F');
        $this->addSql('ALTER TABLE blist DROP CONSTRAINT FK_405CF43410ADF301');
        $this->addSql('ALTER TABLE wlist DROP CONSTRAINT FK_E85CECC69D86650F');
        $this->addSql('ALTER TABLE wlist DROP CONSTRAINT FK_E85CECC610ADF301');
        $this->addSql('DROP TABLE blist');
        $this->addSql('DROP TABLE doc');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('DROP TABLE wlist');
    }
}
