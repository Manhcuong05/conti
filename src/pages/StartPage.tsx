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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    MapPin,
    Mail,
    Phone,
    Globe,
    Printer,
    Calendar,
    DollarSign,
    Users,
    UserPlus,
    X,
    Upload,
    Star,
    CreditCard,
    QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { CompanyRegistrySearch } from "@/components/CompanyRegistrySearch";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatting";
import { VIETNAM_PROVINCES } from "@shared/constants";

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'success';
type BusinessType = 'tnhh1' | 'tnhh2' | 'co-phan';
type VATMethod = 'khau-tru' | 'truc-tiep-gtgt' | 'truc-tiep-doanh-so' | 'khong-nop';
type AssetContribution = 'cash' | 'bank-transfer';

interface Founder {
    id: string;
    name: string;
    idNumber: string;
    permanentAddress: string;
    contactAddress: string;
    capitalContribution: number;
    ownershipPercentage: number;
}

const BUSINESS_TYPES = [
    {
        id: 'tnhh1' as BusinessType,
        name: 'Công ty TNHH 1 Thành viên',
        description: 'Limited Liability Company - Single Member',
        minMembers: 1,
        maxMembers: 1,
        recommended: true,
        benefits: [
            '✓ 100% quyền sở hữu và kiểm soát',
            '✓ Quy trình thành lập đơn giản',
            '✓ Linh hoạt trong quản lý và điều hành'
        ],
        limitations: [
            '✗ Vốn điều lệ tối thiểu 10 triệu VNĐ',
            '✗ Một người chịu trách nhiệm duy nhất'
        ]
    },
    {
        id: 'tnhh2' as BusinessType,
        name: 'Công ty TNHH 2 Thành viên trở lên',
        description: 'Limited Liability Company - Multiple Members',
        minMembers: 2,
        maxMembers: 50,
        benefits: [
            '✓ Phân chia rủi ro giữa các thành viên',
            '✓ Dễ dàng huy động vốn',
            '✓ Linh hoạt trong quản trị'
        ],
        limitations: [
            '✗ Cần thỏa thuận giữa các thành viên',
            '✗ Có thể xung đột lợi ích'
        ]
    },
    {
        id: 'co-phan' as BusinessType,
        name: 'Công ty Cổ phần',
        description: 'Joint Stock Company',
        minMembers: 3,
        maxMembers: Infinity,
        benefits: [
            '✓ Huy động vốn qua phát hành cổ phiếu',
            '✓ Dễ dàng chuyển nhượng vốn',
            '✓ Uy tín cao với đối tác'
        ],
        limitations: [
            '✗ Quy trình thành lập phức tạp hơn',
            '✗ Yêu cầu công bố thông tin định kỳ'
        ]
    },
];

const PACKAGE_OPTIONS = [
    {
        id: 'co-ban',
        name: 'Gói Cơ bản',
        price: 4200000,
        desc: 'Phù hợp khởi đầu tinh gọn',
        features: ['Giấy phép kinh doanh', 'Con dấu pháp nhân', 'Báo cáo thành lập']
    },
    {
        id: 'cao-cap',
        name: 'Gói Cao cấp',
        price: 5000000,
        desc: 'Đầy đủ thủ tục pháp lý & thuế',
        isPopular: true,
        features: ['Toàn bộ gói Cơ bản', 'Khai thuế môn bài', 'Chữ ký số 12 tháng']
    },
    {
        id: 'kim-cuong',
        name: 'Gói Kim cương',
        price: 6000000,
        desc: 'Giải pháp kế toán trọn gói 1 năm',
        features: ['Toàn bộ gói Cao cấp', 'Hóa đơn điện tử', 'Kế toán trọn gói 3 tháng']
    },
];

export default function StartPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
    const [showErrors, setShowErrors] = useState(false);

    // Reset showErrors when step changes
    useEffect(() => {
        setShowErrors(false);
    }, [currentStep]);

    // Step 1: Business Type
    const [businessType, setBusinessType] = useState<BusinessType | null>(null);

    // Step 2: Company Naming
    const [companyNameVi, setCompanyNameVi] = useState("");
    const [companyNameEn, setCompanyNameEn] = useState("");
    const [abbreviation, setAbbreviation] = useState("");
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

    // Step 3: Contact & Headquarters

    const [website, setWebsite] = useState("");
    const [fax, setFax] = useState("");
    const [addressWarning, setAddressWarning] = useState(false);

    // Step 4: Business Details
    const [businessLines, setBusinessLines] = useState("");
    const [vatMethod, setVATMethod] = useState<VATMethod>('khau-tru');

    // Step 5: Capital & Personnel
    const [charterCapital, setCharterCapital] = useState("");
    const [assetContribution, setAssetContribution] = useState<AssetContribution>('cash');
    const [capitalCompletionDate, setCapitalCompletionDate] = useState("");
    const [legalRepMode, setLegalRepMode] = useState<'vneid' | 'manual'>('manual');
    const [legalRepName, setLegalRepName] = useState("");
    const [legalRepTitle, setLegalRepTitle] = useState("Giám đốc");
    const [legalRepDOB, setLegalRepDOB] = useState("");
    const [legalRepEthnicity, setLegalRepEthnicity] = useState("");
    const [legalRepIDNumber, setLegalRepIDNumber] = useState("");
    const [legalRepIDDate, setLegalRepIDDate] = useState("");
    const [legalRepIDPlace, setLegalRepIDPlace] = useState("");
    const [legalRepPermanentAddress, setLegalRepPermanentAddress] = useState("");
    const [legalRepContactAddress, setLegalRepContactAddress] = useState("");
    const [hasChiefAccountant, setHasChiefAccountant] = useState(false);
    const [caName, setCAName] = useState("");
    const [caDOB, setCADOB] = useState("");
    const [caIDNumber, setCAIDNumber] = useState("");
    const [caIDDate, setCAIDDate] = useState("");
    const [caIDPlace, setCAIDPlace] = useState("");
    const [caAddress, setCAAddress] = useState("");

    // Step 6: Founders
    const [founders, setFounders] = useState<Founder[]>([]);

    // Step 7: Package selection
    const [selectedPackageId, setSelectedPackageId] = useState(() =>
        location.state?.packageId || PACKAGE_OPTIONS[1].id
    );

    // Step 8: Agreement
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // NEW: Step 1 - Province Selection
    const [selectedProvince, setSelectedProvince] = useState<string>("");

    // NEW: Step 4 - Company Contact Info (separate from HQ address)
    const [companyPhone, setCompanyPhone] = useState("");
    const [companyEmail, setCompanyEmail] = useState("");
    const [companyWebsite, setCompanyWebsite] = useState("");
    const [companyFax, setCompanyFax] = useState("");

    // NEW: Step 4 - Structured Address Fields
    const [addressStreet, setAddressStreet] = useState("");
    const [addressWard, setAddressWard] = useState("");
    const [addressDistrict, setAddressDistrict] = useState("");
    // selectedProvince already declared above

    // NEW: Step 9 - Payer Information
    const [payerName, setPayerName] = useState("");
    const [payerPhone, setPayerPhone] = useState("");
    const [payerEmail, setPayerEmail] = useState("");
    const [payerIDNumber, setPayerIDNumber] = useState("");
    const [payerAddress, setPayerAddress] = useState("");
    const [payerSameAsLegalRep, setPayerSameAsLegalRep] = useState(false);

    // NEW: Step 10 - Payment
    const [paymentMethod, setPaymentMethod] = useState<'qr' | 'transfer'>('qr');
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState("");
    const [registryCloseSignal, setRegistryCloseSignal] = useState<number>(0);

    const totalSteps = 10;
    const progressValue = currentStep === 'success' ? 100 : (Number(currentStep) / totalSteps) * 100;

    // Generic Validation Logic
    const validateStep = (step: OnboardingStep): boolean => {
        switch (step) {
            case 1: // Province
                return !!selectedProvince;
            case 2: // Business Type (was Step 1 in code but UI Step 2)
                return !!businessType;
            case 3: // Company Naming
                return !!nameAvailable && !!companyNameVi && !!companyNameEn;
            case 4: // Contact Info & Address
                return isValidPhone(companyPhone) &&
                    isValidEmail(companyEmail) &&
                    isValidEmail(companyEmail) &&
                    isValidText(addressStreet, 5) &&
                    isValidText(addressWard, 3);
            case 5: // Capital & Personnel
                const isCapitalValid = !!charterCapital && !!capitalCompletionDate;
                let isLegalRepValid = false;
                if (legalRepMode === 'vneid') {
                    isLegalRepValid = true; // Assume valid if uploading, or add check for uploaded file
                } else {
                    isLegalRepValid = !!legalRepName &&
                        !!legalRepTitle &&
                        !!legalRepDOB &&
                        isValidIDNumber(legalRepIDNumber) &&
                        !!legalRepIDDate &&
                        !!legalRepIDPlace &&
                        !!legalRepPermanentAddress &&
                        !!legalRepContactAddress;
                }
                const isCAValid = hasChiefAccountant
                    ? (!!caName && !!caDOB && isValidIDNumber(caIDNumber) && !!caIDDate && !!caIDPlace && isValidText(caAddress, 5))
                    : true;
                const isFoundersSectionValid = (businessType === 'tnhh2' || businessType === 'co-phan') ? isFoundersValid() : true;
                return isCapitalValid && isLegalRepValid && isFoundersSectionValid && isCAValid;
            case 6: // Business Lines
                return !!businessLines.trim();
            case 9: // Payer Info
                return !!payerName && isValidPhone(payerPhone) && !!payerIDNumber && !!payerAddress;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => (Number(prev) + 1) as OnboardingStep);
        } else {
            setShowErrors(true);
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        }
    };

    // Validation helpers
    const isValidPhone = (phone: string): boolean => {
        // Vietnam phone: 10 digits, starts with 0
        const phoneRegex = /^0\d{9}$/;
        return phoneRegex.test(phone.trim());
    };

    const isValidEmail = (email: string): boolean => {
        // Standard email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    const isValidIDNumber = (id: string): boolean => {
        const idRegex = /^\d{9}$|^\d{12}$/;
        return idRegex.test(id.trim());
    };

    const isValidText = (text: string, minLength: number = 3): boolean => {
        return text.trim().length >= minLength;
    };

    // Auto-translate Vietnamese name to English
    const handleTranslateName = async () => {
        if (!companyNameVi.trim()) return;

        try {
            // Call translation API
            const data = await api<{ translatedText: string }>("/api/translate", {
                method: "POST",
                body: JSON.stringify({
                    text: companyNameVi,
                    sourceLang: "vi",
                    targetLang: "en"
                })
            });

            setCompanyNameEn(data.translatedText.toUpperCase());
            toast.info("Tên tiếng Anh đã được tự động điền. Bạn có thể chỉnh sửa.");
        } catch (error) {
            // Fallback: simple transformation if API fails
            console.error('[TRANSLATE ERROR]', error);
            const fallback = companyNameVi
                .toUpperCase()
                .replace(/CÔNG TY /g, '')
                .replace(/TNHH /g, '')
                .replace(/CỔ PHẦN /g, '')
                .trim() + ' COMPANY LIMITED';
            setCompanyNameEn(fallback);
            toast.info("Tên tiếng Anh đã được tự động điền (chế độ offline). Bạn có thể chỉnh sửa.");
        }
    };

    // Check name availability
    const handleCheckName = async () => {
        if (!companyNameVi.trim() || companyNameVi.trim().length < 3) {
            toast.error("Vui lòng nhập tên công ty hợp lệ (tối thiểu 3 ký tự)");
            return;
        }

        setIsCheckingName(true);
        setRegistryCloseSignal(Date.now()); // Close dropdown when checking
        try {
            const data = await api<any>("/api/check-name", {
                method: "POST",
                body: JSON.stringify({ companyName: companyNameVi })
            });

            if (data.status === 'available') {
                setNameAvailable(true);
                toast.success("Tên khả dụng!");
                await handleTranslateName();
            } else {
                setNameAvailable(false);
                toast.error(data.message || "Tên đã tồn tại");
            }
        } catch (error) {
            // Fallback for development/testing if API is not available
            console.warn("API check failed, falling back to mock success");
            setNameAvailable(true);
            toast.success("Tên khả dụng (Chế độ Offline)!");
            // Auto-fill dummy English name
            if (!companyNameEn) {
                setCompanyNameEn(companyNameVi.toUpperCase() + " COMPANY LIMITED");
            }
        } finally {
            setIsCheckingName(false);
            // Force close dropdown after check completes
            setRegistryCloseSignal(Date.now());
        }
    };

    // Check address for warnings
    useEffect(() => {
        const keywords = ['chung cư', 'chung cu', 'tập thể', 'tap the'];
        const hasKeyword = keywords.some(kw => addressStreet.toLowerCase().includes(kw));
        setAddressWarning(hasKeyword);
    }, [addressStreet]);

    // Auto-calculate founder percentages
    useEffect(() => {
        const capital = parseFloat(charterCapital.replace(/\./g, '')) || 0;
        if (capital > 0) {
            setFounders(prev => prev.map(f => ({
                ...f,
                ownershipPercentage: (f.capitalContribution / capital) * 100
            })));
        }
    }, [charterCapital, founders.map(f => f.capitalContribution).join(',')]);

    // Validate founders
    const isFoundersValid = () => {
        if (!businessType) return false;
        const selectedType = BUSINESS_TYPES.find(t => t.id === businessType);
        if (!selectedType) return false;

        const count = founders.length;
        if (count < selectedType.minMembers || count > selectedType.maxMembers) {
            return false;
        }

        const totalPercentage = founders.reduce((sum, f) => sum + f.ownershipPercentage, 0);
        const isDistributionValid = Math.abs(totalPercentage - 100) < 0.01;

        // Check individual fields for all founders
        const areFieldsValid = founders.every(f =>
            isValidText(f.name, 3) &&
            isValidIDNumber(f.idNumber) &&
            isValidText(f.permanentAddress, 5) &&
            isValidText(f.contactAddress, 5) &&
            f.capitalContribution > 0
        );

        return isDistributionValid && areFieldsValid;
    };

    const addFounder = () => {
        const newFounder: Founder = {
            id: crypto.randomUUID(),
            name: "",
            idNumber: "",
            permanentAddress: "",
            contactAddress: "",
            capitalContribution: 0,
            ownershipPercentage: 0,
        };
        setFounders(prev => [...prev, newFounder]);
    };

    const removeFounder = (id: string) => {
        setFounders(prev => prev.filter(f => f.id !== id));
    };

    const updateFounder = (id: string, field: keyof Founder, value: any) => {
        setFounders(prev => prev.map(f =>
            f.id === id ? { ...f, [field]: value } : f
        ));
    };

    const handleSubmitFinal = async () => {
        if (!isAgreed) {
            toast.error("Vui lòng đồng ý với điều khoản dịch vụ");
            return;
        }

        setIsSubmitting(true);
        try {
            const provinceName = VIETNAM_PROVINCES.find(p => p.id === selectedProvince)?.name || selectedProvince;
            const fullAddress = `${addressStreet}, ${addressWard}, ${addressDistrict}, ${provinceName}`;

            const payload = {
                businessType,
                companyNameVi,
                companyNameEn,
                abbreviation,
                address: fullAddress,
                phone: companyPhone,
                email: companyEmail,
                website,
                fax,
                businessLines,
                vatMethod,
                charterCapital: parseFloat(charterCapital.replace(/\./g, '')) || 0,
                assetContribution,
                capitalCompletionDate,
                legalRepresentative: {
                    uploadedVNeID: legalRepMode === 'vneid',
                    name: legalRepName,
                    title: legalRepTitle,
                    dob: legalRepDOB,
                    ethnicity: legalRepEthnicity,
                    idNumber: legalRepIDNumber,
                    idIssueDate: legalRepIDDate,
                    idIssuePlace: legalRepIDPlace,
                    permanentAddress: legalRepPermanentAddress,
                    contactAddress: legalRepContactAddress,
                },
                hasChiefAccountant,
                chiefAccountant: hasChiefAccountant ? {
                    name: caName,
                    dob: caDOB,
                    idNumber: caIDNumber,
                    idIssueDate: caIDDate,
                    idIssuePlace: caIDPlace,
                    address: caAddress,
                } : undefined,
                founders,
                selectedPackageId,
                payerInfo: {
                    name: payerName,
                    phone: payerPhone,
                    email: payerEmail,
                    idNumber: payerIDNumber,
                    address: payerAddress,
                },
                paymentMethod,
                timestamp: new Date().toISOString()
            };

            // Mock submission - replace with actual API call
            console.log('[SUBMIT Payload]', payload);
            await new Promise(resolve => setTimeout(resolve, 2000));

            const ref = `CONTI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            setReferenceNumber(ref);
            setCurrentStep('success');
            toast.success("Gửi hồ sơ thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Gửi hồ sơ thất bại");
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
                        {/* STEP 1: Choose Province (NEW) */}
                        {currentStep === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 max-w-5xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-navy">
                                        Chọn tỉnh/thành phố nơi thành lập doanh nghiệp
                                    </h1>
                                    <p className="text-lg text-muted-foreground">
                                        Địa điểm đăng ký kinh doanh của công ty bạn
                                    </p>
                                </div>

                                <Card className="p-8 max-w-2xl mx-auto">
                                    <div className="space-y-4">
                                        <Label className="text-lg font-bold">
                                            Tỉnh/Thành phố *
                                        </Label>
                                        <select
                                            value={selectedProvince}
                                            onChange={(e) => setSelectedProvince(e.target.value)}
                                            className="w-full h-14 px-4 text-lg border-2 rounded-lg border-input bg-background hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        >
                                            <option value="">-- Chọn tỉnh/thành phố --</option>
                                            {VIETNAM_PROVINCES.map(province => (
                                                <option key={province.id} value={province.id}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-sm text-muted-foreground">
                                            💡 Đây là nơi công ty sẽ đăng ký kinh doanh chính thức
                                        </p>
                                        {showErrors && !selectedProvince && (
                                            <div className="flex items-center gap-2 text-red-600 text-sm mt-2 animate-in fade-in slide-in-from-top-1">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="font-medium">Vui lòng chọn tỉnh/thành phố để tiếp tục</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={handleNext}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Choose Business Type (was Step 1) */}
                        {currentStep === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 max-w-5xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-navy">Chọn loại hình doanh nghiệp</h1>
                                    <p className="text-lg text-muted-foreground">Loại hình pháp lý phù hợp với mô hình kinh doanh của bạn</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {BUSINESS_TYPES.map((type) => (
                                        <Card
                                            key={type.id}
                                            className={cn(
                                                "cursor-pointer border-2 transition-all p-8 hover:shadow-xl",
                                                businessType === type.id ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500" : "hover:border-blue-200"
                                            )}
                                            onClick={() => setBusinessType(type.id)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-bold text-brand-navy">{type.name}</h3>
                                                {type.recommended && <Badge className="bg-blue-600">Phổ biến</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground italic mb-4">{type.description}</p>

                                            {/* Benefits */}
                                            {type.benefits && (
                                                <div className="mt-4 space-y-1">
                                                    <p className="text-xs font-semibold text-green-700">Lợi ích:</p>
                                                    {type.benefits.map((benefit, i) => (
                                                        <p key={i} className="text-xs text-green-600">{benefit}</p>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Limitations */}
                                            {type.limitations && (
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs font-semibold text-orange-700">Hạn chế:</p>
                                                    {type.limitations.map((limit, i) => (
                                                        <p key={i} className="text-xs text-orange-600">{limit}</p>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="text-sm mt-4">
                                                <p className="font-medium">
                                                    Số thành viên: {type.minMembers === type.maxMembers ? type.minMembers : `${type.minMembers} -${type.maxMembers === Infinity ? 'Không giới hạn' : type.maxMembers} `}
                                                </p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(1)}
                                        className="h-14 px-8"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Company Naming (was Step 2) */}
                        {currentStep === 3 && (
                            <motion.div key="step3-naming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-3xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Thông tin tên Công ty</h2>
                                    <p className="text-muted-foreground">Không trùng tên đã có</p>
                                </div>

                                <Card className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Tên tiếng Việt *</Label>
                                        <div className="relative">
                                            <Input
                                                value={companyNameVi}
                                                onChange={(e) => {
                                                    setCompanyNameVi(e.target.value.toUpperCase());
                                                    setNameAvailable(null);
                                                }}
                                                placeholder="VD: AD FLEX"
                                                className={cn("h-14 text-lg font-bold pr-32", showErrors && !companyNameVi && "border-red-500 ring-red-500 focus:ring-red-500")}
                                            />
                                            {showErrors && !companyNameVi && (
                                                <div className="flex items-center gap-2 text-red-600 text-sm mt-2 animate-in fade-in slide-in-from-top-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="font-medium">Vui lòng nhập tên công ty bằng tiếng Việt</span>
                                                </div>
                                            )}
                                            <Button
                                                onClick={handleCheckName}
                                                disabled={isCheckingName || companyNameVi.length < 3}
                                                className="absolute right-2 top-2 h-10 px-6 bg-blue-600 hover:bg-blue-700"
                                            >
                                                {isCheckingName ? <Loader2 className="animate-spin" /> : "Kiểm tra"}
                                            </Button>
                                            <CompanyRegistrySearch
                                                query={companyNameVi}
                                                onSelect={(entry) => {
                                                    setCompanyNameVi(entry.name.toUpperCase());
                                                    setNameAvailable(null);
                                                    setRegistryCloseSignal(Date.now());
                                                }}
                                                closeSignal={registryCloseSignal}
                                            />
                                        </div>
                                        {nameAvailable === true && (
                                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Tên khả dụng!
                                            </div>
                                        )}
                                        {nameAvailable === false && (
                                            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                                                <AlertCircle className="h-4 w-4" />
                                                Tên đã tồn tại, vui lòng chọn tên khác
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold">Tên giao dịch quốc tế (International Name) *</Label>
                                        <Input
                                            value={companyNameEn}
                                            onChange={(e) => setCompanyNameEn(e.target.value.toUpperCase())}
                                            placeholder="AD FLEX COMPANY LIMITED"
                                            className={cn("h-14 text-lg", showErrors && !companyNameEn && "border-red-500 ring-red-500 focus:ring-red-500")}
                                        />
                                        {showErrors && !companyNameEn && (
                                            <div className="flex items-center gap-2 text-red-600 text-sm mt-2 animate-in fade-in slide-in-from-top-1">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="font-medium">Vui lòng nhập tên giao dịch quốc tế</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground">Được tự động điền sau khi kiểm tra tên. Bạn có thể chỉnh sửa.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold">Tên viết tắt (tùy chọn)</Label>
                                        <Input
                                            value={abbreviation}
                                            onChange={(e) => setAbbreviation(e.target.value.toUpperCase())}
                                            placeholder="VD: ADFCO"
                                            className="h-14"
                                        />
                                    </div>
                                </Card>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(2)}
                                        className="h-14 px-8"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                        {/* Show validation errors if trying to submit invalid form - General warning near button as a fallback or summary */}
                                        {showErrors && (!companyNameVi || !companyNameEn) && (
                                            <div className="absolute -bottom-10 w-full text-center text-red-600 font-medium text-sm animate-in fade-in slide-in-from-top-1">
                                                Vui lòng kiểm tra lại thông tin bên trên
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Contact Info + Address */}
                        {currentStep === 4 && (
                            <motion.div key="step4-contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 max-w-4xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Thông tin liên lạc & Trụ sở</h2>
                                    <p className="text-muted-foreground">Thông tin liên lạc của công ty và địa chỉ trụ sở chính</p>
                                </div>

                                <Card className="p-8 space-y-8">
                                    {/* SECTION 1: Company Contact Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-brand-navy">Thông tin liên lạc công ty</h3>
                                        <p className="text-sm text-muted-foreground">Thông tin này có thể trùng hoặc không trùng với người đại diện pháp luật</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="font-bold">Số điện thoại *</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        type="tel"
                                                        value={companyPhone}
                                                        onChange={(e) => setCompanyPhone(e.target.value)}
                                                        placeholder="09xx xxx xxx"
                                                        className={cn("h-12 pl-10", showErrors && !isValidPhone(companyPhone) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                    />
                                                </div>
                                                {showErrors && !isValidPhone(companyPhone) && (
                                                    <div className="flex items-center gap-2 text-red-600 text-sm mt-1 animate-in fade-in slide-in-from-top-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>Số điện thoại không hợp lệ</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="font-bold">Email *</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        type="email"
                                                        value={companyEmail}
                                                        onChange={(e) => setCompanyEmail(e.target.value)}
                                                        placeholder="contact@company.com"
                                                        className={cn("h-12 pl-10", showErrors && !isValidEmail(companyEmail) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                    />
                                                </div>
                                                {showErrors && !isValidEmail(companyEmail) && (
                                                    <div className="flex items-center gap-2 text-red-600 text-sm mt-1 animate-in fade-in slide-in-from-top-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>Email không hợp lệ</span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Nên dùng email riêng cho doanh nghiệp (tách biệt mail cá nhân). <br />
                                                    <a href="#" className="text-blue-600 underline hover:text-blue-800 font-medium">Mua tài khoản Microsoft 365 tại Conti</a>
                                                </p>
                                            </div>
                                        </div>
                                        {/* Microsoft 365 Suggestion */}
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex gap-2 text-sm">
                                                <div className="shrink-0 text-blue-600">💡</div>
                                                <div>
                                                    <p className="font-medium text-blue-900">Gợi ý chuyên nghiệp</p>
                                                    <p className="text-blue-700 mt-1">
                                                        Nên sử dụng email doanh nghiệp riêng (vd: info@congty.com) thay vì email cá nhân.
                                                        <Link to="/services/microsoft-365" className="font-bold text-blue-600 hover:underline ml-1">
                                                            CONTI cung cấp tài khoản Microsoft 365 Business
                                                        </Link>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Website (tùy chọn)</Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        value={companyWebsite}
                                                        onChange={(e) => setCompanyWebsite(e.target.value)}
                                                        placeholder="www.company.com"
                                                        className="h-12 pl-10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Fax (tùy chọn)</Label>
                                                <div className="relative">
                                                    <Printer className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        value={companyFax}
                                                        onChange={(e) => setCompanyFax(e.target.value)}
                                                        placeholder="024 xxxx xxxx"
                                                        className="h-12 pl-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <div className="border-t border-gray-200"></div>

                                    {/* SECTION 2: Headquarters Address */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-brand-navy">Địa chỉ trụ sở doanh nghiệp</h3>

                                        {/* Selected Province (read-only from Step 1) */}
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">
                                                Tỉnh/Thành phố: <span className="text-blue-600 font-bold">
                                                    {VIETNAM_PROVINCES.find(p => p.id === selectedProvince)?.name || 'Chưa chọn'}
                                                </span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                (Đã chọn ở bước 1.
                                                <button
                                                    onClick={() => setCurrentStep(1)}
                                                    className="text-blue-600 hover:underline ml-1"
                                                >
                                                    Muốn thay đổi? Quay lại bước 1
                                                </button>)
                                            </p>
                                        </div>

                                        {/* District & Ward */}
                                        {/* District & Ward - REMOVED DISTRICT as per user request */}
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                            {/* District field removed */}

                                            <div className="space-y-2">
                                                <Label className="font-bold">Phường/Xã *</Label>
                                                <Input
                                                    value={addressWard}
                                                    onChange={(e) => setAddressWard(e.target.value)}
                                                    placeholder="VD: Phường Điện Biên"
                                                    className={cn("h-12", showErrors && !isValidText(addressWard, 3) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                />
                                                {showErrors && !isValidText(addressWard, 3) && (
                                                    <p className="text-red-600 text-sm mt-1">Vui lòng nhập Phường/Xã</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Street Address */}
                                        <div className="space-y-2">
                                            <Label className="font-bold">Số nhà, tên đường *</Label>
                                            <Input
                                                value={addressStreet}
                                                onChange={(e) => {
                                                    setAddressStreet(e.target.value);
                                                    // Check for warning keywords
                                                    const warning = /chung cư|tập thể|apartment/i.test(e.target.value);
                                                    setAddressWarning(warning);
                                                }}
                                                placeholder="VD: Số 54 Liễu Giai"
                                                className={cn("h-12", showErrors && !isValidText(addressStreet, 5) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                            />
                                            {showErrors && !isValidText(addressStreet, 5) && (
                                                <p className="text-red-600 text-sm mt-1">Vui lòng nhập địa chỉ chi tiết</p>
                                            )}
                                        </div>

                                        {/* Full Address Preview */}
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Địa chỉ đầy đủ:</p>
                                            <p className="text-sm text-gray-900 font-medium">
                                                {[
                                                    addressStreet,
                                                    addressWard,
                                                    addressDistrict,
                                                    VIETNAM_PROVINCES.find(p => p.id === selectedProvince)?.name
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ') || 'Chưa điền đủ thông tin'}
                                            </p>
                                        </div>

                                        {/* Warning for apartments */}
                                        {addressWarning && (
                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                                                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                                <div className="text-sm text-yellow-800">
                                                    <strong>Lưu ý:</strong> Trụ sở không được phép là chung cư/nhà tập thể.
                                                    Nếu là nhà riêng có số phòng, cần có Giấy chứng nhận quyền sử dụng đất.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(3)}
                                        className="h-14 px-8"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 6: Business Lines */}
                        {currentStep === 6 && (
                            <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-3xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Ngành nghề & Thuế</h2>
                                    <p className="text-muted-foreground">Lĩnh vực hoạt động và phương pháp tính thuế</p>
                                </div>

                                <Card className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Ngành nghề kinh doanh *</Label>
                                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-2">
                                            <span className="font-bold">Lưu ý:</span> Liệt kê chi tiết các ngành nghề, cách nhau bằng dấu phẩy (,).
                                        </div>
                                        <Textarea
                                            value={businessLines}
                                            onChange={(e) => setBusinessLines(e.target.value)}
                                            placeholder="VD: Buôn bán phần mềm, Tư vấn quản trị hệ thống máy tính, Dịch vụ xử lý dữ liệu..."
                                            rows={5}
                                            className="resize-none"
                                        />
                                        {showErrors && !businessLines.trim() && (
                                            <p className="text-red-600 text-sm mt-1">Vui lòng nhập ngành nghề kinh doanh</p>
                                        )}
                                        <p className="text-sm text-muted-foreground text-right mt-1">
                                            Chuẩn bị các ngành nghề theo yêu cầu của bạn.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="font-bold">Phương pháp tính thuế GTGT *</Label>
                                        <RadioGroup value={vatMethod} onValueChange={(v) => setVATMethod(v as VATMethod)}>
                                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                                                <RadioGroupItem value="khau-tru" id="vat1" />
                                                <Label htmlFor="vat1" className="cursor-pointer flex-grow">Khấu trừ (Mặc định)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                                                <RadioGroupItem value="truc-tiep-gtgt" id="vat2" />
                                                <Label htmlFor="vat2" className="cursor-pointer flex-grow">Trực tiếp trên GTGT</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                                                <RadioGroupItem value="truc-tiep-doanh-so" id="vat3" />
                                                <Label htmlFor="vat3" className="cursor-pointer flex-grow">Trực tiếp trên doanh số</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                                                <RadioGroupItem value="khong-nop" id="vat4" />
                                                <Label htmlFor="vat4" className="cursor-pointer flex-grow">Không phải nộp thuế GTGT</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </Card>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(5)}
                                        className="h-14 px-8"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                    {/* Removed previous error message near button */}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: Capital & Personnel */}
                        {currentStep === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-4xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Vốn & Nhân sự</h2>
                                    <p className="text-muted-foreground">Thông tin về vốn điều lệ và người đại diện pháp luật</p>
                                </div>

                                <Card className="p-8 space-y-8">
                                    {/* Capital Information */}
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <DollarSign className="h-6 w-6 text-blue-600" />
                                            Thông tin vốn
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="font-bold">Vốn điều lệ (VNĐ) *</Label>
                                                <Input
                                                    type="text"
                                                    value={charterCapital}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                        setCharterCapital(value ? parseInt(value).toLocaleString('vi-VN') : '');
                                                    }}
                                                    placeholder="50,000,000"
                                                    className="h-12 text-lg font-bold"
                                                />
                                                {showErrors && !charterCapital && (
                                                    <p className="text-red-600 text-sm mt-1">Vui lòng nhập vốn điều lệ</p>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    💡 Nên để vốn điều lệ ở mức vừa phải để giảm phí môn bài.
                                                    <br />- <strong>Dưới 10 tỷ:</strong> 2 triệu/năm
                                                    <br />- <strong>Trên 10 tỷ:</strong> 3 triệu/năm
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center space-x-2 font-bold">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                    <span>Ngày hoàn thành góp vốn *</span>
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={capitalCompletionDate}
                                                    onChange={(e) => setCapitalCompletionDate(e.target.value)}
                                                    className={cn("h-14 text-lg", showErrors && !capitalCompletionDate && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                />
                                                {showErrors && !capitalCompletionDate && (
                                                    <p className="text-red-600 text-sm mt-1">Vui lòng chọn ngày hoàn thành</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">Theo luật, tối đa 90 ngày kể từ ngày cấp giấy phép.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="font-bold">Tài sản góp vốn *</Label>
                                            <RadioGroup value={assetContribution} onValueChange={(v) => setAssetContribution(v as AssetContribution)}>
                                                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50">
                                                    <RadioGroupItem value="cash" id="asset1" />
                                                    <Label htmlFor="asset1" className="cursor-pointer flex-grow">Tiền mặt</Label>
                                                </div>
                                                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50">
                                                    <RadioGroupItem value="bank-transfer" id="asset2" />
                                                    <Label htmlFor="asset2" className="cursor-pointer flex-grow">Chuyển khoản</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>

                                    <div className="border-t pt-6" />

                                    {/* Legal Representative */}
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <User className="h-6 w-6 text-blue-600" />
                                            Người đại diện theo pháp luật
                                        </h3>

                                        <div className="flex gap-4">
                                            <Button
                                                variant={legalRepMode === 'vneid' ? 'default' : 'outline'}
                                                onClick={() => setLegalRepMode('vneid')}
                                                className="flex-1"
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload ảnh CCCD từ VNeID
                                            </Button>
                                            <Button
                                                variant={legalRepMode === 'manual' ? 'default' : 'outline'}
                                                onClick={() => setLegalRepMode('manual')}
                                                className="flex-1"
                                            >
                                                Nhập tay
                                            </Button>
                                        </div>

                                        {legalRepMode === 'vneid' && (
                                            <div className="p-6 border-2 border-dashed rounded-lg text-center bg-blue-50/50">
                                                <Upload className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                                                <p className="font-medium mb-2">Tải lên ảnh CCCD 2 mặt</p>
                                                <p className="text-sm text-muted-foreground">Hệ thống sẽ tự động trích xuất thông tin</p>
                                                <Button variant="outline" className="mt-4">Chọn ảnh</Button>
                                            </div>
                                        )}

                                        {legalRepMode === 'manual' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Họ và tên *</Label>
                                                    <Input
                                                        value={legalRepName}
                                                        onChange={(e) => setLegalRepName(e.target.value.toUpperCase())}
                                                        placeholder="NGUYỄN VĂN A"
                                                        className={cn("h-12 border-2", showErrors && !legalRepName && "border-red-500 ring-red-500")}
                                                    />
                                                    {showErrors && !legalRepName && (
                                                        <p className="text-red-600 text-sm mt-1">Vui lòng nhập họ tên</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="font-bold">Chức vụ *</Label>
                                                        <Input
                                                            value={legalRepTitle}
                                                            onChange={(e) => setLegalRepTitle(e.target.value)}
                                                            placeholder="Giám đốc"
                                                            className={cn("h-12 border-2", showErrors && !legalRepTitle && "border-red-500 ring-red-500")}
                                                        />
                                                        {showErrors && !legalRepTitle && (
                                                            <p className="text-red-600 text-sm mt-1">Vui lòng nhập chức vụ</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-bold">Ngày sinh *</Label>
                                                        <Input
                                                            type="date"
                                                            value={legalRepDOB}
                                                            onChange={(e) => setLegalRepDOB(e.target.value)}
                                                            className={cn("h-12 border-2", showErrors && !legalRepDOB && "border-red-500 ring-red-500")}
                                                        />
                                                        {showErrors && !legalRepDOB && (
                                                            <p className="text-red-600 text-sm mt-1">Vui lòng chọn ngày sinh</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-bold">Dân tộc</Label>
                                                        <Input value="Kinh" disabled className="h-12 bg-gray-50" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-bold">Quốc tịch</Label>
                                                        <Input value="Việt Nam" disabled className="h-12 bg-gray-50" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-bold">Số CCCD/CMND *</Label>
                                                        <Input
                                                            value={legalRepIDNumber}
                                                            onChange={(e) => setLegalRepIDNumber(e.target.value)}
                                                            placeholder="001234567890"
                                                            className={cn("h-12 border-2", showErrors && (!legalRepIDNumber || !isValidIDNumber(legalRepIDNumber)) && "border-red-500 ring-red-500")}
                                                        />
                                                        {showErrors && !legalRepIDNumber && (
                                                            <p className="text-red-600 text-sm mt-1">Vui lòng nhập số CCCD/CMND</p>
                                                        )}
                                                        {showErrors && legalRepIDNumber && !isValidIDNumber(legalRepIDNumber) && (
                                                            <p className="text-red-600 text-sm mt-1">Số CCCD/CMND phải có 9 hoặc 12 chữ số</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-bold">Ngày cấp *</Label>
                                                        <Input
                                                            type="date"
                                                            value={legalRepIDDate}
                                                            onChange={(e) => setLegalRepIDDate(e.target.value)}
                                                            className={cn("h-12 border-2", showErrors && !legalRepIDDate && "border-red-500 ring-red-500")}
                                                        />
                                                        {showErrors && !legalRepIDDate && (
                                                            <p className="text-red-600 text-sm mt-1">Vui lòng chọn ngày cấp</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label className="font-bold">Nơi cấp *</Label>
                                                        <Input
                                                            value={legalRepIDPlace}
                                                            onChange={(e) => setLegalRepIDPlace(e.target.value)}
                                                            placeholder="Cục Cảnh sát ĐKQL cư trú..."
                                                            className={cn("h-12 border-2", showErrors && !legalRepIDPlace && "border-red-500 ring-red-500")}
                                                        />
                                                        {showErrors && !legalRepIDPlace && (
                                                            <p className="text-red-600 text-sm mt-1">Vui lòng nhập nơi cấp</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label className="font-bold">Địa chỉ thường trú *</Label>
                                                        <Textarea
                                                            value={legalRepPermanentAddress}
                                                            onChange={(e) => setLegalRepPermanentAddress(e.target.value)}
                                                            rows={2}
                                                            className={cn("resize-none border-2", showErrors && !legalRepPermanentAddress && "border-red-500 ring-red-500")}
                                                        />
                                                        {showErrors && !legalRepPermanentAddress && (
                                                            <p className="text-red-600 text-sm mt-1">Vui lòng nhập địa chỉ thường trú</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label className="font-bold">Địa chỉ liên hệ *</Label>
                                                        <Textarea
                                                            value={legalRepContactAddress}
                                                            onChange={(e) => setLegalRepContactAddress(e.target.value)}
                                                            rows={2}
                                                            className={cn("resize-none border-2", showErrors && !legalRepContactAddress && "border-red-500 ring-red-500")}
                                                        />
                                                        {showErrors && !legalRepContactAddress && (
                                                            <p className="text-red-600 text-sm mt-1">Vui lòng nhập địa chỉ liên hệ</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t pt-6" />

                                    {/* Chief Accountant */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold">Kế toán trưởng</h3>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="has-ca">Có đăng ký Kế toán trưởng?</Label>
                                                <Checkbox
                                                    id="has-ca"
                                                    checked={hasChiefAccountant}
                                                    onCheckedChange={(v) => setHasChiefAccountant(!!v)}
                                                />
                                            </div>
                                        </div>

                                        {hasChiefAccountant && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/30 rounded-lg">
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Họ và tên *</Label>
                                                    <Input
                                                        value={caName}
                                                        onChange={(e) => setCAName(e.target.value.toUpperCase())}
                                                        className={cn("h-12", showErrors && !isValidText(caName, 3) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                    />
                                                    {showErrors && !isValidText(caName, 3) && (
                                                        <p className="text-red-600 text-sm mt-1">Vui lòng nhập họ tên</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Ngày sinh *</Label>
                                                    <Input
                                                        type="date"
                                                        value={caDOB}
                                                        onChange={(e) => setCADOB(e.target.value)}
                                                        className={cn("h-12", showErrors && !caDOB && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                    />
                                                    {showErrors && !caDOB && (
                                                        <p className="text-red-600 text-sm mt-1">Vui lòng chọn ngày sinh</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Số CCCD *</Label>
                                                    <Input
                                                        value={caIDNumber}
                                                        onChange={(e) => setCAIDNumber(e.target.value)}
                                                        className={cn("h-12", showErrors && !isValidIDNumber(caIDNumber) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                    />
                                                    {showErrors && !isValidIDNumber(caIDNumber) && (
                                                        <p className="text-red-600 text-sm mt-1">Số CCCD phải có 9 hoặc 12 chữ số</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Ngày cấp *</Label>
                                                    <Input
                                                        type="date"
                                                        value={caIDDate}
                                                        onChange={(e) => setCAIDDate(e.target.value)}
                                                        className={cn("h-12", showErrors && !caIDDate && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                    />
                                                    {showErrors && !caIDDate && (
                                                        <p className="text-red-600 text-sm mt-1">Vui lòng chọn ngày cấp</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="font-bold">Nơi cấp *</Label>
                                                    <Input
                                                        value={caIDPlace}
                                                        onChange={(e) => setCAIDPlace(e.target.value)}
                                                        className={cn("h-12", showErrors && !caIDPlace && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                    />
                                                    {showErrors && !caIDPlace && (
                                                        <p className="text-red-600 text-sm mt-1">Vui lòng nhập nơi cấp</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="font-bold">Địa chỉ *</Label>
                                                    <Textarea
                                                        value={caAddress}
                                                        onChange={(e) => setCAAddress(e.target.value)}
                                                        rows={2}
                                                        className={cn("resize-none", showErrors && !isValidText(caAddress, 5) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                    />
                                                    {showErrors && !isValidText(caAddress, 5) && (
                                                        <p className="text-red-600 text-sm mt-1">Địa chỉ quá ngắn</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Merged Founders/Shareholders Logic into Step 5 */}
                                    {(businessType === 'tnhh2' || businessType === 'co-phan') && (
                                        <>
                                            <div className="border-t pt-6" />
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <Users className="h-6 w-6 text-blue-600" />
                                                    Sáng lập viên / Cổ đông
                                                </h3>
                                                <p className="text-sm text-muted-foreground -mt-4 mb-2">
                                                    Yêu cầu: {BUSINESS_TYPES.find(t => t.id === businessType)?.minMembers || 1}+ thành viên
                                                </p>
                                                {showErrors && founders.length < (BUSINESS_TYPES.find(t => t.id === businessType)?.minMembers || 1) && (
                                                    <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>Số lượng thành viên chưa đủ (tối thiểu {BUSINESS_TYPES.find(t => t.id === businessType)?.minMembers || 1})</span>
                                                    </div>
                                                )}
                                                {showErrors && Math.abs(founders.reduce((sum, f) => sum + f.ownershipPercentage, 0) - 100) > 0.01 && (
                                                    <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>Tổng tỷ lệ sở hữu phải bằng 100% (Hiện tại: {founders.reduce((sum, f) => sum + f.ownershipPercentage, 0).toFixed(2)}%)</span>
                                                    </div>
                                                )}

                                                {founders.length === 0 && (
                                                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                                        <p>Chưa có thành viên nào. Nhấn "Thêm thành viên" để bắt đầu.</p>
                                                    </div>
                                                )}

                                                {founders.map((founder, index) => (
                                                    <div key={founder.id} className="p-6 border-2 rounded-lg bg-slate-50 relative">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="font-bold text-lg">Thành viên #{index + 1}</h3>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeFounder(founder.id)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Xóa
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold">Họ và tên *</Label>
                                                                <Input
                                                                    value={founder.name}
                                                                    onChange={(e) => updateFounder(founder.id, 'name', e.target.value.toUpperCase())}
                                                                    placeholder="NGUYỄN VĂN A"
                                                                    className={cn(showErrors && !isValidText(founder.name, 3) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                                />
                                                                {showErrors && !isValidText(founder.name, 3) && (
                                                                    <p className="text-sm text-red-600 mt-1">Tên phải có ít nhất 3 ký tự</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold">Số CCCD *</Label>
                                                                <Input
                                                                    value={founder.idNumber}
                                                                    onChange={(e) => updateFounder(founder.id, 'idNumber', e.target.value)}
                                                                    placeholder="001234567890"
                                                                    className={cn(showErrors && !isValidIDNumber(founder.idNumber) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                                />
                                                                {showErrors && !isValidIDNumber(founder.idNumber) && (
                                                                    <p className="text-sm text-red-600 mt-1">Số CCCD phải có 9 hoặc 12 chữ số</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2 md:col-span-2">
                                                                <Label className="text-sm font-bold">Địa chỉ thường trú *</Label>
                                                                <Textarea
                                                                    value={founder.permanentAddress}
                                                                    onChange={(e) => updateFounder(founder.id, 'permanentAddress', e.target.value)}
                                                                    rows={2}
                                                                    className={cn("resize-none", showErrors && !isValidText(founder.permanentAddress, 5) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                                />
                                                                {showErrors && !isValidText(founder.permanentAddress, 5) && (
                                                                    <p className="text-sm text-red-600 mt-1">Địa chỉ quá ngắn (tối thiểu 5 ký tự)</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2 md:col-span-2">
                                                                <Label className="text-sm font-bold">Địa chỉ liên hệ *</Label>
                                                                <Textarea
                                                                    value={founder.contactAddress}
                                                                    onChange={(e) => updateFounder(founder.id, 'contactAddress', e.target.value)}
                                                                    rows={2}
                                                                    className={cn("resize-none", showErrors && !isValidText(founder.contactAddress, 5) && "border-red-500 ring-red-500 focus:ring-red-500")}
                                                                />
                                                                {showErrors && !isValidText(founder.contactAddress, 5) && (
                                                                    <p className="text-sm text-red-600 mt-1">Địa chỉ quá ngắn (tối thiểu 5 ký tự)</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold">Số vốn góp (VNĐ) *</Label>
                                                                <Input
                                                                    type="text"
                                                                    value={founder.capitalContribution.toLocaleString('vi-VN')}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                                        updateFounder(founder.id, 'capitalContribution', parseInt(value) || 0);
                                                                    }}
                                                                    placeholder="10,000,000"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold">Tỷ lệ sở hữu (%)</Label>
                                                                <div className="h-10 px-4 border rounded-md bg-blue-50 flex items-center font-bold text-blue-600">
                                                                    {founder.ownershipPercentage.toFixed(2)}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <Button
                                                    onClick={addFounder}
                                                    variant="outline"
                                                    className="w-full h-12 border-dashed border-2 hover:bg-blue-50"
                                                >
                                                    <UserPlus className="mr-2 h-5 w-5" />
                                                    Thêm thành viên
                                                </Button>

                                                {founders.length > 0 && (
                                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold">Tổng tỷ lệ sở hữu:</span>
                                                            <span className={cn(
                                                                "text-xl font-black",
                                                                Math.abs(founders.reduce((sum, f) => sum + f.ownershipPercentage, 0) - 100) < 0.01
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            )}>
                                                                {founders.reduce((sum, f) => sum + f.ownershipPercentage, 0).toFixed(2)}%
                                                            </span>
                                                        </div>
                                                        {Math.abs(founders.reduce((sum, f) => sum + f.ownershipPercentage, 0) - 100) >= 0.01 && (
                                                            <p className="text-sm text-red-600 mt-2">
                                                                Tổng tỷ lệ phải bằng 100%
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </Card>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(4)}
                                        className="h-14 px-8"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 7: Review Information (NEW - Was Step 10 logic) */}
                        {currentStep === 7 && (
                            <motion.div key="step7-review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-4xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Xác nhận thông tin</h2>
                                    <p className="text-muted-foreground">Kiểm tra lại toàn bộ thông tin đã cung cấp</p>
                                </div>

                                <Card className="overflow-hidden shadow-xl border-none">
                                    <div className="bg-brand-navy p-6 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-bold">THÔNG TIN ĐĂNG KÝ</h3>
                                            <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest">BƯỚC 7/10</p>
                                        </div>
                                        <FileText className="h-8 w-8 opacity-50" />
                                    </div>

                                    <div className="p-8 space-y-6 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Left Column */}
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Loại hình & Tên</p>
                                                    <p className="font-bold text-lg">{BUSINESS_TYPES.find(t => t.id === businessType)?.name}</p>
                                                    <p className="font-bold text-blue-800">{companyNameVi}</p>
                                                    <p className="text-sm text-gray-600 italic">{companyNameEn}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Địa chỉ trụ sở</p>
                                                    <p className="text-sm">{addressStreet}, {addressWard}, {addressDistrict}, {VIETNAM_PROVINCES.find(p => p.id === selectedProvince)?.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Liên hệ</p>
                                                    <p className="text-sm">{companyPhone}</p>
                                                    <p className="text-sm">{companyEmail}</p>
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Vốn & Nhân sự</p>
                                                    <p className="text-xl font-black text-blue-600">{charterCapital} VNĐ</p>
                                                    <p className="text-sm mt-1">Đại diện PL: <span className="font-bold">{legalRepName}</span> ({legalRepTitle})</p>
                                                </div>
                                                {founders.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Thành viên góp vốn</p>
                                                        <ul className="text-sm space-y-1">
                                                            {founders.map((f, i) => (
                                                                <li key={i}>{f.name}: {f.ownershipPercentage.toFixed(2)}%</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Ngành nghề</p>
                                                    <p className="text-sm line-clamp-3">{businessLines}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={() => setCurrentStep(6)} className="h-14 px-8">
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
                                    </Button>
                                    <Button onClick={() => setCurrentStep(8)} className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700">
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 7: Package Selection */}
                        {currentStep === 8 && (
                            <motion.div key="step7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-6xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Chọn gói dịch vụ</h2>
                                    <p className="text-muted-foreground">
                                        Lựa chọn gói phù hợp với nhu cầu của doanh nghiệp
                                        <br />
                                        <span className="text-sm font-semibold text-orange-600">(Lưu ý: Giá dịch vụ chưa bao gồm thuế GTGT)</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {PACKAGE_OPTIONS.map((pkg) => (
                                        <Card
                                            key={pkg.id}
                                            className={cn(
                                                "relative flex flex-col p-8 border-2 cursor-pointer transition-all hover:shadow-2xl",
                                                selectedPackageId === pkg.id ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50/30" : "hover:border-blue-200"
                                            )}
                                            onClick={() => setSelectedPackageId(pkg.id)}
                                        >
                                            {pkg.isPopular && (
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                                                    Phổ biến
                                                </div>
                                            )}
                                            <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                                            <p className="text-3xl font-black text-blue-600 mb-2">{formatCurrency(pkg.price)}</p>
                                            <p className="text-sm text-muted-foreground mb-6">{pkg.desc}</p>
                                            <ul className="space-y-3 mb-8 flex-grow">
                                                {pkg.features.map((f, i) => (
                                                    <li key={i} className="text-sm flex gap-2 font-medium">
                                                        <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                variant={selectedPackageId === pkg.id ? "default" : "outline"}
                                                className={cn("w-full h-12 font-bold", selectedPackageId === pkg.id && "bg-blue-600")}
                                            >
                                                {selectedPackageId === pkg.id ? "Đã chọn" : "Chọn gói này"}
                                            </Button>
                                        </Card>
                                    ))}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(7)}
                                        className="h-14 px-8"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentStep(9)}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 9: Payer Information */}
                        {currentStep === 9 && (
                            <motion.div key="step9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-3xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Thông tin người nộp tiền</h2>
                                    <p className="text-muted-foreground">Thông tin xuất hóa đơn và liên hệ thanh toán</p>
                                </div>

                                <Card className="p-8 space-y-6">
                                    <div className="flex items-center space-x-2 pb-4 border-b">
                                        <Checkbox
                                            id="same-as-rep"
                                            checked={payerSameAsLegalRep}
                                            onCheckedChange={(checked) => {
                                                setPayerSameAsLegalRep(!!checked);
                                                if (checked) {
                                                    setPayerName(legalRepName);
                                                    setPayerIDNumber(legalRepIDNumber);
                                                } else {
                                                    setPayerName("");
                                                    setPayerIDNumber("");
                                                }
                                            }}
                                        />
                                        <Label htmlFor="same-as-rep">Giống thông tin người đại diện pháp luật</Label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-bold">Họ và tên *</Label>
                                            <Input value={payerName} onChange={(e) => setPayerName(e.target.value.toUpperCase())} placeholder="NGUYỄN VĂN A" />
                                            {payerName && !isValidText(payerName, 3) && (
                                                <p className="text-sm text-red-600 mt-1">Tên phải có ít nhất 3 ký tự</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">Số điện thoại *</Label>
                                            <Input value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} placeholder="0912345678" />
                                            {payerPhone && !isValidPhone(payerPhone) && (
                                                <p className="text-sm text-red-600 mt-1">Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">Email *</Label>
                                            <Input value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} placeholder="email@example.com" />
                                            {payerEmail && !isValidEmail(payerEmail) && (
                                                <p className="text-sm text-red-600 mt-1">Email không đúng định dạng</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">MST / CCCD *</Label>
                                            <Input value={payerIDNumber} onChange={(e) => setPayerIDNumber(e.target.value)} placeholder="0101234567" />
                                            {payerIDNumber && !isValidIDNumber(payerIDNumber) && (
                                                <p className="text-sm text-red-600 mt-1">Mã số phải có 9 hoặc 12 chữ số</p>
                                            )}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="font-bold">Địa chỉ xuất hóa đơn *</Label>
                                            <Textarea value={payerAddress} onChange={(e) => setPayerAddress(e.target.value)} rows={2} />
                                            {payerAddress && !isValidText(payerAddress, 5) && (
                                                <p className="text-sm text-red-600 mt-1">Địa chỉ quá ngắn (tối thiểu 5 ký tự)</p>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(8)}
                                        className="h-14 px-8"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentStep(10)}
                                        disabled={
                                            !isValidText(payerName, 3) ||
                                            !isValidPhone(payerPhone) ||
                                            !isValidEmail(payerEmail) ||
                                            !isValidIDNumber(payerIDNumber) ||
                                            !isValidText(payerAddress, 5)
                                        }
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 10: Confirmation & Payment */}
                        {currentStep === 10 && (
                            <motion.div key="step8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-4xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Xác nhận thông tin</h2>
                                    <p className="text-muted-foreground">Kiểm tra lại thông tin trước khi thanh toán</p>
                                </div>

                                <Card className="overflow-hidden shadow-2xl border-none">
                                    <div className="bg-brand-navy p-8 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-bold">PHIẾU ĐĂNG KÝ</h3>
                                            <p className="text-blue-200 text-sm mt-1 uppercase tracking-widest">Hệ thống CONTI 24/7</p>
                                        </div>
                                        <FileText className="h-12 w-12 opacity-50" />
                                    </div>

                                    <div className="p-8 space-y-6 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Simplified Step 10: Payment Selection only */}
                                            <div className="space-y-4 md:col-span-2">
                                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                                                    <p className="text-xl font-bold text-blue-800">TỔNG THANH TOÁN</p>
                                                    <p className="text-4xl font-black text-blue-600 mt-2">{formatCurrency(selectedPackage.price)}</p>
                                                    <p className="text-sm text-blue-600 mt-1">(Đã bao gồm lệ phí nhà nước)</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-6 space-y-4">
                                            <h3 className="font-bold text-sm uppercase text-muted-foreground">Phương thức thanh toán</h3>
                                            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'qr' | 'transfer')}>
                                                <div className={cn("p-4 border rounded-lg flex items-center space-x-3 cursor-pointer transition-all", paymentMethod === 'qr' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50')}>
                                                    <RadioGroupItem value="qr" id="pay-qr" />
                                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                        <QrCode className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label htmlFor="pay-qr" className="font-bold cursor-pointer text-base">Thanh toán qua mã QR (SePay)</Label>
                                                        <p className="text-sm text-green-600 font-medium">Xác nhận tự động trong 5 giây</p>
                                                    </div>
                                                </div>
                                                <div className={cn("p-4 border rounded-lg flex items-center space-x-3 cursor-pointer transition-all", paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50')}>
                                                    <RadioGroupItem value="transfer" id="pay-manual" />
                                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                        <CreditCard className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label htmlFor="pay-manual" className="font-bold cursor-pointer text-base">Chuyển khoản thủ công</Label>
                                                        <p className="text-sm text-muted-foreground">Nhân viên sẽ xác nhận sau 15 phút</p>
                                                    </div>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="border-t pt-6 flex items-start gap-3">
                                            <Checkbox
                                                id="terms"
                                                checked={isAgreed}
                                                onCheckedChange={(v) => setIsAgreed(!!v)}
                                                className="mt-1 data-[state=checked]:bg-blue-600"
                                            />
                                            <Label htmlFor="terms" className="text-sm leading-relaxed text-slate-600 font-medium cursor-pointer">
                                                Tôi xác nhận các thông tin trên là chính xác và đồng ý với các{' '}
                                                <span className="text-blue-600 underline">điều khoản dịch vụ</span> của CONTI.
                                            </Label>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentStep(9)}
                                                className="h-16 px-8 rounded-2xl"
                                                type="button"
                                            >
                                                <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
                                            </Button>
                                            <Button
                                                onClick={handleSubmitFinal}
                                                disabled={isSubmitting || !isAgreed}
                                                className="flex-1 h-16 bg-blue-600 hover:bg-blue-700 text-xl font-bold rounded-2xl shadow-xl"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="mr-2 h-6 w-6" />
                                                        Thanh toán & Gửi hồ sơ
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* SUCCESS SCREEN */}
                        {currentStep === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-16 space-y-10 max-w-2xl mx-auto"
                            >
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-xl">
                                    <Check className="h-12 w-12" />
                                </div>

                                <div className="space-y-4">
                                    <h1 className="text-4xl font-display font-bold text-brand-navy">Gửi hồ sơ thành công!</h1>
                                    <p className="text-xl text-muted-foreground leading-relaxed">
                                        Yêu cầu của bạn đã được tiếp nhận. Chuyên viên CONTI sẽ liên hệ tư vấn trong vòng 30 phút làm việc.
                                    </p>
                                </div>

                                <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl inline-block">
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Mã tham chiếu hồ sơ</p>
                                    <p className="text-4xl font-display font-black text-blue-900 tracking-tighter">{referenceNumber}</p>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 px-12 h-14 font-bold rounded-xl shadow-lg">
                                        <Link to="/">Quay về Trang chủ</Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="px-12 h-14 font-bold rounded-xl hover:bg-blue-50 border-blue-200 text-blue-600">
                                        <Link to="/portal">Xem tiến độ</Link>
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main >
            <Footer />
            <Toaster richColors closeButton />
        </div >
    );
}
