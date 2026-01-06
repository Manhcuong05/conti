import type { User, Chat, ChatMessage } from './types';
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Nguyễn Văn A' },
  { id: 'u2', name: 'Trần Thị B' }
];
export const MOCK_CHATS: Chat[] = [
  { id: 'c1', title: 'Thảo luận chung' },
];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', chatId: 'c1', userId: 'u1', text: 'Xin chào, tôi cần hỗ trợ về GPKD', ts: Date.now() },
];
// CONTI Mock Data
export const SERVICES = [
  {
    id: 'thanh-lap',
    title: 'Thành lập doanh nghiệp trong nước',
    short: 'Đăng ký Giấy phép kinh doanh, Con dấu, Biển tên, Chữ ký số. Hoàn tất chỉ trong 5-7 ngày làm việc.',
    priceEst: 'Bắt đầu từ 4.200.000đ',
  },
  {
    id: 'ke-toan',
    title: 'Dịch vụ kế toán và thuế cho SME',
    short: 'Báo cáo thuế hàng quý, sổ sách kế toán, quyết toán năm. Tích hợp hóa đơn điện tử.',
    priceEst: 'Chỉ từ 800.000đ/tháng',
  },
  {
    id: 'tuan-thu',
    title: 'Dịch vụ tuân thủ pháp luật',
    short: 'Thay đổi giấy phép, bổ nhiệm giám đốc, soạn thảo biên bản họp, lưu trữ hồ sơ pháp lý.',
    priceEst: 'Tìm hiểu thêm',
  },
  {
    id: 'so-hoa',
    title: 'Dịch vụ số hóa kinh doanh',
    short: 'Cung cấp các công cụ số hóa nhằm thu hút nhiều khách hàng trên không gian số.',
    priceEst: 'Tìm hiểu thêm',
  },
];
const coBanFeatures = [
  'Giấy chứng nhận ĐKKD',
  'Nộp lệ phí thành lập',
  'Công bố thông tin trên Cổng dịch vụ công quốc gia',
  'Dấu công ty và dấu chức danh',
  'Bộ hồ sơ lưu tại doanh nghiệp (điều lệ, đăng ký kinh doanh)',
  'Biển tên công ty (chất liệu MICA)',
  'Tài khoản ngân hàng và liên kết nộp thuế',
  '12 tháng chữ ký số',
  '500 hóa đơn điện tử',
];
const vuonCaoFeatures = [
  ...coBanFeatures,
  'Nộp tờ khai thuế môn bài',
  'Nộp tờ khai thuế quý đầu tiên: VAT, TNDN...',
  'Đăng ký mã số BHXH',
  '02 giờ tư vấn về thuế và luật miễn phí',
  'Đăng ký tài khoản thuế điện tử Etax và tài khoản tra cứu hóa đơn điện tử',
];
const nangTamFeatures = [
  ...vuonCaoFeatures,
  '12 tháng Phần mềm kế toán',
  '12 tháng phần mềm BHXH',
  '12 tháng phần mềm thuế TNCN',
];
export const PRICING_TIERS = [
  {
    id: "co-ban",
    name: "Gói Cơ bản",
    priceVND: 4200000,
    priceSuffix: " / trọn gói",
    features: coBanFeatures,
    isFeatured: false,
  },
  {
    id: "vuon-cao",
    name: "Gói Vươn cao",
    priceVND: 5000000,
    priceSuffix: " / trọn gói",
    features: vuonCaoFeatures,
    isFeatured: true,
  },
  {
    id: "nang-tam",
    name: "Gói Nâng tầm",
    priceVND: 6000000,
    priceSuffix: " / trọn gói",
    features: nangTamFeatures,
    isFeatured: false,
  },
];
export const RESOURCES = [
  {
    id: '1',
    title: "Hướng dẫn chi tiết thủ tục thành lập công ty TNHH",
    excerpt: "Các bước cần thiết, hồ sơ yêu cầu và những lưu ý quan trọng khi thành lập công ty TNHH một thành viên và hai thành viên trở lên.",
    link: "#",
  },
  {
    id: '2',
    title: "5 sai lầm về thuế mà các SME thường mắc phải",
    excerpt: "Tránh các lỗi phổ biến có thể dẫn đến phạt và rủi ro cho doanh nghiệp của bạn. Tìm hiểu cách quản lý thuế hiệu quả.",
    link: "#",
  },
];
