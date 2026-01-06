export interface Province {
  id: string;
  name: string;
 type: 'Tỉnh' | 'Thành phố';
}
/**
 * Danh sách 34 đơn vị hành chính sau sáp nhập (ID = name để tiện so khớp).
 */
export const VIETNAM_PROVINCES: Province[] = [
  { id: 'Tuyên Quang', name: 'Tuyên Quang', type: 'Tỉnh' },
  { id: 'Cao Bằng', name: 'Cao Bằng', type: 'Tỉnh' },
  { id: 'Lai Châu', name: 'Lai Châu', type: 'Tỉnh' },
  { id: 'Lào Cai', name: 'Lào Cai', type: 'Tỉnh' },
  { id: 'Thái Nguyên', name: 'Thái Nguyên', type: 'Tỉnh' },
  { id: 'Điện Biên', name: 'Điện Biên', type: 'Tỉnh' },
  { id: 'Lạng Sơn', name: 'Lạng Sơn', type: 'Tỉnh' },
  { id: 'Sơn La', name: 'Sơn La', type: 'Tỉnh' },
  { id: 'Phú Thọ', name: 'Phú Thọ', type: 'Tỉnh' },
  { id: 'Bắc Ninh', name: 'Bắc Ninh', type: 'Tỉnh' },
  { id: 'Quảng Ninh', name: 'Quảng Ninh', type: 'Tỉnh' },
  { id: 'TP. Hà Nội', name: 'TP. Hà Nội', type: 'Thành phố' },
  { id: 'TP. Hải Phòng', name: 'TP. Hải Phòng', type: 'Thành phố' },
  { id: 'Hưng Yên', name: 'Hưng Yên', type: 'Tỉnh' },
  { id: 'Ninh Bình', name: 'Ninh Bình', type: 'Tỉnh' },
  { id: 'Thanh Hóa', name: 'Thanh Hóa', type: 'Tỉnh' },
  { id: 'Nghệ An', name: 'Nghệ An', type: 'Tỉnh' },
  { id: 'Hà Tĩnh', name: 'Hà Tĩnh', type: 'Tỉnh' },
  { id: 'Quảng Trị', name: 'Quảng Trị', type: 'Tỉnh' },
  { id: 'TP. Huế', name: 'TP. Huế', type: 'Thành phố' },
  { id: 'TP. Đà Nẵng', name: 'TP. Đà Nẵng', type: 'Thành phố' },
  { id: 'Quảng Ngãi', name: 'Quảng Ngãi', type: 'Tỉnh' },
  { id: 'Gia Lai', name: 'Gia Lai', type: 'Tỉnh' },
  { id: 'Đắk Lắk', name: 'Đắk Lắk', type: 'Tỉnh' },
  { id: 'Khánh Hoà', name: 'Khánh Hoà', type: 'Tỉnh' },
  { id: 'Lâm Đồng', name: 'Lâm Đồng', type: 'Tỉnh' },
  { id: 'Đồng Nai', name: 'Đồng Nai', type: 'Tỉnh' },
  { id: 'Tây Ninh', name: 'Tây Ninh', type: 'Tỉnh' },
  { id: 'TP. Hồ Chí Minh', name: 'TP. Hồ Chí Minh', type: 'Thành phố' },
  { id: 'Đồng Tháp', name: 'Đồng Tháp', type: 'Tỉnh' },
  { id: 'An Giang', name: 'An Giang', type: 'Tỉnh' },
  { id: 'Vĩnh Long', name: 'Vĩnh Long', type: 'Tỉnh' },
  { id: 'TP. Cần Thơ', name: 'TP. Cần Thơ', type: 'Thành phố' },
  { id: 'Cà Mau', name: 'Cà Mau', type: 'Tỉnh' },
];
