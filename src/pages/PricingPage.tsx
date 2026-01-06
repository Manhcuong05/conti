import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";
import { PRICING_TIERS } from "@shared/mock-data";
import { Link } from "react-router-dom";
function ContiPricingTable() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {PRICING_TIERS.map((tier) => (
        <Card key={tier.id} id={tier.id} className={cn(
          "flex flex-col transition-all duration-300 ease-in-out hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 hover:shadow-2xl hover:scale-[1.02] bg-card",
          tier.isFeatured ? "border-blue-500 ring-2 ring-blue-500 shadow-xl z-10 scale-105" : "shadow-sm border-slate-200"
        )}>
          <CardHeader className="pb-8">
            <div className="flex justify-between items-start mb-4">
                <CardTitle className="text-2xl font-black font-display text-brand-navy">{tier.name}</CardTitle>
                {tier.isFeatured && <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">Hot</span>}
            </div>
            <CardDescription className="flex flex-col gap-1">
              <span className="text-4xl font-black text-brand-navy">{formatCurrency(tier.priceVND)}</span>
              <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">{tier.priceSuffix}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-8">
            <ul className="space-y-4">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600 text-sm font-medium leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild className={cn(
              "w-full h-14 font-black uppercase tracking-widest rounded-xl transition-all shadow-md",
              tier.isFeatured ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
            )}>
              <Link to="/start" state={{ packageId: tier.id }}>
                Chọn lộ trình
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
export default function PricingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-20 lg:py-24 text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-display font-black text-brand-navy uppercase tracking-tighter">Bảng giá CONTI</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium">
              Minh bạch tuyệt đối. Không phí ẩn. Chọn gói phù hợp để khởi tạo doanh nghiệp số của bạn ngay hôm nay.
            </p>
          </div>
          <div className="pb-20 md:pb-32 lg:pb-40">
            <ContiPricingTable />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}