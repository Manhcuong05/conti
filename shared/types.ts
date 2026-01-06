import type { VSICLine } from './industryData';
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
export interface CompanyCheckResult {
  status: 'available' | 'duplicate' | 'error';
  message: string;
  details?: {
    name: string;
    taxCode: string;
    address: string;
    status: string;
  }[];
}
export interface CompanyRegistryEntry {
  name: string;
  msnb?: string;
  msdn?: string;
  address?: string;
  status?: string;
  industries?: string[];
}
export type LegalForm = 'tnhh1' | 'tnhh2' | 'co-phan';
export type VATMethod = 'khau-tru' | 'truc-tiep-gtgt' | 'truc-tiep-doanh-so' | 'khong-nop';
export type AssetContribution = 'cash' | 'bank-transfer';

export interface Founder {
  id: string;
  name: string;
  idNumber: string;
  permanentAddress: string;
  contactAddress: string;
  capitalContribution: number;
  ownershipPercentage: number;
}

export interface LegalRepresentative {
  uploadedVNeID: boolean;
  name: string;
  title: string;
  dob: string;
  ethnicity?: string;
  idNumber: string;
  idIssueDate: string;
  idIssuePlace: string;
  permanentAddress: string;
  contactAddress: string;
}

export interface ChiefAccountant {
  name: string;
  dob: string;
  idNumber: string;
  idIssueDate: string;
  idIssuePlace: string;
  address: string;
}

export interface OnboardingData {
  // Step 1: Business Type
  businessType: LegalForm;

  // Step 2: Company Naming
  companyNameVi: string;
  companyNameEn: string;
  abbreviation?: string;

  // Step 3: Contact & Headquarters
  address: string;
  phone: string;
  email: string;
  website?: string;
  fax?: string;

  // Step 4: Business Details
  businessLines: string; // Free text description
  vatMethod: VATMethod;

  // Step 5: Capital & Personnel
  charterCapital: number;
  assetContribution: AssetContribution;
  capitalCompletionDate: string;
  legalRepresentative: LegalRepresentative;
  hasChiefAccountant: boolean;
  chiefAccountant?: ChiefAccountant;

  // Step 6: Founders
  founders: Founder[];

  // Step 7: Package Selection
  selectedPackageId: string;

  // Legacy/Optional fields
  confirmedConditions?: boolean;
  hasLandCertificate?: boolean;
  landCertificateFileName?: string;
}

export type ApplicationStatus = 'pending' | 'processing' | 'approved' | 'rejected';
export interface Application extends OnboardingData {
  id: string; // This will be the referenceNumber
  status: ApplicationStatus;
  submittedAt: number;
}
export interface OnboardingResponse {
  referenceNumber: string;
  message: string;
  application?: Application;
}

// Telegram notification types
export interface TelegramNotificationRequest {
  type: 'consultation' | 'contact';
  email?: string;
  name?: string;
  phone?: string;
  message?: string;
}

export interface TelegramNotificationResponse {
  message: string;
  telegramMessage?: string;
}

// Translation request types
export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

// VNPay payment types
export interface VNPayCreatePaymentRequest {
  amount: number;
  orderInfo: string;
  referenceNumber: string;
}

export interface VNPayCreatePaymentResponse {
  paymentUrl: string;
  referenceNumber: string;
}

export interface VNPayCallbackData {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}
