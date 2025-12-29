import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/formatting";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Package, 
  User, 
  Building2, 
  Star, 
  Info 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Application } from "@shared/types";
import { api } from "@/lib/api-client";
const MOCK_TOKEN = "mock_auth_token_conti";
const mockActivities = [
  { id: 1, type: 'payment', title: 'Tiếp nhận hồ sơ đăng ký', status: 'success', time: 'Vừa xong' },
  { id: 2, type: 'file', title: 'Xác minh thông tin địa chỉ', status: 'pending', time: 'Hệ thống tự động' },
];
export default function ClientPortalPage() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => !!localStorage.getItem(MOCK_TOKEN));
  const [email, setEmail] = React.useState("demo@conti.com");
  const [password, setPassword] = React.useState("password");
  const [searchRef, setSearchRef] = React.useState("");
  const [activeApplication, setActiveApplication] = React.useState<Application | null>(null);
  const [isLoadingApp, setIsLoadingApp] = React.useState(false);
  const fetchApplication = React.useCallback(async (id: string) => {
    setIsLoadingApp(true);
    try {
      const data = await api<Application>(`/api/applications/${id}`);
      setActiveApplication(data);
      setIsLoggedIn(true);
      localStorage.setItem(MOCK_TOKEN, "true");
      toast.success("Đã tìm thấy hồ sơ của bạn!");
    } catch (err) {
      toast.error("Không tìm thấy hồ sơ với mã số này.");
    } finally {
      setIsLoadingApp(false);
    }
  }, []);
  React.useEffect(() => {
    const lastRef = localStorage.getItem("conti_last_ref");
    if (lastRef && !activeApplication) {
      fetchApplication(lastRef);
    }
  }, [fetchApplication, activeApplication]);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "demo@conti.com" && password === "password") {
      localStorage.setItem(MOCK_TOKEN, "true");
      setIsLoggedIn(true);
      toast.success("Đăng nhập demo thành công!");
    } else {
      toast.error("Sai tài khoản demo.");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem(MOCK_TOKEN);
    setIsLoggedIn(false);
    setActiveApplication(null);
    toast.info("Đã đăng xuất.");
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      fetchApplication(searchRef.trim().toUpperCase());
    }
  };
  const progressValueMap = {
    'pending': 25,
    'processing': 75,
    'approved': 100,
    'rejected': 0
  };
  const packagePrices: Record<string, number> = {
    'co-ban': 4200000,
    'vuon-cao': 5000000,
    'nang-tam': 6000000
  };
  const legalFormLabels: Record<string, string> = {
    'tnhh1': 'TNHH 1 Thành viên',
    'tnhh2': 'TNHH 2+ Thành viên',
    'co-phan': 'Công ty Cổ phần'
  };
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {!isLoggedIn ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
              <Card className="shadow-2xl border-none overflow-hidden">
                <CardHeader className="text-center pb-2 bg-slate-50 border-b">
                  <div className="mx-auto bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                    <LayoutDashboard className="text-white h-8 w-8" />
                  </div>
                  <CardTitle className="text-3xl font-display font-black text-brand-navy">CONTI Portal</CardTitle>
                  <CardDescription className="text-base">Quản lý hồ sơ doanh nghiệp 100% online.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <Label className="font-bold text-sm uppercase text-slate-500 tracking-wider">Tra cứu hồ sơ bằng mã số</Label>
                    <div className="flex gap-2">
                      <Input placeholder="VD: CONTI-XXXXX" value={searchRef} onChange={(e) => setSearchRef(e.target.value)} className="h-12 border-blue-100" />
                      <Button type="submit" disabled={isLoadingApp} className="bg-brand-navy h-12 px-6">
                        {isLoadingApp ? <Clock className="animate-spin h-5 w-5" /> : "Tra cứu"}
                      </Button>
                    </div>
                  </form>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Hoặc</span></div>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold">Email Demo</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 font-bold rounded-xl shadow-lg">Đăng nhập ngay</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-black font-display text-brand-navy uppercase leading-tight">
                      {activeApplication?.fullName || "CÔNG TY TNHH ĐẦU TƯ CONTI"}
                    </h1>
                    {activeApplication && <Badge className="bg-blue-600 uppercase text-[10px] tracking-widest shrink-0">{legalFormLabels[activeApplication.legalForm]}</Badge>}
                  </div>
                  <p className="text-muted-foreground font-bold tracking-tight uppercase text-sm">
                    REF: {activeApplication?.id || "CONT-DEMO-2025"} — Chủ sở hữu: {activeApplication?.contactName || "NGUYỄN VĂN A"}
                  </p>
                  {activeApplication?.businessLines && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activeApplication.businessLines.map(l => (
                        <Badge
                          key={l.code}
                          variant="secondary"
                          className={cn(
                            "text-[10px] uppercase font-bold",
                            l.code === activeApplication.primaryLineCode ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {l.code === activeApplication.primaryLineCode && <Star className="h-2 w-2 mr-1 fill-current" />}
                          {l.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={handleLogout} className="h-12 px-6 font-bold border-red-100 text-red-600 hover:bg-red-50 rounded-xl shrink-0">
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </Button>
              </div>
              {activeApplication?.fullNameEn && (
                <div className="bg-slate-900 text-slate-300 px-6 py-4 rounded-xl text-sm italic flex items-center gap-3 border-l-4 border-blue-500">
                  <Building2 className="h-5 w-5 text-blue-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">International Registration Name</span>
                    <span className="font-bold text-white uppercase text-base tracking-tight">{activeApplication.fullNameEn}</span>
                  </div>
                </div>
              )}
              {activeApplication?.confirmedConditions && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-xs font-bold uppercase tracking-wider text-blue-700">Lưu ý tuân thủ</AlertTitle>
                  <AlertDescription className="text-sm text-blue-800">
                    Doanh nghiệp đăng ký một số ngành nghề có điều kiện. Hệ thống đang chuẩn bị danh mục các giấy phép con cần thiết.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Tổng phí", value: formatCurrency(activeApplication ? (packagePrices[activeApplication.selectedPackageId] || 0) : 5000000), icon: <FileText className="h-6 w-6" /> },
                  { label: "Việc cần xử lý", value: "01", icon: <Clock className="h-6 w-6" /> },
                  { label: "Trạng thái", value: activeApplication?.status === 'pending' ? 'Chờ duyệt' : 'Đang xử lý', icon: <Package className="h-6 w-6" /> },
                  { label: "Chuyên viên", value: "Tú Phạm", icon: <User className="h-6 w-6" /> },
                ].map((stat, i) => (
                  <Card key={i} className="border-none bg-white shadow-sm border">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black mt-2 text-brand-navy">{stat.value}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">{stat.icon}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 shadow-sm border-blue-50 overflow-hidden">
                  <CardHeader className="pb-2 bg-slate-50 border-b">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-brand-navy">
                      <LayoutDashboard className="h-6 w-6 text-blue-500" />
                      Tiến độ thực hiện pháp lý
                    </CardTitle>
                    <CardDescription className="text-base">Mục tiêu: Hoàn tất toàn bộ thủ tục trong 7 ngày làm việc.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <div>
                      <div className="flex justify-between mb-3 items-end">
                        <span className="text-sm font-bold text-brand-navy">Mức độ hoàn thành</span>
                        <span className="text-xl font-black text-blue-600">{activeApplication ? (progressValueMap[activeApplication.status as keyof typeof progressValueMap] ?? 25) : 25}%</span>
                      </div>
                      <Progress value={activeApplication ? (progressValueMap[activeApplication.status as keyof typeof progressValueMap] ?? 25) : 25} className="h-4 bg-slate-100" />
                    </div>
                    <div className="space-y-4">
                      {[
                        { step: "Tiếp nhận và kiểm tra hồ sơ", status: "success" },
                        { step: "Soạn thảo hồ sơ pháp lý chi tiết", status: activeApplication?.status === 'pending' ? 'progress' : 'success' },
                        { step: "Nộp hồ sơ lên Sở Kế hoạch & Đầu tư", status: activeApplication?.status === 'pending' ? 'pending' : 'progress' },
                        { step: "Bàn giao Giấy phép & Con dấu", status: "pending" },
                      ].map((item, idx) => (
                        <div key={idx} className={cn(
                          "flex items-center justify-between p-5 rounded-2xl border transition-all",
                          item.status === 'progress' ? "border-blue-200 bg-blue-50/30 ring-1 ring-blue-100" : "border-slate-50 bg-white"
                        )}>
                          <div className="flex items-center gap-4">
                            {item.status === 'success' ? (
                              <div className="bg-emerald-100 p-1.5 rounded-full"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                            ) : item.status === 'progress' ? (
                              <div className="bg-blue-100 p-1.5 rounded-full animate-pulse"><Clock className="h-5 w-5 text-blue-600" /></div>
                            ) : (
                              <div className="h-8 w-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-300">{idx + 1}</div>
                            )}
                            <span className={cn(
                              "text-base font-bold",
                              item.status === 'success' ? 'line-through text-muted-foreground font-medium' : 'text-slate-700'
                            )}>
                              {item.step}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "px-3 py-1 font-bold border-none",
                              item.status === 'success' && "bg-emerald-50 text-emerald-600",
                              item.status === 'progress' && "bg-blue-600 text-white",
                              item.status === 'pending' && "bg-slate-100 text-slate-400"
                            )}
                          >
                            {item.status === 'success' ? 'Xong' : item.status === 'progress' ? 'Đang chạy' : 'Chờ'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-6">
                  <Card className="shadow-sm border-blue-50">
                    <CardHeader className="bg-slate-50 border-b py-4">
                      <CardTitle className="text-xl font-bold">Gói dịch vụ</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Gói đã chọn</p>
                        <p className="text-lg font-black text-brand-navy mt-1">
                          {activeApplication?.selectedPackageId === 'co-ban' ? "Gói Cơ bản" :
                           activeApplication?.selectedPackageId === 'vuon-cao' ? "Gói Vươn cao" :
                           activeApplication?.selectedPackageId === 'nang-tam' ? "Gói Nâng tầm" : "Gói Tùy chỉnh"}
                        </p>
                        <p className="text-sm font-bold text-blue-700 mt-2">{formatCurrency(activeApplication ? (packagePrices[activeApplication.selectedPackageId] || 0) : 0)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm border-blue-50 overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b py-4">
                      <CardTitle className="text-xl font-bold">Thông báo</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-50">
                        {mockActivities.map((act) => (
                          <div key={act.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4 items-start">
                            <div className={cn(
                              "mt-1.5 h-2.5 w-2.5 rounded-full shrink-0",
                              act.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                            )} />
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-slate-700">{act.title}</p>
                              <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">{act.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
