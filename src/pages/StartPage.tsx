import React, { useState, useEffect } from 'react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Rocket,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Building2,
  Check,
  FileText,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  MapPin,
  Mail,
  Phone,
  Edit3,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "@/lib/api-client";
import { CompanyNameGenerator } from "@/components/CompanyNameGenerator";
import { AddressForm } from "@/components/AddressForm";
import { BusinessLineSelector } from "@/components/BusinessLineSelector";
import type { CompanyCheckResult, OnboardingData, OnboardingResponse, LegalForm } from "@shared/types";
import { CompanyRegistrySearch } from "@/components/CompanyRegistrySearch";
import type { VSICLine } from "@shared/industryData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatting";
type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'success';
const PACKAGE_OPTIONS = [
  {
    id: 'co-ban',
    name: 'Gói Cơ bản',
    price: 4200000,
    desc: 'Phù hợp khởi đầu tinh gọn',
    features: ['Giấy phép kinh doanh', 'Con dấu pháp nhân', 'Báo cáo thành lập']
  },
  {
    id: 'vuon-cao',
    name: 'Gói Vươn cao',
    price: 5000000,
    desc: 'Đầy đủ thủ tục pháp lý & thuế',
    isPopular: true,
    features: ['Toàn bộ gói Cơ bản', 'Khai thuế môn bài', 'Chữ ký số 12 tháng']
  },
  {
    id: 'nang-tam',
    name: 'Gói Nâng tầm',
    price: 6000000,
    desc: 'Giải pháp kế toán trọn gói 1 năm',
    features: ['Toàn bộ gói Vươn cao', 'Hóa đơn điện tử', 'Kế toán trọn gói 3 tháng']
  },
];
const LEGAL_FORMS: { id: LegalForm, name: string, pros: string[], cons: string[], suitability: string, recommended?: boolean }[] = [
  {
    id: 'tnhh1',
    name: 'TNHH 1 Thành Viên',
    recommended: true,
    pros: ['Chỉ có duy nhất 1 chủ sở hữu', 'Chịu trách nhiệm hữu hạn', 'Cơ cấu quản lý đơn giản'],
    cons: ['Không thể phát hành cổ phần'],
    suitability: 'Phù hợp với cá nhân tự doanh hoặc doanh nghiệp quy mô nhỏ.'
  },
  {
    id: 'tnhh2',
    name: 'TNHH 2+ Thành Viên',
    pros: ['Từ 2 đến 50 thành viên', 'Phân chia rủi ro', 'Chế độ chuyển nhượng vốn nội bộ chặt chẽ'],
    cons: ['Bị giới hạn số lượng thành viên'],
    suitability: 'Phù hợp với mô hình kinh doanh gia đình hoặc nhóm bạn bè.'
  },
  {
    id: 'co-phan',
    name: 'Công ty Cổ phần',
    pros: ['Khả năng huy động vốn lớn', 'Không giới hạn số lượng cổ đông', 'Dễ dàng chuyển nhượng'],
    cons: ['Cơ cấu quản lý phức tạp'],
    suitability: 'Phù hợp với các startup muốn gọi vốn lớn hoặc niêm yết.'
  }
];
const LEGAL_PREFIXES: Record<LegalForm, string> = { tnhh1: 'TNHH', tnhh2: 'TNHH', 'co-phan': 'CỔ PHẦN' };
const EN_SUFFIX_MAP: Record<LegalForm, string> = { tnhh1: 'CO., LTD.', tnhh2: 'CO., LTD.', 'co-phan': 'JOINT STOCK COMPANY' };
export default function StartPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  // Data State
  const [businessType, setBusinessType] = useState<'new' | 'existing' | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [businessLines, setBusinessLines] = useState<VSICLine[]>([]);
  const [primaryLineCode, setPrimaryLineCode] = useState("");
  const [confirmedConditions, setConfirmedConditions] = useState(false);
  const [legalForm, setLegalForm] = useState<LegalForm | null>(null);
  const [province, setProvince] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [hasLandCertificate, setHasLandCertificate] = useState(false);
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState(() => location.state?.packageId || PACKAGE_OPTIONS[1].id);
  // UI State
  const [isAgreed, setIsAgreed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkResult, setCheckResult] = useState<CompanyCheckResult | null>(null);
  const [successData, setSuccessData] = useState<OnboardingResponse | null>(null);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [customFullName, setCustomFullName] = useState("");
  const [customFullNameEn, setCustomFullNameEn] = useState("");
  const [registryCloseSignal, setRegistryCloseSignal] = useState<number>(0);
  const VN_PHONE_REGEX = /^0[1-9]\d{8,9}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isStep6Valid = contactName.trim().length > 0 && VN_PHONE_REGEX.test(phone) && EMAIL_REGEX.test(email);
  const totalSteps = 8;
  const progressValue = currentStep === 'success' ? 100 : (Number(currentStep) / totalSteps) * 100;
  // Derive naming
  const generatedFullName = React.useMemo(() => {
    const base = companyName.trim().toUpperCase();
    const typePrefix = legalForm ? LEGAL_PREFIXES[legalForm] : "";
    const primaryLine = businessLines.find(l => l.code === primaryLineCode);
    const sectorName = primaryLine ? primaryLine.name.toUpperCase() : "";
    let result = "CÔNG TY";
    if (typePrefix) result += ` ${typePrefix}`;
    if (sectorName) result += ` ${sectorName}`;
    if (base) result += ` ${base}`;
    return result.trim();
  }, [companyName, businessLines, primaryLineCode, legalForm]);
  const generatedFullNameEn = React.useMemo(() => {
    const base = companyName.trim().toUpperCase();
    const suffix = legalForm ? EN_SUFFIX_MAP[legalForm] : "COMPANY";
    let result = base;
    if (suffix) result += ` ${suffix}`;
    return result.trim();
  }, [companyName, legalForm]);
  useEffect(() => {
    if (!isEditingNames) {
      setCustomFullName(generatedFullName);
      setCustomFullNameEn(generatedFullNameEn);
    }
  }, [generatedFullName, generatedFullNameEn, isEditingNames]);
  const handleCheckName = async () => {
    if (!companyName.trim() || companyName.trim().length < 3) {
      toast.error("Vui lòng nhập tên công ty hợp lệ (tối thiểu 3 ký tự)");
      return;
    }
    setIsChecking(true);
    try {
      const data = await api<CompanyCheckResult>("/api/check-name", { 
        method: "POST", 
        body: JSON.stringify({ companyName }) 
      });
      setCheckResult(data);
      setRegistryCloseSignal(Date.now());
      if (data.status === 'available') toast.success("Tên khả dụng!");
      if (data.status === 'duplicate') toast.error(data.message || "Tên đã tồn tại, vui lòng chọn tên khác.");
    } catch (error) {
      toast.error("Lỗi khi kiểm tra. Vui lòng thử lại.");
    } finally {
      setIsChecking(false);
    }
  };
  const handleSubmitFinal = async () => {
    if (!isAgreed) {
      toast.error("Vui lòng đồng ý với các điều khoản dịch vụ.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: OnboardingData = {
        businessType: businessType || 'new',
        companyName,
        fullName: customFullName,
        fullNameEn: customFullNameEn,
        legalForm: legalForm || 'tnhh1',
        province,
        addressDetail,
        hasLandCertificate,
        contactName,
        phone,
        email,
        selectedPackageId,
        businessLines,
        primaryLineCode,
        confirmedConditions
      };
      const res = await api<OnboardingResponse>("/api/onboarding/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccessData(res);
      localStorage.setItem("conti_last_ref", res.referenceNumber);
      setCurrentStep('success');
    } catch (error) {
      toast.error("Gửi thông tin thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleBack = () => {
    if (currentStep === 'success') return;
    if (currentStep === 1) navigate(-1);
    else setCurrentStep((prev) => (Number(prev) - 1) as OnboardingStep);
  };
  const selectedPackage = PACKAGE_OPTIONS.find(p => p.id === selectedPackageId) || PACKAGE_OPTIONS[1];
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-12">
          {currentStep !== 'success' && (
            <div className="max-w-5xl mx-auto mb-12">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
                <span className="text-sm font-bold text-blue-500">Bước {currentStep}/{totalSteps}</span>
              </div>
              <Progress value={progressValue} className="h-2 bg-blue-100" />
            </div>
          )}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 max-w-4xl mx-auto text-center">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-navy uppercase tracking-tight">Chào mừng đến với CONTI</h1>
                  <p className="text-lg text-muted-foreground">Chọn lộ trình phù hợp để bắt đầu hành trình doanh nghiệp của bạn.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <Card className="group cursor-pointer hover:border-blue-500 hover:shadow-2xl transition-all p-10 text-left border-2" onClick={() => { setBusinessType('new'); setCurrentStep(2); }}>
                    <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Rocket className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Thành lập mới</h2>
                    <p className="text-muted-foreground leading-relaxed">Đăng ký doanh nghiệp mới 100% online. Nhận giấy phép kinh doanh chỉ sau 5-7 ngày làm việc.</p>
                  </Card>
                  <Card className="group cursor-pointer hover:border-blue-500 hover:shadow-2xl transition-all p-10 text-left border-2" onClick={() => { setBusinessType('existing'); setCurrentStep(2); }}>
                    <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Dịch vụ SME</h2>
                    <p className="text-muted-foreground leading-relaxed">Dịch vụ kế toán, thuế và tuân thủ dành riêng cho doanh nghiệp đang hoạt động.</p>
                  </Card>
                </div>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-3xl mx-auto">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-display font-bold text-brand-navy">Tên & Ngành nghề kinh doanh</h2>
                  <p className="text-muted-foreground">Cung cấp tên mong muốn và chọn các lĩnh vực hoạt động chính.</p>
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="font-bold text-sm uppercase tracking-widest text-slate-500">Tên doanh nghiệp riêng</Label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <Input
                        placeholder="VD: AD FLEX"
                        value={companyName}
                        onChange={(e) => { setCompanyName(e.target.value.toUpperCase()); setCheckResult(null); }}
                        className="h-16 pl-12 pr-32 text-lg font-bold border-2 focus-visible:ring-blue-500"
                        autoComplete="off"
                      />
                      <Button onClick={handleCheckName} disabled={isChecking || companyName.length < 3} className="absolute right-2 top-2 h-12 px-6 bg-blue-600 font-bold hover:bg-blue-700">
                        {isChecking ? <Loader2 className="animate-spin" /> : "Kiểm tra"}
                      </Button>
                      <CompanyRegistrySearch
                        query={companyName}
                        onSelect={(entry) => {
                          setCompanyName(entry.name.toUpperCase());
                          setCheckResult(null);
                          setRegistryCloseSignal(Date.now());
                        }}
                        closeSignal={registryCloseSignal}
                      />
                    </div>
                    {checkResult?.status === 'available' && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-bold text-green-800">Tên khả dụng để đăng ký!</p>
                      </motion.div>
                    )}
                    {checkResult?.status === 'duplicate' && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="space-y-1 text-sm text-red-800 font-bold">
                          <div>{checkResult.message || "Tên doanh nghiệp đã tồn tại, vui lòng chọn tên khác."}</div>
                          {checkResult.details && checkResult.details.length > 0 && (
                            <div className="bg-white/70 border border-red-100 rounded-lg p-2 text-xs text-red-900 font-semibold">
                              {checkResult.details.slice(0, 5).map((d, idx) => (
                                <div key={`${d.name}-${idx}`} className="py-1 border-b last:border-none border-red-100">
                                  <div className="uppercase leading-snug">{d.name}</div>
                                  <div className="flex flex-wrap gap-2 text-[11px] text-red-700">
                                    {d.taxCode && <span>MST: {d.taxCode}</span>}
                                    {d.status && <span>{d.status}</span>}
                                  </div>
                                  {d.address && <div className="text-[11px] text-red-700 mt-0.5 line-clamp-2">{d.address}</div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <BusinessLineSelector 
                    selectedLines={businessLines}
                    primaryCode={primaryLineCode}
                    confirmedConditions={confirmedConditions}
                    onChange={setBusinessLines}
                    onPrimaryChange={setPrimaryLineCode}
                    onConditionsConfirmed={setConfirmedConditions}
                  />
                  <div className="flex justify-center pt-6">
                    <Button 
                      onClick={() => setCurrentStep(3)} 
                      disabled={
                        !checkResult || 
                        checkResult.status !== 'available' || 
                        businessLines.length === 0 || 
                        !primaryLineCode ||
                        (businessLines.some(l => l.isConditional) && !confirmedConditions)
                      }
                      className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                  <CompanyNameGenerator initialKeyword={companyName} onSelect={(name) => { setCompanyName(name); setCheckResult(null); }} />
                </div>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 max-w-6xl mx-auto">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-display font-bold text-brand-navy">Chọn loại hình doanh nghiệp</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {LEGAL_FORMS.map((form) => (
                    <Card key={form.id} className={cn("cursor-pointer border-2 transition-all hover:shadow-xl p-6 flex flex-col", legalForm === form.id ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500" : "hover:border-blue-200")} onClick={() => setLegalForm(form.id)}>
                      <div className="flex justify-between items-start mb-4"><h3 className="text-xl font-bold text-brand-navy">{form.name}</h3>{form.recommended && <Badge className="bg-blue-600">Phổ biến</Badge>}</div>
                      <div className="space-y-4 flex-grow">
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Ưu điểm</p>
                          {form.pros.map((p, i) => <div key={i} className="text-sm flex gap-2"><Check className="h-4 w-4 shrink-0 text-green-500" /> {p}</div>)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-center pt-4"><Button onClick={() => setCurrentStep(4)} disabled={!legalForm} className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700">Xác nhận loại hình</Button></div>
              </motion.div>
            )}
            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 max-w-4xl mx-auto">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-display font-bold text-brand-navy">Xác nhận tên pháp lý chính thức</h2>
                </div>
                <Card className="overflow-hidden shadow-2xl border-none">
                  <div className="bg-brand-navy p-8 md:p-12 text-white text-center space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-blue-300 uppercase tracking-[0.2em]">Tên Tiếng Việt</h3>
                      {isEditingNames ? (
                        <Input value={customFullName} onChange={(e) => setCustomFullName(e.target.value.toUpperCase())} className="bg-white/10 border-white/20 text-white text-xl font-bold text-center h-14" />
                      ) : (
                        <p className="text-2xl md:text-4xl font-display font-black leading-tight uppercase tracking-tight text-balance">{customFullName}</p>
                      )}
                    </div>
                    <div className="h-px bg-white/10 w-24 mx-auto" />
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-blue-300 uppercase tracking-[0.2em]">Tên Tiếng Anh (International Name)</h3>
                      {isEditingNames ? (
                        <Input value={customFullNameEn} onChange={(e) => setCustomFullNameEn(e.target.value.toUpperCase())} className="bg-white/10 border-white/20 text-white text-lg font-bold text-center h-14" />
                      ) : (
                        <p className="text-lg md:text-2xl font-medium italic text-blue-100 uppercase">{customFullNameEn}</p>
                      )}
                    </div>
                    <div className="pt-6 flex flex-wrap justify-center gap-4">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingNames(!isEditingNames)} className="bg-transparent border-white/20 text-white hover:bg-white/10">
                        {isEditingNames ? <><Save className="mr-2 h-4 w-4" /> Lưu</> : <><Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa</>}
                      </Button>
                    </div>
                  </div>
                  <div className="p-8 bg-white border-t flex flex-col items-center">
                    <Button onClick={() => setCurrentStep(5)} className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700">
                      Xác nhận tên & Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
            {currentStep === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                <Card className="p-8 shadow-2xl border-blue-50">
                  <AddressForm 
                    initialProvince={province} 
                    initialAddressDetail={addressDetail} 
                    onNext={(data) => { 
                      setProvince(data.province); 
                      setAddressDetail(data.addressDetail); 
                      setHasLandCertificate(!!data.hasLandCertificate); 
                      setCurrentStep(6); 
                    }} 
                  />
                </Card>
              </motion.div>
            )}
            {currentStep === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-xl mx-auto">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-display font-bold text-brand-navy">Thông tin liên hệ</h2>
                </div>
                <Card className="p-8 shadow-2xl border-none bg-brand-navy text-white space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-blue-200">Họ và tên người đại diện *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-blue-400" />
                        <Input value={contactName} onChange={(e) => setContactName(e.target.value.toUpperCase())} placeholder="VD: NGUYỄN VĂN A" className="h-12 pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:bg-white/20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-blue-200">Số điện thoại liên hệ *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-blue-400" />
                        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" className={cn("h-12 pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:bg-white/20", phone && !VN_PHONE_REGEX.test(phone) && "border-red-400")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-blue-200">Email nhận thông báo *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-blue-400" />
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" className={cn("h-12 pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:bg-white/20", email && !EMAIL_REGEX.test(email) && "border-red-400")} />
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setCurrentStep(7)} disabled={!isStep6Valid} className={cn("w-full h-16 text-lg font-bold rounded-xl transition-all", isStep6Valid ? "bg-white text-brand-navy hover:bg-blue-50 shadow-xl" : "bg-white/20 text-white/50 cursor-not-allowed")}>Xác nhận & Tiếp tục</Button>
                </Card>
              </motion.div>
            )}
            {currentStep === 7 && (
              <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 max-w-6xl mx-auto">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-display font-bold text-brand-navy">Chọn gói dịch vụ</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PACKAGE_OPTIONS.map((pkg) => (
                    <Card key={pkg.id} className={cn("relative flex flex-col p-8 border-2 cursor-pointer transition-all hover:shadow-2xl", selectedPackageId === pkg.id ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50/30" : "hover:border-blue-200")} onClick={() => setSelectedPackageId(pkg.id)}>
                      {pkg.isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">Phổ biến</div>}
                      <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                      <p className="text-2xl font-black text-blue-600 mb-6">{formatCurrency(pkg.price)}</p>
                      <ul className="space-y-3 mb-8 flex-grow">{pkg.features.map((f, i) => <li key={i} className="text-sm flex gap-2 font-medium"><Check className="h-4 w-4 text-blue-500 shrink-0" /> {f}</li>)}</ul>
                      <Button variant={selectedPackageId === pkg.id ? "default" : "outline"} className={cn("w-full h-12 font-bold", selectedPackageId === pkg.id && "bg-blue-600")}>{selectedPackageId === pkg.id ? "Đã chọn" : "Chọn gói này"}</Button>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-center"><Button onClick={() => setCurrentStep(8)} className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl hover:bg-blue-700">Xác nhận gói & Xem tóm tắt</Button></div>
              </motion.div>
            )}
            {currentStep === 8 && (
              <motion.div key="step8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-3xl mx-auto">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-display font-bold text-brand-navy">Xác nhận yêu cầu đăng ký</h2>
                </div>
                <Card className="overflow-hidden shadow-2xl border-none">
                  <div className="bg-brand-navy p-8 text-white flex justify-between items-center"><div><h3 className="text-2xl font-bold">PHIẾU ĐĂNG KÝ</h3><p className="text-blue-200 text-sm mt-1 uppercase tracking-widest">Hệ thống CONTI 24/7</p></div><FileText className="h-12 w-12 opacity-50" /></div>
                  <div className="p-8 space-y-8 bg-white text-brand-navy">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <Building2 className="h-5 w-5 text-blue-500 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Doanh nghiệp</p>
                            <p className="text-md font-bold leading-tight uppercase">{customFullName}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {businessLines.map(l => (
                                <Badge 
                                  key={l.code} 
                                  variant="secondary" 
                                  className={cn(
                                    "text-[9px] uppercase",
                                    l.code === primaryLineCode && "bg-blue-600 text-white"
                                  )}
                                >
                                  {l.code === primaryLineCode && <Star className="h-2 w-2 mr-1 fill-current" />}
                                  {l.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4"><MapPin className="h-5 w-5 text-blue-500 shrink-0" /><div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Trụ sở</p><p className="text-sm font-bold">{addressDetail}, {province}</p></div></div>
                        <div className="flex gap-4"><User className="h-5 w-5 text-blue-500 shrink-0" /><div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Đại diện</p><p className="text-lg font-bold">{contactName}</p><p className="text-sm font-medium text-slate-500">{phone}</p></div></div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center"><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tổng phí dịch vụ</p><p className="text-3xl font-black text-blue-600">{formatCurrency(selectedPackage.price)}</p><p className="text-sm font-bold text-slate-500 mt-2">{selectedPackage?.name}</p></div>
                    </div>
                    <div className="pt-6 border-t flex items-start gap-3"><Checkbox id="terms" checked={isAgreed} onCheckedChange={(v) => setIsAgreed(!!v)} className="mt-1 data-[state=checked]:bg-blue-600" /><Label htmlFor="terms" className="text-sm leading-relaxed text-slate-600 font-medium">Tôi xác nhận các thông tin trên là chính xác và đồng ý với các <span className="text-blue-600 underline">điều khoản dịch vụ</span> của CONTI.</Label></div>
                    <Button onClick={handleSubmitFinal} disabled={isSubmitting || !isAgreed} className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-xl font-bold rounded-2xl shadow-xl">{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Gửi yêu cầu đăng ký"}</Button>
                  </div>
                </Card>
              </motion.div>
            )}
            {currentStep === 'success' && (
              <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-16 space-y-10 max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-xl shadow-green-100 animate-success-pulse"><Check className="h-12 w-12" /></div>
                <div className="space-y-4"><h1 className="text-4xl font-display font-bold text-brand-navy">Gửi hồ sơ thành công!</h1><p className="text-xl text-muted-foreground leading-relaxed">{successData?.message}</p></div>
                <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl inline-block"><p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Mã tham chiếu hồ sơ</p><p className="text-4xl font-display font-black text-blue-900 tracking-tighter">{successData?.referenceNumber}</p></div>
                  <div className="pt-4"><Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 px-12 h-14 font-bold rounded-xl shadow-lg"><Link to="/">Quay về Trang chủ</Link></Button><Button asChild variant="outline" size="lg" className="px-12 h-14 font-bold rounded-xl ml-4 hover:bg-blue-50 border-blue-200 text-blue-600"><Link to="/portal">Xem tiến độ</Link></Button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
