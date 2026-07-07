import "dotenv/config";
import { prisma } from "./index";

async function main() {
  const superAdminDiscordId =
    process.env.SUPER_ADMIN_DISCORD_ID || process.env.OWNER_DISCORD_ID;

  if (!superAdminDiscordId) {
    console.error(
      "Falta SUPER_ADMIN_DISCORD_ID (o OWNER_DISCORD_ID) en el .env. " +
        "Es el ID de Discord del super-admin que crea las cuentas."
    );
    process.exit(1);
  }

  // Reutiliza la cuenta principal creada por la migración (la de menor id que
  // aún no tiene miembros); si no hay ninguna, crea una.
  let account = await prisma.account.findFirst({
    where: { members: { none: {} } },
    orderBy: { id: "asc" },
  });
  if (!account) {
    account = await prisma.account.create({ data: { name: "Cuenta principal" } });
    console.log(`Cuenta principal creada (id ${account.id}).`);
  } else {
    console.log(`Usando la cuenta principal existente (id ${account.id}).`);
  }

  // Super-admin como OWNER de la cuenta principal.
  const user = await prisma.user.upsert({
    where: { discordId: superAdminDiscordId },
    update: {},
    create: { discordId: superAdminDiscordId, username: "super-admin" },
  });

  await prisma.accountMember.upsert({
    where: { accountId_userId: { accountId: account.id, userId: user.id } },
    update: { role: "OWNER" },
    create: { accountId: account.id, userId: user.id, role: "OWNER" },
  });
  console.log(`Super-admin ${superAdminDiscordId} asignado como OWNER de la cuenta ${account.id}.`);

  // Perfil de empresa de ejemplo si la cuenta aún no tiene.
  const existingCompany = await prisma.companyProfile.findUnique({
    where: { accountId: account.id },
  });
  if (!existingCompany) {
    await prisma.companyProfile.create({
      data: {
        accountId: account.id,
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
    console.log("Ya existe un perfil de empresa para la cuenta, no se ha modificado.");
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
