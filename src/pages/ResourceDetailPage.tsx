import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Clock3, ArrowLeft } from "lucide-react";
import { getResourceBySlug } from "@/data/resources";

export default function ResourceDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const resource = slug ? getResourceBySlug(slug) : null;

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-display font-bold text-brand-navy">Không tìm thấy bài viết</h1>
            <p className="text-muted-foreground">Bài viết có thể đã được đổi liên kết hoặc chưa được xuất bản.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button asChild>
                <Link to="/resources">Về trang Tài nguyên</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-50 text-blue-700">{resource.category}</Badge>
              {resource.level && <Badge variant="outline">{resource.level}</Badge>}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{new Date(resource.date).toLocaleDateString("vi-VN")}</span>
                <span className="flex items-center gap-1">
                  <Clock3 className="h-4 w-4" /> {resource.minutes} phút đọc
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-navy leading-tight">
              {resource.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{resource.excerpt}</p>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs border-blue-200 text-blue-700">
                  #{tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button asChild>
                <Link to={`/resources?edit=${resource.slug}`}>
                  Chỉnh sửa bài viết
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 md:mt-12 space-y-8">
            {resource.content && resource.content.length > 0 ? (
              resource.content.map((block, idx) => (
                <section key={idx} className="space-y-3">
                  <h2 className="text-2xl font-bold text-brand-navy">{block.heading}</h2>
                  <p className="text-base leading-relaxed text-slate-700">{block.body}</p>
                </section>
              ))
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600">
                Nội dung bài viết sẽ được cập nhật. Gửi bản thảo để đội ngũ xuất bản nhanh nhất.
              </div>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
