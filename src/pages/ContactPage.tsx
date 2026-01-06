import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Toaster } from "@/components/ui/sonner";

export default function ContactPage() {
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        setIsSubmitting(true);
        try {
            await api("/api/telegram/notify", {
                method: "POST",
                body: JSON.stringify({
                    type: "contact",
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                }),
            });
            toast.success("Cảm ơn bạn! Chúng tôi sẽ liên hệ trong thời gian sớm nhất.");
            setFormData({ name: "", email: "", phone: "", message: "" });
        } catch (error) {
            toast.error("Gửi thông tin thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-navy mb-4">
                            Liên hệ tư vấn
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Để lại thông tin, chuyên viên CONTI sẽ liên hệ tư vấn miễn phí trong vòng 30 phút làm việc.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <Card className="shadow-xl border-none">
                            <CardHeader className="bg-brand-navy text-white rounded-t-lg">
                                <CardTitle className="text-2xl">Gửi yêu cầu tư vấn</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-bold">
                                            Họ và tên *
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Nguyễn Văn A"
                                            required
                                            className="h-12"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-bold">
                                            Email *
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="email@domain.com"
                                            required
                                            className="h-12"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="font-bold">
                                            Số điện thoại *
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="09xx xxx xxx"
                                            required
                                            className="h-12"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="font-bold">
                                            Nội dung (tùy chọn)
                                        </Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Chia sẻ thêm về nhu cầu của bạn..."
                                            rows={5}
                                            className="resize-none"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-xl shadow-lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-5 w-5" />
                                                Gửi yêu cầu
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <div className="space-y-8">
                            <Card className="p-8 shadow-lg border-blue-100">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Mail className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Email</h3>
                                        <p className="text-muted-foreground">Conti24h@gmail.com</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-8 shadow-lg border-blue-100">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Phone className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Điện thoại</h3>
                                        <p className="text-muted-foreground">0989103873</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-8 shadow-lg border-blue-100">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <MapPin className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Địa chỉ</h3>
                                        <p className="text-muted-foreground">
                                            Tầng 12A, Tòa nhà HUD Tower <br />
                                            37 Lê Văn Lương, Thanh Xuân, Hà Nội
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-lg">
                                <h3 className="font-bold text-xl mb-3 text-brand-navy">Giờ làm việc</h3>
                                <div className="space-y-2 text-slate-700">
                                    <p className="flex justify-between">
                                        <span className="font-medium">Thứ 2 - Thứ 6:</span>
                                        <span>8:00 - 18:00</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="font-medium">Thứ 7:</span>
                                        <span>8:00 - 12:00</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="font-medium">Chủ nhật:</span>
                                        <span>Nghỉ</span>
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <Toaster richColors closeButton />
        </div>
    );
}
