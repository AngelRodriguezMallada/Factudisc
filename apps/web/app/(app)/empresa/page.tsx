import { prisma } from "@facturadiscord/db";
import { CompanyForm } from "./CompanyForm";

export default async function CompanyPage() {
  const company = await prisma.companyProfile.findFirst();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Datos de la empresa</h1>
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
    </div>
  );
}
