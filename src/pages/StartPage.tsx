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
    CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { CompanyRegistrySearch } from "@/components/CompanyRegistrySearch";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatting";

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'success';
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
    },
    {
        id: 'tnhh2' as BusinessType,
        name: 'Công ty TNHH 2 Thành viên trở lên',
        description: 'Limited Liability Company - Multiple Members',
        minMembers: 2,
        maxMembers: 50,
    },
    {
        id: 'co-phan' as BusinessType,
        name: 'Công ty Cổ phần',
        description: 'Joint Stock Company',
        minMembers: 3,
        maxMembers: Infinity,
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

    // Step 1: Business Type
    const [businessType, setBusinessType] = useState<BusinessType | null>(null);

    // Step 2: Company Naming
    const [companyNameVi, setCompanyNameVi] = useState("");
    const [companyNameEn, setCompanyNameEn] = useState("");
    const [abbreviation, setAbbreviation] = useState("");
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

    // Step 3: Contact & Headquarters
    const [address, setAddress] = useState("");
    const [phone3, setPhone3] = useState("");
    const [email3, setEmail3] = useState("");
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
    const [referenceNumber, setReferenceNumber] = useState("");
    const [registryCloseSignal, setRegistryCloseSignal] = useState<number>(0);

    const totalSteps = 8;
    const progressValue = currentStep === 'success' ? 100 : (Number(currentStep) / totalSteps) * 100;

    // Auto-translate Vietnamese name to English
    const handleTranslateName = async () => {
        if (!companyNameVi.trim()) return;

        // Simple fallback: just uppercase the Vietnamese name
        // In production, this would call an LLM API
        const translated = companyNameVi.toUpperCase();
        setCompanyNameEn(translated);
        toast.info("Tên tiếng Anh đã được tự động điền. Bạn có thể chỉnh sửa.");
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
            toast.error("Lỗi khi kiểm tra tên");
            setNameAvailable(null);
        } finally {
            setIsCheckingName(false);
        }
    };

    // Check address for warnings
    useEffect(() => {
        const keywords = ['chung cư', 'chung cu', 'tập thể', 'tap the'];
        const hasKeyword = keywords.some(kw => address.toLowerCase().includes(kw));
        setAddressWarning(hasKeyword);
    }, [address]);

    // Auto-calculate founder percentages
    useEffect(() => {
        const capital = parseFloat(charterCapital.replace(/,/g, '')) || 0;
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
        return Math.abs(totalPercentage - 100) < 0.01; // Account for floating point errors
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
            const payload = {
                businessType,
                companyNameVi,
                companyNameEn,
                abbreviation,
                address,
                phone: phone3,
                email: email3,
                website,
                fax,
                businessLines,
                vatMethod,
                charterCapital: parseFloat(charterCapital.replace(/,/g, '')) || 0,
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
            };

            // Mock submission - replace with actual API call
            console.log('[SUBMIT]', payload);
            await new Promise(resolve => setTimeout(resolve, 2000));

            const ref = `CONTI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            setReferenceNumber(ref);
            setCurrentStep('success');
            toast.success("Gửi hồ sơ thành công!");
        } catch (error) {
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
                        {/* STEP 1: Choose Business Type */}
                        {currentStep === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 max-w-5xl mx-auto">
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
                                            <div className="text-sm">
                                                <p className="font-medium">
                                                    Số thành viên: {type.minMembers === type.maxMembers ? type.minMembers : `${type.minMembers}-${type.maxMembers === Infinity ? 'Không giới hạn' : type.maxMembers}`}
                                                </p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={() => setCurrentStep(2)}
                                        disabled={!businessType}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Company Naming */}
                        {currentStep === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-3xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Thông tin tên Công ty</h2>
                                    <p className="text-muted-foreground">Đặt tên riêng biệt và dễ nhận diện cho doanh nghiệp</p>
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
                                                className="h-14 text-lg font-bold pr-32"
                                            />
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
                                            className="h-14 text-lg"
                                        />
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

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={() => setCurrentStep(3)}
                                        disabled={!nameAvailable || !companyNameVi || !companyNameEn}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Contact & Headquarters */}
                        {currentStep === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-3xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Trụ sở chính</h2>
                                    <p className="text-muted-foreground">Thông tin liên hệ và địa chỉ trụ sở</p>
                                </div>

                                <Card className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Địa chỉ *</Label>
                                        <Textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                            rows={3}
                                            className="resize-none"
                                        />
                                        {addressWarning && (
                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex gap-2">
                                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                <div>
                                                    <strong>Lưu ý:</strong> Trụ sở không được phép là nhà tập thể, nhà chung cư. Nếu là nhà riêng có số phòng, cần Giấy chứng nhận QSDĐ.
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-bold">Điện thoại *</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="tel"
                                                    value={phone3}
                                                    onChange={(e) => setPhone3(e.target.value)}
                                                    placeholder="09xx xxx xxx"
                                                    className="h-12 pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="font-bold">Email *</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    value={email3}
                                                    onChange={(e) => setEmail3(e.target.value)}
                                                    placeholder="contact@company.com"
                                                    className="h-12 pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-bold">Website (tùy chọn)</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    value={website}
                                                    onChange={(e) => setWebsite(e.target.value)}
                                                    placeholder="www.company.com"
                                                    className="h-12 pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="font-bold">Fax (tùy chọn)</Label>
                                            <div className="relative">
                                                <Printer className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    value={fax}
                                                    onChange={(e) => setFax(e.target.value)}
                                                    placeholder="024 xxxx xxxx"
                                                    className="h-12 pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={() => {
                                            console.log('[Step 3] Continue clicked', { address, phone3, email3 });
                                            setCurrentStep(4);
                                        }}
                                        disabled={!address || !phone3 || !email3}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Business Details */}
                        {currentStep === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-3xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Ngành nghề & Thuế</h2>
                                    <p className="text-muted-foreground">Lĩnh vực hoạt động và phương pháp tính thuế</p>
                                </div>

                                <Card className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Ngành nghề kinh doanh *</Label>
                                        <Textarea
                                            value={businessLines}
                                            onChange={(e) => setBusinessLines(e.target.value)}
                                            placeholder="Liệt kê lĩnh vực hoạt động theo từ ngữ thông thường, VD: Thương mại điện tử, Tư vấn quản trị, Phát triển phần mềm..."
                                            rows={5}
                                            className="resize-none"
                                        />
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

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={() => setCurrentStep(5)}
                                        disabled={!businessLines.trim()}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
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
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="font-bold">Thời điểm hoàn thành góp vốn *</Label>
                                                <Input
                                                    type="date"
                                                    value={capitalCompletionDate}
                                                    onChange={(e) => setCapitalCompletionDate(e.target.value)}
                                                    className="h-12"
                                                />
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Họ và tên *</Label>
                                                    <Input
                                                        value={legalRepName}
                                                        onChange={(e) => setLegalRepName(e.target.value.toUpperCase())}
                                                        placeholder="NGUYỄN VĂN A"
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Chức vụ *</Label>
                                                    <Input
                                                        value={legalRepTitle}
                                                        onChange={(e) => setLegalRepTitle(e.target.value)}
                                                        placeholder="Giám đốc"
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Ngày sinh *</Label>
                                                    <Input
                                                        type="date"
                                                        value={legalRepDOB}
                                                        onChange={(e) => setLegalRepDOB(e.target.value)}
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Dân tộc</Label>
                                                    <Input
                                                        value={legalRepEthnicity}
                                                        onChange={(e) => setLegalRepEthnicity(e.target.value)}
                                                        placeholder="Kinh"
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Số CCCD/CMND *</Label>
                                                    <Input
                                                        value={legalRepIDNumber}
                                                        onChange={(e) => setLegalRepIDNumber(e.target.value)}
                                                        placeholder="001234567890"
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Ngày cấp *</Label>
                                                    <Input
                                                        type="date"
                                                        value={legalRepIDDate}
                                                        onChange={(e) => setLegalRepIDDate(e.target.value)}
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="font-bold">Nơi cấp *</Label>
                                                    <Input
                                                        value={legalRepIDPlace}
                                                        onChange={(e) => setLegalRepIDPlace(e.target.value)}
                                                        placeholder="Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="font-bold">Địa chỉ thường trú *</Label>
                                                    <Textarea
                                                        value={legalRepPermanentAddress}
                                                        onChange={(e) => setLegalRepPermanentAddress(e.target.value)}
                                                        rows={2}
                                                        className="resize-none"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="font-bold">Địa chỉ liên hệ *</Label>
                                                    <Textarea
                                                        value={legalRepContactAddress}
                                                        onChange={(e) => setLegalRepContactAddress(e.target.value)}
                                                        rows={2}
                                                        className="resize-none"
                                                    />
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
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Ngày sinh *</Label>
                                                    <Input
                                                        type="date"
                                                        value={caDOB}
                                                        onChange={(e) => setCADOB(e.target.value)}
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Số CCCD *</Label>
                                                    <Input
                                                        value={caIDNumber}
                                                        onChange={(e) => setCAIDNumber(e.target.value)}
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Ngày cấp *</Label>
                                                    <Input
                                                        type="date"
                                                        value={caIDDate}
                                                        onChange={(e) => setCAIDDate(e.target.value)}
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="font-bold">Nơi cấp *</Label>
                                                    <Input
                                                        value={caIDPlace}
                                                        onChange={(e) => setCAIDPlace(e.target.value)}
                                                        className="h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="font-bold">Địa chỉ *</Label>
                                                    <Textarea
                                                        value={caAddress}
                                                        onChange={(e) => setCAAddress(e.target.value)}
                                                        rows={2}
                                                        className="resize-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={() => setCurrentStep(6)}
                                        disabled={!charterCapital || !capitalCompletionDate || !legalRepName}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 6: Founders/Shareholders */}
                        {currentStep === 6 && (
                            <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-5xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Sáng lập viên / Cổ đông</h2>
                                    <p className="text-muted-foreground">
                                        Thông tin các thành viên góp vốn
                                        {businessType && ` - Yêu cầu: ${BUSINESS_TYPES.find(t => t.id === businessType)?.minMembers || 1}+ thành viên`}
                                    </p>
                                </div>

                                <Card className="p-8 space-y-6">
                                    {founders.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
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
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold">Số CCCD *</Label>
                                                    <Input
                                                        value={founder.idNumber}
                                                        onChange={(e) => updateFounder(founder.id, 'idNumber', e.target.value)}
                                                        placeholder="001234567890"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="text-sm font-bold">Địa chỉ thường trú *</Label>
                                                    <Textarea
                                                        value={founder.permanentAddress}
                                                        onChange={(e) => updateFounder(founder.id, 'permanentAddress', e.target.value)}
                                                        rows={2}
                                                        className="resize-none"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="text-sm font-bold">Địa chỉ liên hệ *</Label>
                                                    <Textarea
                                                        value={founder.contactAddress}
                                                        onChange={(e) => updateFounder(founder.id, 'contactAddress', e.target.value)}
                                                        rows={2}
                                                        className="resize-none"
                                                    />
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
                                </Card>

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={() => setCurrentStep(7)}
                                        disabled={!isFoundersValid()}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 7: Package Selection */}
                        {currentStep === 7 && (
                            <motion.div key="step7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-6xl mx-auto">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-brand-navy">Chọn gói dịch vụ</h2>
                                    <p className="text-muted-foreground">Lựa chọn gói phù hợp với nhu cầu của doanh nghiệp</p>
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

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={() => setCurrentStep(8)}
                                        className="h-14 px-16 bg-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700"
                                    >
                                        Xem tóm tắt & Thanh toán <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 8: Confirmation & Payment */}
                        {currentStep === 8 && (
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
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Loại hình</p>
                                                    <p className="font-bold">{BUSINESS_TYPES.find(t => t.id === businessType)?.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Tên công ty</p>
                                                    <p className="font-bold">{companyNameVi}</p>
                                                    <p className="text-sm text-muted-foreground italic">{companyNameEn}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Địa chỉ trụ sở</p>
                                                    <p className="text-sm">{address}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Liên hệ</p>
                                                    <p className="text-sm">{phone3} • {email3}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Vốn điều lệ</p>
                                                    <p className="text-2xl font-black text-blue-600">{charterCapital} VNĐ</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Số thành viên</p>
                                                    <p className="font-bold">{founders.length} thành viên</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Người đại diện</p>
                                                    <p className="font-bold">{legalRepName}</p>
                                                    <p className="text-sm text-muted-foreground">{legalRepTitle}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-lg border">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Gói dịch vụ</p>
                                                    <p className="font-bold">{selectedPackage.name}</p>
                                                    <p className="text-2xl font-black text-blue-600 mt-1">{formatCurrency(selectedPackage.price)}</p>
                                                </div>
                                            </div>
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

                                        <Button
                                            onClick={handleSubmitFinal}
                                            disabled={isSubmitting || !isAgreed}
                                            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-xl font-bold rounded-2xl shadow-xl"
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
            </main>
            <Footer />
            <Toaster richColors closeButton />
        </div>
    );
}
