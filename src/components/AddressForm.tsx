import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Info, MapPin, Upload, FileCheck, Loader2 } from 'lucide-react';
import { VIETNAM_PROVINCES } from '@shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
const addressSchema = z.object({
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  addressDetail: z.string().min(5, 'Địa chỉ chi tiết phải có ít nhất 5 ký tự'),
});
type AddressFormValues = z.infer<typeof addressSchema>;
interface AddressFormProps {
  initialProvince?: string;
  initialAddressDetail?: string;
  onNext: (data: AddressFormValues & { hasLandCertificate?: boolean }) => void;
}
export function AddressForm({ initialProvince, initialAddressDetail, onNext }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      province: initialProvince || '',
      addressDetail: initialAddressDetail || '',
    },
  });
  const selectedProvince = useWatch({ control, name: 'province' });
  const addressDetail = useWatch({ control, name: 'addressDetail' });
  const needsCertificate = useMemo(() => {
    const regex = /P\.|Phòng|Room|Tầng/i;
    return regex.test(addressDetail);
  }, [addressDetail]);
  const groupedProvinces = useMemo(() => ({
    cities: VIETNAM_PROVINCES.filter(p => p.type === 'Thành phố'),
    provinces: VIETNAM_PROVINCES.filter(p => p.type === 'Tỉnh'),
  }), []);
  const onSubmit = (data: AddressFormValues) => {
    onNext({ ...data, hasLandCertificate: needsCertificate });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-2xl font-display font-bold text-brand-navy">Trụ sở chính</h3>
        <p className="text-muted-foreground">Cung cấp thông tin địa chỉ đặt trụ sở doanh nghiệp của bạn.</p>
      </div>
      <Alert className="bg-amber-50 border-amber-200 text-amber-900">
        <Info className="h-5 w-5 text-amber-600" />
        <AlertTitle className="font-bold">Lưu ý pháp lý quan trọng</AlertTitle>
        <AlertDescription className="text-sm leading-relaxed">
          Trụ sở không được phép là nhà tập thể, nhà chung cư. Nếu là nhà riêng mà có số phòng thì yêu cầu cung cấp giấy chứng nhận quyền sử dụng đất.
        </AlertDescription>
      </Alert>
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="province" className="font-bold text-sm">Tỉnh / Thành phố</Label>
          <Select 
            value={selectedProvince} 
            onValueChange={(val) => setValue('province', val, { shouldValidate: true })}
          >
            <SelectTrigger className={cn("h-12", errors.province && "border-destructive")}>
              <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-blue-600 font-bold px-2 py-1.5 text-xs uppercase tracking-wider">Thành phố trực thuộc Trung ương</SelectLabel>
                {groupedProvinces.cities.map(p => (
                  <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectGroup>
              <div className="h-px bg-slate-100 my-1" />
              <SelectGroup>
                <SelectLabel className="text-slate-500 font-bold px-2 py-1.5 text-xs uppercase tracking-wider">Các tỉnh thành khác</SelectLabel>
                {groupedProvinces.provinces.map(p => (
                  <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.province && <p className="text-xs font-medium text-destructive">{errors.province.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressDetail" className="font-bold text-sm">Địa chỉ chi tiết</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="addressDetail"
              placeholder="Số nhà, tên đường, phố, thôn, xóm..."
              className={cn("h-14 pl-10 text-base", errors.addressDetail && "border-destructive")}
              {...register('addressDetail')}
            />
          </div>
          {errors.addressDetail && <p className="text-xs font-medium text-destructive">{errors.addressDetail.message}</p>}
          <p className="text-xs text-muted-foreground">Ví dụ: 54 Liễu Giai, Phường Ngọc Khánh, Quận Ba Đình</p>
        </div>
        {needsCertificate && (
          <div className="space-y-4 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-brand-navy">Giấy chứng nhận quyền sử dụng đất</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Bắt buộc do địa chỉ có chứa thông tin số phòng/tầng. Vui lòng tải lên bản quét hoặc ảnh chụp rõ nét của Sổ đỏ/Sổ hồng.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-8 hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="text-center space-y-2">
                <Upload className="h-8 w-8 text-blue-400 mx-auto group-hover:scale-110 transition-transform" />
                <p className="text-sm font-bold text-blue-600">Nhấn để tải tài liệu lên</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Tối đa 10MB)</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.01]"
      >
        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Xác nhận địa chỉ"}
      </Button>
    </form>
  );
}
