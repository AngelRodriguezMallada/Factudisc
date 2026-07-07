import { prisma } from "@facturadiscord/db";
import { CompanyForm } from "./CompanyForm";
import { PaymentMethodsManager } from "./PaymentMethodsManager";
import { requireAccount } from "@/lib/auth";

export default async function CompanyPage() {
  const { accountId, role } = await requireAccount();

  const [company, paymentMethods] = await Promise.all([
    prisma.companyProfile.findUnique({ where: { accountId } }),
    prisma.paymentMethod.findMany({ where: { accountId }, orderBy: { position: "asc" } }),
  ]);

  const isOwner = role === "OWNER";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Datos de la empresa</h1>

      {!isOwner ? (
        <p className="text-sm text-slate-500">
          Solo el propietario de la cuenta puede editar estos datos.
        </p>
      ) : null}

      <div className="card p-6">
        <CompanyForm
          defaults={{
            name: company?.name,
            taxId: company?.taxId,
            address: company?.address,
            email: company?.email,
            phone: company?.phone,
            iban: company?.iban,
            logoUrl: company?.logoUrl,
            defaultTaxRate: company ? Number(company.defaultTaxRate) : 21,
            notes: company?.notes,
          }}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink mb-3">Métodos de pago</h2>
        <div className="card p-6">
          <PaymentMethodsManager
            methods={paymentMethods.map((m) => ({
              id: m.id,
              type: m.type,
              label: m.label,
              details: m.details,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
