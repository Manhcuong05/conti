import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { BriefcaseBusiness, Github, Linkedin, Twitter } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
export function Footer() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await api("/api/telegram/notify", { method: "POST", body: JSON.stringify({ type: "consultation", email }) });
      toast.success("Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm.");
      setEmail("");
    } catch (error) {
      toast.error("Đăng ký không thành công. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <footer className="bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold font-display text-foreground">
              <BriefcaseBusiness className="h-8 w-8 text-primary" />
              <span>CONTI</span>
            </Link>
            <p className="mt-4 text-muted-foreground">
              CONTI - Giải pháp lập và vận hành doanh nghiệp tối ưu cho SME và Startup.
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold text-foreground">Dịch vụ</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/pricing" className="text-muted-foreground hover:text-blue-600">Thành lập doanh nghiệp</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-blue-600">Kế toán & Thuế</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold text-foreground">Công ty</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-blue-600">Về chúng tôi</Link></li>
              <li><Link to="/resources" className="text-muted-foreground hover:text-blue-600">Tài nguyên</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-blue-600">Bảng giá</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold text-foreground">Liên hệ</h3>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Email: Conti24h@gmail.com</p>
              <p className="text-sm text-muted-foreground">ĐT: 0989103873</p>
            </div>
          </div>
          <div className="md:col-span-3">
            <h3 className="font-semibold text-foreground">Đăng ký nhận tư vấn</h3>
            <p className="mt-4 text-muted-foreground">Để lại email, chúng tôi sẽ liên hệ tư vấn miễn phí.</p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <Input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
                {isLoading ? "..." : "Đăng ký"}
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} CONTI. All rights reserved.</p>
          <p className="mt-1">Built with ❤️ at AdFlex</p>
        </div>
      </div>
    </footer>
  );
}
