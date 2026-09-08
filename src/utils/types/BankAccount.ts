export interface BankAccount {
  id: string;
  code: string;
  entityType: "employee";
  entityId: string;
  accountNumber: string;
  accountName: string | null;
  bankName: string;
  branchName: string | null;
  iban: string | null;
  swiftCode: string | null;
  countryCode: string;
  currencyCode: string;
  isPrimary: boolean;
  isActive: boolean;
  notes: string | null;
}
