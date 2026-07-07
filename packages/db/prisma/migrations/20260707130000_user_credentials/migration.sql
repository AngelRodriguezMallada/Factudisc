-- Credenciales opcionales usuario/contraseña para entrar sin Discord.
ALTER TABLE `User`
    ADD COLUMN `loginUsername` VARCHAR(191) NULL,
    ADD COLUMN `passwordHash` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `User_loginUsername_key` ON `User`(`loginUsername`);
