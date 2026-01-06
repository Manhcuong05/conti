import React from 'react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
const teamMembers = [
  { name: "Tú Phạm", role: "CEO", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1287&auto=format&fit=crop" },
  { name: "Tiến Hoàng", role: "CTO", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1287&auto=format&fit=crop" },
  { name: "Nhật Ngô", role: "COO", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1287&auto=format&fit=crop" },
  { name: "Đức Chu", role: "PM", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1287&auto=format&fit=crop" },
];
const clientLogos = ['adflex.vn', 'kalapa.vn', 'masoffer.com', 'eway.vn'];
export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24 lg:py-32 text-center space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display font-black text-brand-navy uppercase tracking-tighter"
            >
              Về CONTI
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed"
            >
              Chúng tôi số hóa hạ tầng tuân thủ quy định và vận hành kinh doanh cho SME và Startup tại Việt Nam.
            </motion.p>
          </div>
        </div>
        <section className="bg-slate-50 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16 md:py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-black font-display text-brand-navy uppercase tracking-tight">Câu chuyện của chúng tôi</h2>
                <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed">
                  <p>
                    CONTI được thành lập bởi một nhóm chuyên gia Pháp lý, Kế toán và Công nghệ với tầm nhìn thay đổi cách doanh nghiệp tương tác với thủ tục hành chính. Chúng tôi đã thấy quá nhiều Startup phải vật lộn với hồ sơ giấy và các quy định thay đổi chóng mặt.
                  </p>
                  <p>
                    Hệ thống của chúng tôi được thiết kế để tự động hóa các công việc tẻ nhạt, cung cấp một giải pháp minh bạch, hiệu quả và 100% online để bạn bắt đầu kinh doanh chỉ trong vài phút thay vì vài tuần.
                  </p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/10 rounded-4xl -rotate-3 group-hover:rotate-0 transition-transform" />
                <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop" 
                  alt="CONTI Team" 
                  className="relative rounded-4xl shadow-2xl object-cover aspect-video" 
                />
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24 lg:py-32">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-black font-display text-brand-navy uppercase tracking-tight">Đội ngũ sáng lập</h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
                Sự kết hợp giữa chuyên môn sâu rộng về luật doanh nghiệp và tư duy công nghệ đột phá.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {teamMembers.map((member, idx) => (
                <motion.div 
                  key={member.name} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center group"
                >
                  <div className="relative mx-auto h-48 w-48 mb-6">
                    <div className="absolute inset-0 bg-blue-100 rounded-full scale-105 opacity-0 group-hover:opacity-100 transition-all" />
                    <img 
                      className="relative h-48 w-48 rounded-full object-cover border-4 border-white shadow-xl grayscale group-hover:grayscale-0 transition-all" 
                      src={member.imageUrl} 
                      alt={member.name} 
                    />
                  </div>
                  <h3 className="text-xl font-bold text-brand-navy">{member.name}</h3>
                  <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-brand-navy py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale invert">
              {clientLogos.map((domain) => (
                <img key={domain} src={`https://twenty-icons.com/${domain}`} alt={domain} className="h-8 object-contain" />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}