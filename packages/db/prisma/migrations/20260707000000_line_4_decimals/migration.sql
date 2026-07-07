-- AlterTable: permitir hasta 4 decimales en cantidad y precio unitario
ALTER TABLE `DocumentLine`
    MODIFY `quantity` DECIMAL(12, 4) NOT NULL,
    MODIFY `unitPrice` DECIMAL(14, 4) NOT NULL;
