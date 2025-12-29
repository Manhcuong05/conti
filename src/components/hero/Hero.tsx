import { Button } from "@/components/ui/button";
import { ArrowRight, PhoneCall } from "lucide-react";
import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/20 dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-20 md:py-32 lg:py-40 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground tracking-tight">
              CONTI
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground max-w-4xl mx-auto leading-tight text-balance">
              Thành lập, vận hành, phát triển doanh nghiệp. Tất cả trong một.
            </h2>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
              Từ thành lập và kế toán đến tuân thủ liên tục, CONTI xử lý việc hành chính để bạn tập trung phát triển kinh doanh.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Button 
              asChild
              size="lg" 
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8 h-14 text-lg rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Link to="/start">
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-blue-500 text-blue-600 hover:bg-blue-50 px-8 h-14 text-lg rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <PhoneCall className="mr-2 h-5 w-5" />
              Liên hệ tư vấn
            </Button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-sm font-medium text-muted-foreground/80"
          >
            Được tin cậy bởi 500+ SME và Startup.
          </motion.p>
        </div>
      </div>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-3xl" />
      </div>
    </section>
  );
}