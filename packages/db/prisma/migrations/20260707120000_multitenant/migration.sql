-- =====================================================================
-- Multi-inquilino: cuentas, miembros, enlaces de Discord, métodos de pago.
-- Conserva los datos actuales moviéndolos a una "cuenta principal".
-- =====================================================================

-- 1) Tabla de cuentas
CREATE TABLE `Account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Cuenta principal a la que se asignan los datos existentes.
INSERT INTO `Account` (`name`, `createdAt`, `updatedAt`)
SELECT COALESCE((SELECT `name` FROM `CompanyProfile` LIMIT 1), 'Cuenta principal'), NOW(3), NOW(3);

-- 2) Nuevas tablas
CREATE TABLE `AccountMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `role` ENUM('OWNER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AccountMember_accountId_userId_key`(`accountId`, `userId`),
    INDEX `AccountMember_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AccountDiscordLink` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `guildName` VARCHAR(191) NULL,
    `linkedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AccountDiscordLink_guildId_key`(`guildId`),
    INDEX `AccountDiscordLink_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PaymentMethod` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `type` ENUM('TRANSFER', 'PAYPAL', 'BIZUM', 'CASH', 'CARD', 'OTHER') NOT NULL,
    `label` VARCHAR(191) NULL,
    `details` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentMethod_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `DocumentPaymentOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `documentId` INTEGER NOT NULL,
    `type` ENUM('TRANSFER', 'PAYPAL', 'BIZUM', 'CASH', 'CARD', 'OTHER') NOT NULL,
    `label` VARCHAR(191) NULL,
    `details` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `DocumentPaymentOption_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3) CompanyProfile -> accountId
ALTER TABLE `CompanyProfile` ADD COLUMN `accountId` INTEGER NULL;
UPDATE `CompanyProfile` SET `accountId` = (SELECT `id` FROM `Account` ORDER BY `id` ASC LIMIT 1) WHERE `accountId` IS NULL;
ALTER TABLE `CompanyProfile` MODIFY COLUMN `accountId` INTEGER NOT NULL;
CREATE UNIQUE INDEX `CompanyProfile_accountId_key` ON `CompanyProfile`(`accountId`);

-- 4) Client -> accountId
ALTER TABLE `Client` ADD COLUMN `accountId` INTEGER NULL;
UPDATE `Client` SET `accountId` = (SELECT `id` FROM `Account` ORDER BY `id` ASC LIMIT 1) WHERE `accountId` IS NULL;
ALTER TABLE `Client` MODIFY COLUMN `accountId` INTEGER NOT NULL;
CREATE INDEX `Client_accountId_idx` ON `Client`(`accountId`);

-- 5) Document -> accountId + número único por cuenta
ALTER TABLE `Document` ADD COLUMN `accountId` INTEGER NULL;
UPDATE `Document` SET `accountId` = (SELECT `id` FROM `Account` ORDER BY `id` ASC LIMIT 1) WHERE `accountId` IS NULL;
ALTER TABLE `Document` MODIFY COLUMN `accountId` INTEGER NOT NULL;
DROP INDEX `Document_number_key` ON `Document`;
CREATE UNIQUE INDEX `Document_accountId_number_key` ON `Document`(`accountId`, `number`);
CREATE INDEX `Document_accountId_idx` ON `Document`(`accountId`);

-- 6) DocumentCounter -> accountId + unicidad por cuenta
ALTER TABLE `DocumentCounter` ADD COLUMN `accountId` INTEGER NULL;
UPDATE `DocumentCounter` SET `accountId` = (SELECT `id` FROM `Account` ORDER BY `id` ASC LIMIT 1) WHERE `accountId` IS NULL;
ALTER TABLE `DocumentCounter` MODIFY COLUMN `accountId` INTEGER NOT NULL;
DROP INDEX `DocumentCounter_type_year_key` ON `DocumentCounter`;
CREATE UNIQUE INDEX `DocumentCounter_accountId_type_year_key` ON `DocumentCounter`(`accountId`, `type`, `year`);

-- 7) User: pasa de usuario/contraseña a identidad de Discord (OAuth)
DELETE FROM `User`;
DROP INDEX `User_username_key` ON `User`;
ALTER TABLE `User` DROP COLUMN `passwordHash`;
ALTER TABLE `User` ADD COLUMN `discordId` VARCHAR(191) NOT NULL, ADD COLUMN `avatar` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `User_discordId_key` ON `User`(`discordId`);

-- 8) Antiguo allowlist reemplazado por AccountMember
DROP TABLE `AllowedDiscordUser`;

-- 9) Claves foráneas
ALTER TABLE `CompanyProfile` ADD CONSTRAINT `CompanyProfile_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Client` ADD CONSTRAINT `Client_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Document` ADD CONSTRAINT `Document_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `DocumentCounter` ADD CONSTRAINT `DocumentCounter_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AccountMember` ADD CONSTRAINT `AccountMember_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AccountMember` ADD CONSTRAINT `AccountMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AccountDiscordLink` ADD CONSTRAINT `AccountDiscordLink_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `PaymentMethod` ADD CONSTRAINT `PaymentMethod_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `DocumentPaymentOption` ADD CONSTRAINT `DocumentPaymentOption_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
