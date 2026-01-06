import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, ShieldCheck, Wallet, Zap, Briefcase, Calculator } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ServiceCard, ServiceCardProps } from "@/components/ServiceCard";
import { motion } from "framer-motion";
const valueProps = [
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: "100% Quy trình số hóa",
    description: "Tạm biệt những chồng hồ sơ dày cộm. Ký số, nộp hồ sơ và theo dõi quá trình hoàn thành tài liệu doanh nghiệp hoàn toàn online.",
  },
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: "Giá trọn gói, minh bạch",
    description: "Không phí ẩn. Bạn biết chính xác mình trả bao nhiêu cho từng dịch vụ ngay từ đầu.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Tuân thủ luật pháp tối đa",
    description: "Đội ngũ chuyên gia am hiểu luật doanh nghiệp và các quy định của pháp luật.",
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Hỗ trợ Doanh nghiệp số hóa",
    description: "Cung cấp các công cụ số hóa nhằm thu hút nhiều khách hàng trên không gian số.",
  },
];
const homeServices: ServiceCardProps[] = [
  {
    icon: <Briefcase className="h-6 w-6 text-blue-600" />,
    title: "Thành lập doanh nghiệp trong nước",
    description: "Đăng ký Giấy phép kinh doanh, Con dấu, Biển tên, Chữ ký số. Hoàn tất chỉ trong 5-7 ngày làm việc.",
    ctaText: "Bắt đầu từ 4.200.000đ",
    ctaLink: "/pricing",
  },
  {
    icon: <Calculator className="h-6 w-6 text-blue-600" />,
    title: "Dịch vụ kế toán và thuế cho SME",
    description: "Báo cáo thuế hàng quý, sổ sách kế toán, quyết toán năm. Tích hợp hóa đơn điện tử.",
    ctaText: "Chỉ từ 800.000/tháng",
    ctaLink: "/pricing",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-blue-600" />,
    title: "Dịch vụ tuân thủ pháp luật",
    description: "Thay đổi giấy phép, bổ nhiệm giám đốc, soạn thảo biên bản họp, lưu trữ hồ sơ pháp lý.",
    ctaText: "Tìm hiểu thêm",
    ctaLink: "/pricing",
  },
  {
    icon: <Zap className="h-6 w-6 text-blue-600" />,
    title: "Dịch vụ số hóa kinh doanh",
    description: "Cung cấp các công cụ số hóa nhằm thu hút nhiều khách hàng trên không gian số.",
    ctaText: "Tìm hiểu thêm",
    ctaLink: "/pricing",
  },
];
const clientLogos = ['adflex.vn', 'kalapa.vn', 'masoffer.com', 'eway.vn'];
export function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <section className="bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-display">Tại sao chọn CONTI?</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Chúng tôi khác biệt so với các công ty luật và dịch vụ kế toán truyền thống.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {valueProps.map((prop) => (
                <div key={prop.title}>
                  <Card className="text-center h-full transition-shadow hover:shadow-md border-border/80">
                    <CardHeader>
                      <div className="mx-auto bg-background p-4 rounded-full w-fit">{prop.icon}</div>
                      <CardTitle className="mt-4">{prop.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{prop.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-display">Dịch vụ của chúng tôi</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Mọi thứ bạn cần để bắt đầu, vận hành và phát triển doanh nghiệp.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {homeServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ServiceCard {...service} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <section className="pb-16 md:pb-24 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-center text-lg font-semibold text-muted-foreground">
              Được tin tưởng bởi các SME và Startup.
            </h3>
            <div className="mt-8 flex justify-center items-center gap-8 md:gap-12 flex-wrap">
              {clientLogos.map((domain, index) => (
                <a
                  key={index}
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener"
                  className="flex justify-center"
                >
                  <img
                    src={`https://twenty-icons.com/${domain}`}
                    alt={`${domain} logo`}
                    className="h-10 object-contain opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Toaster richColors closeButton />
    </div>
  );
}