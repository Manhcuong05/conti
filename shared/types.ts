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
export interface OnboardingData {
  businessType: 'new' | 'existing';
  companyName: string;
  fullName?: string;
  fullNameEn?: string;
  legalForm: LegalForm;
  province?: string;
  addressDetail?: string;
  contactName: string;
  phone: string;
  email: string;
  selectedPackageId: string;
  businessLines: VSICLine[];
  primaryLineCode: string;
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
