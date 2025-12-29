import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
const resources = [
  {
    title: "Hướng dẫn chi tiết thủ tục thành lập công ty TNHH",
    excerpt: "Các bước cần thiết, hồ sơ yêu cầu và những lưu ý quan trọng khi thành lập công ty TNHH một thành viên và hai thành viên trở lên.",
    category: "Pháp lý",
    imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1287&auto=format&fit=crop"
  },
  {
    title: "5 sai lầm về thuế mà các SME thường mắc phải",
    excerpt: "Tránh các lỗi phổ biến có thể dẫn đến phạt và rủi ro cho doanh nghiệp của bạn. Tìm hiểu cách quản lý thuế hiệu quả.",
    category: "Kế toán",
    imageUrl: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1470&auto=format&fit=crop"
  },
  {
    title: "Số hóa quy trình kinh doanh: Bắt đầu từ đâu?",
    excerpt: "Khám phá các công cụ và chiến lược để chuyển đổi số, tăng hiệu quả hoạt động và tiếp cận nhiều khách hàng hơn.",
    category: "Kinh doanh",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop"
  },
];
export default function ResourcesPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-20 lg:py-24 text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-display font-black text-brand-navy uppercase tracking-tighter">Tài nguyên CONTI</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium">
              Kiến thức và công cụ giúp bạn vận hành doanh nghiệp hiệu quả, tuân thủ pháp luật trong kỷ nguyên số.
            </p>
            <div className="mt-8 max-w-lg mx-auto relative group">
              <Input placeholder="Tìm kiếm hướng dẫn..." className="h-14 pl-12 rounded-2xl border-2 border-slate-100 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all shadow-sm group-hover:shadow-md" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
          <div className="pb-20 md:pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="flex flex-col h-full overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group rounded-3xl">
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={resource.imageUrl}
                      alt={resource.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 backdrop-blur-md text-blue-600 font-bold hover:bg-white">{resource.category}</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold leading-tight text-brand-navy group-hover:text-blue-600 transition-colors">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow pb-4">
                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">{resource.excerpt}</p>
                  </CardContent>
                  <CardFooter className="pt-0 border-t bg-slate-50/50 py-4">
                    <Button variant="ghost" asChild className="p-0 h-auto text-blue-600 font-bold hover:bg-transparent hover:text-blue-700">
                      <Link to="#">
                        Đọc chi tiết <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
