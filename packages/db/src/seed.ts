import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./index";

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "change-me";

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, passwordHash } });
    console.log(`Usuario admin creado: ${username}`);
  } else {
    console.log(`El usuario ${username} ya existe, no se ha modificado.`);
  }

  const existingCompany = await prisma.companyProfile.findFirst();
  if (!existingCompany) {
    await prisma.companyProfile.create({
      data: {
        name: "Mi Empresa S.L.",
        taxId: "B00000000",
        address: "Calle Ejemplo 1, 28000 Madrid",
        email: "facturacion@miempresa.com",
        phone: "+34 600 000 000",
        iban: "ES00 0000 0000 0000 0000 0000",
        defaultTaxRate: 21,
      },
    });
    console.log("Perfil de empresa de ejemplo creado. Edítalo en /empresa.");
  } else {
    console.log("Ya existe un perfil de empresa, no se ha modificado.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
