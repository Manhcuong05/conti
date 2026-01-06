export type ResourceCategory = "Pháp lý" | "Kế toán" | "Kinh doanh" | "Mẫu biểu" | "Thuế";

export type Resource = {
  slug: string;
  title: string;
  excerpt: string;
  category: ResourceCategory | string;
  imageUrl: string;
  tags: string[];
  minutes: number;
  date: string; // ISO string
  level?: "Cơ bản" | "Nâng cao";
  ctaHref?: string;
  ctaLabel?: string;
  content?: { heading: string; body: string }[];
};

export const baseResources: Resource[] = [
  {
    slug: "huong-dan-thu-tuc-thanh-lap-tnhh",
    title: "Hướng dẫn chi tiết thủ tục thành lập công ty TNHH",
    excerpt:
      "Các bước cần thiết, hồ sơ yêu cầu và những lưu ý quan trọng khi thành lập công ty TNHH một thành viên và hai thành viên trở lên.",
    category: "Pháp lý",
    imageUrl:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1287&auto=format&fit=crop",
    tags: ["Thành lập công ty", "Checklist", "Giấy phép"],
    minutes: 8,
    date: "2025-01-12",
    level: "Cơ bản",
    content: [
      {
        heading: "Chuẩn bị hồ sơ",
        body:
          "Giấy đề nghị đăng ký doanh nghiệp; Điều lệ công ty; Danh sách thành viên/cổ đông sáng lập; Bản sao CCCD/Hộ chiếu của chủ sở hữu/thành viên; Giấy tờ chứng minh địa chỉ trụ sở (hợp đồng thuê, giấy tờ sở hữu).",
      },
      {
        heading: "Nộp hồ sơ và nhận kết quả",
        body:
          "Nộp trực tuyến trên Cổng Dịch vụ công hoặc nộp trực tiếp tại Sở KH&ĐT. Thời gian xử lý thường 3-5 ngày làm việc. Sau khi được cấp GCNĐKDN, khắc dấu và công bố mẫu dấu.",
      },
      {
        heading: "Bước tiếp theo sau khi có GCN",
        body:
          "Mở tài khoản ngân hàng và thông báo với Sở KH&ĐT; Đăng ký chữ ký số; Nộp tờ khai lệ phí môn bài; Treo bảng hiệu tại trụ sở; Soạn thảo hợp đồng lao động mẫu và quy chế nội bộ nếu cần.",
      },
    ],
  },
  {
    slug: "5-sai-lam-ve-thue-sme-thuong-gap",
    title: "5 sai lầm về thuế mà các SME thường mắc phải",
    excerpt:
      "Tránh các lỗi phổ biến có thể dẫn đến phạt và rủi ro cho doanh nghiệp của bạn. Tìm hiểu cách quản lý thuế hiệu quả.",
    category: "Thuế",
    imageUrl:
      "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1470&auto=format&fit=crop",
    tags: ["Thuế GTGT", "BCTC", "Tuân thủ"],
    minutes: 6,
    date: "2025-01-05",
    level: "Cơ bản",
    content: [
      {
        heading: "Kê khai sai thời hạn",
        body:
          "Lập lịch nhắc nộp tờ khai GTGT, TNCN và báo cáo tình hình sử dụng hóa đơn. Sử dụng chữ ký số để nộp sớm, tránh bị xử phạt do chậm trễ.",
      },
      {
        heading: "Hạch toán thiếu chứng từ",
        body:
          "Mọi khoản chi cần hóa đơn hợp lệ, hợp đồng và chứng từ thanh toán không dùng tiền mặt với hóa đơn trên 20 triệu. Thiếu chứng từ sẽ làm chi phí không được khấu trừ.",
      },
      {
        heading: "Không soát lỗi hóa đơn",
        body:
          "Đối chiếu thông tin người mua, mã số thuế, mã CQT. Sai sót cần lập biên bản điều chỉnh hoặc hủy, xuất lại hóa đơn thay thế đúng quy trình.",
      },
    ],
  },
  {
    slug: "so-hoa-quy-trinh-kinh-doanh-bat-dau-tu-dau",
    title: "Số hóa quy trình kinh doanh: Bắt đầu từ đâu?",
    excerpt:
      "Khám phá các công cụ và chiến lược để chuyển đổi số, tăng hiệu quả hoạt động và tiếp cận nhiều khách hàng hơn.",
    category: "Kinh doanh",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop",
    tags: ["Chuyển đổi số", "Quy trình", "CRM"],
    minutes: 7,
    date: "2024-12-15",
    level: "Cơ bản",
    content: [
      {
        heading: "Chọn quy trình ưu tiên",
        body:
          "Bắt đầu từ quy trình gây tốn kém thời gian nhất: bán hàng, chăm sóc khách, kế toán, hoặc hậu cần. Xác định KPI trước và sau khi số hóa.",
      },
      {
        heading: "Chọn công cụ",
        body:
          "CRM để quản lý khách hàng, phần mềm kế toán để đồng bộ hóa đơn, công cụ quản lý dự án cho teamwork. Ưu tiên sản phẩm có API để mở rộng về sau.",
      },
      {
        heading: "Triển khai và đo lường",
        body:
          "Thiết lập quy trình mẫu, đào tạo đội ngũ, đo lường theo tuần. Sau 4-6 tuần, tối ưu lại dữ liệu, quyền truy cập và báo cáo.",
      },
    ],
  },
  {
    slug: "checklist-cong-bo-mau-dau-doanh-nghiep",
    title: "Checklist công bố mẫu dấu doanh nghiệp",
    excerpt:
      "Các bước khắc dấu, thông báo mẫu dấu và lưu ý khi sử dụng dấu tròn trong giao dịch.",
    category: "Pháp lý",
    imageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1287&auto=format&fit=crop",
    tags: ["Dấu tròn", "Checklist"],
    minutes: 4,
    date: "2024-12-01",
    ctaHref: "#",
    ctaLabel: "Tải checklist PDF",
    content: [
      {
        heading: "Chuẩn bị trước khi khắc dấu",
        body:
          "Chọn đơn vị khắc dấu uy tín; xác định số lượng dấu cần dùng; thống nhất quy chuẩn kích thước, màu mực và người được phép quản lý dấu.",
      },
      {
        heading: "Thông báo mẫu dấu",
        body:
          "Nộp thông báo mẫu dấu trên Cổng thông tin quốc gia về đăng ký doanh nghiệp, lưu lại Giấy xác nhận đã đăng tải để xuất trình khi cần.",
      },
    ],
  },
  {
    slug: "mau-dieu-le-cong-ty-tnhh-2025",
    title: "Mẫu điều lệ công ty TNHH 2025",
    excerpt:
      "Bản điều lệ chuẩn có sẵn điều khoản về vốn, phân chia lợi nhuận, quyền và nghĩa vụ của thành viên.",
    category: "Mẫu biểu",
    imageUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1287&auto=format&fit=crop",
    tags: ["Mẫu biểu", "Điều lệ", "Tài liệu"],
    minutes: 5,
    date: "2024-11-20",
    ctaHref: "#",
    ctaLabel: "Tải file DOCX",
    content: [
      {
        heading: "Cách sử dụng",
        body:
          "Tải file và thay thế thông tin pháp nhân, địa chỉ, vốn điều lệ, tỷ lệ góp vốn, người đại diện theo pháp luật. Kiểm tra kỹ điều khoản chuyển nhượng và điều khoản hạn chế cạnh tranh.",
      },
    ],
  },
];

const STORAGE_KEY = "conti_resources";

export function loadResources(): Resource[] {
  if (typeof window === "undefined") return baseResources;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return baseResources;
    const parsed = JSON.parse(raw) as Resource[];
    // Ensure required fields exist; fallback to base if malformed.
    if (!Array.isArray(parsed)) return baseResources;
    return parsed.map((item) => ({
      ...item,
      tags: item.tags ?? [],
    }));
  } catch {
    return baseResources;
  }
}

export function saveResources(list: Resource[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore write errors (storage blocked/quota)
  }
}

export function getResourceBySlug(slug: string) {
  return loadResources().find((r) => r.slug === slug);
}

export function getResourceCategories(data: Resource[]) {
  return ["Tất cả", ...Array.from(new Set(data.map((r) => r.category)))];
}
