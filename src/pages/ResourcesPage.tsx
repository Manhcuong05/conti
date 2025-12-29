import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock3, FileText, Search, Upload } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Resource } from "@/data/resources";
import { baseResources, getResourceCategories, loadResources, saveResources } from "@/data/resources";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function ResourcesPage() {
  const [category, setCategory] = useState<string>("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [resourceList, setResourceList] = useState<Resource[]>(baseResources);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<Resource>({
    slug: "",
    title: "",
    excerpt: "",
    category: "Pháp lý",
    imageUrl: "",
    tags: [],
    minutes: 5,
    date: new Date().toISOString().split("T")[0],
    level: "Cơ bản",
    content: [],
  });

  useEffect(() => {
    setResourceList(loadResources());
  }, []);

  const allTags = useMemo(() => {
    const list = resourceList.flatMap((r) => r.tags);
    const unique = Array.from(new Set(list));
    return unique.slice(0, 10);
  }, [resourceList]);

  const filteredResources = useMemo(() => {
    return resourceList
      .filter((r) => (category === "Tất cả" ? true : r.category === category))
      .filter((r) => (activeTag ? r.tags.includes(activeTag) : true))
      .filter((r) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          r.title.toLowerCase().includes(term) ||
          r.excerpt.toLowerCase().includes(term) ||
          r.tags.some((t) => t.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [category, searchTerm, activeTag, resourceList]);

  const categories = useMemo(() => getResourceCategories(resourceList), [resourceList]);

  const featured = filteredResources[0];
  const rest = filteredResources.slice(1);
  const hasAutoOpened = useRef(false);

  const resetForm = useCallback(() => {
    setEditingSlug(null);
    setFormData({
      slug: "",
      title: "",
      excerpt: "",
      category: "Pháp lý",
      imageUrl: "",
      tags: [],
      minutes: 5,
      date: new Date().toISOString().split("T")[0],
      level: "Cơ bản",
      content: [],
    });
  }, []);

  const handleEdit = useCallback((slug: string) => {
    const item = resourceList.find((r) => r.slug === slug);
    if (!item) return;
    setEditingSlug(slug);
    setEditorOpen(true);
    setFormData({ ...item });
  }, [resourceList]);

  useEffect(() => {
    const slug = searchParams.get("edit");
    if (hasAutoOpened.current) return;
    if (slug && resourceList.some((r) => r.slug === slug)) {
      handleEdit(slug);
      hasAutoOpened.current = true;
    }
  }, [searchParams, resourceList, handleEdit]);

  const handleSave = useCallback(() => {
    if (!formData.title.trim()) return;
    const slug =
      formData.slug.trim() ||
      formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const nextItem: Resource = {
      ...formData,
      slug,
      tags: Array.from(new Set((formData.tags || []).map((t) => t.trim()).filter(Boolean))),
    };

    const exists = resourceList.some((r) => r.slug === slug);
    const nextList = exists
      ? resourceList.map((r) => (r.slug === slug ? nextItem : r))
      : [{ ...nextItem, date: nextItem.date || new Date().toISOString().split("T")[0] }, ...resourceList];

    setResourceList(nextList);
    saveResources(nextList);
    setEditingSlug(slug);
    toast.success("Đã lưu bản nháp cục bộ");
    setEditorOpen(false);
  }, [formData, resourceList]);

  const renderCard = (resource: Resource, index: number) => (
    <motion.div
      key={resource.slug}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="flex flex-col h-full overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group rounded-3xl">
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-white/90 backdrop-blur-md text-blue-600 font-bold hover:bg-white">
              {resource.category}
            </Badge>
            {resource.level && (
              <Badge variant="outline" className="bg-white/80 backdrop-blur-md text-slate-700 border-slate-200">
                {resource.level}
              </Badge>
            )}
          </div>
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold leading-tight text-brand-navy group-hover:text-blue-600 transition-colors">
            {resource.title}
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            <span>{new Date(resource.date).toLocaleDateString("vi-VN")}</span>
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" /> {resource.minutes} phút đọc
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-4 space-y-3">
          <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">{resource.excerpt}</p>
          <div className="flex flex-wrap gap-2">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-slate-200 text-slate-600"
                onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0 border-t bg-slate-50/50 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild className="p-0 h-auto text-blue-600 font-bold hover:bg-transparent hover:text-blue-700">
            <Link to={`/resources/${resource.slug}`}>
              Đọc chi tiết <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {resource.ctaHref && (
            <Button variant="outline" asChild size="sm" className="rounded-full">
              <a href={resource.ctaHref} target="_blank" rel="noreferrer">
                {resource.ctaLabel || "Tải tài liệu"}
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-20 lg:py-24 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
              <FileText className="h-4 w-4" /> Thư viện Tài nguyên
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-brand-navy uppercase tracking-tighter">
              Tài nguyên CONTI
            </h1>
            <p className="mt-2 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium">
              Kiến thức, biểu mẫu và checklist để bạn vận hành doanh nghiệp hiệu quả, tuân thủ pháp luật trong kỷ nguyên số.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Button variant="ghost" className="px-6 rounded-full" onClick={() => setEditorOpen((v) => !v)}>
                {editorOpen ? "Ẩn chế độ biên tập" : "Mở chế độ biên tập"}
              </Button>
            </div>
            <div className="mt-8 max-w-3xl mx-auto relative group">
              <Input
                placeholder="Tìm kiếm hướng dẫn, biểu mẫu hoặc từ khóa..."
                className="h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-100 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all shadow-sm group-hover:shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={cat === category ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={activeTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {featured && (
            <div className="pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded-3xl bg-gradient-to-r from-blue-50 to-white p-8 md:p-12 shadow-sm border border-blue-100">
                <div className="space-y-4 text-left">
                  <Badge className="bg-white/90 text-blue-700 shadow-sm">{featured.category}</Badge>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-navy leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{new Date(featured.date).toLocaleDateString("vi-VN")}</span>
                    <span className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4" /> {featured.minutes} phút đọc
                    </span>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button asChild className="rounded-full px-6">
                      <Link to={`/resources/${featured.slug}`}>Đọc chi tiết</Link>
                    </Button>
                    <Button variant="outline" className="rounded-full px-6" asChild>
                      <Link to="/start">Nhận tư vấn miễn phí</Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {featured.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-blue-200 text-blue-700">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="relative h-80 rounded-3xl overflow-hidden shadow-xl">
                  <img src={featured.imageUrl} alt={featured.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-full text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Sẵn sàng đăng bài mới
                  </div>
                </div>
              </div>
            </div>
          )}

          {editorOpen && (
            <div className="pb-12">
              <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-brand-navy">Chế độ biên tập (lưu cục bộ trong trình duyệt)</h3>
                  <div className="flex gap-2">
                    {editingSlug && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (!editingSlug) return;
                          const confirmed = window.confirm("Bạn có chắc chắn muốn xóa bài viết này?");
                          if (!confirmed) return;
                          const nextList = resourceList.filter((r) => r.slug !== editingSlug);
                          setResourceList(nextList);
                          saveResources(nextList);
                          resetForm();
                          toast.success("Đã xóa bài viết");
                        }}
                      >
                        Xóa bài viết
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={resetForm}>Tạo bài mới</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Tiêu đề</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Tiêu đề bài viết"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Slug (tùy chọn)</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="vd: huong-dan-thu-tuc"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Danh mục</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Pháp lý / Kế toán / ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Ngày</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Ảnh cover URL</label>
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Thời lượng đọc (phút)</label>
                    <Input
                      type="number"
                      value={formData.minutes}
                      onChange={(e) => setFormData((p) => ({ ...p, minutes: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Tóm tắt</label>
                    <Input
                      value={formData.excerpt}
                      onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                      placeholder="Mô tả ngắn gọn"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Tags (phân cách bằng dấu phẩy)</label>
                    <Input
                      value={(formData.tags || []).join(", ")}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, tags: e.target.value.split(",").map((t) => t.trim()) }))
                      }
                      placeholder="thuế, checklist, pháp lý"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Nội dung (dòng mới = đoạn mới)</label>
                    <textarea
                      className="w-full min-h-[120px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={formData.content?.map((c) => `${c.heading}\n${c.body}`).join("\n\n") || ""}
                      onChange={(e) => {
                        const chunks = e.target.value.split("\n\n").filter(Boolean);
                        const parsed = chunks.map((chunk) => {
                          const [firstLine, ...rest] = chunk.split("\n");
                          return { heading: firstLine || "Tiêu đề đoạn", body: rest.join("\n") || "" };
                        });
                        setFormData((p) => ({ ...p, content: parsed }));
                      }}
                      placeholder={`Chuẩn bị hồ sơ\nGiấy đề nghị đăng ký...\n\nNộp hồ sơ và nhận kết quả\nNộp trực tuyến trên Cổng DVC...`}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" onClick={handleSave}>{editingSlug ? "Lưu chỉnh sửa" : "Thêm bài"}</Button>
                  <Button variant="outline" onClick={resetForm}>Làm mới</Button>
                </div>
              </div>
            </div>
          )}

          <div className="pb-20 md:pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((resource, index) => (
              <div key={resource.slug} className="space-y-3">
                {renderCard(resource, index)}
                {editorOpen && (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(resource.slug)}>
                    Chỉnh sửa nhanh
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <Toaster richColors closeButton />
    </div>
  );
}
