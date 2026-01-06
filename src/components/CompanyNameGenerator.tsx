import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { generateCompanyNames, GroupedCompanyNames } from '@shared/nameGenerator';
import { api } from '@/lib/api-client';
import type { CompanyCheckResult } from '@shared/types';
import { cn } from '@/lib/utils';
interface NameCardProps {
  name: string;
  onSelect?: (name: string) => void;
}
function NameCard({ name, onSelect }: NameCardProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<'available' | 'duplicate' | null>(null);
  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(name);
      toast.success(`Đã sao chép: ${name}`);
    } catch (err) {
      toast.error('Không thể sao chép vào bộ nhớ tạm');
    }
  };
  const checkAvailability = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsChecking(true);
    try {
      const res = await api<CompanyCheckResult>('/api/check-name', {
        method: 'POST',
        body: JSON.stringify({ companyName: name }),
      });
      setCheckStatus(res.status === 'available' ? 'available' : 'duplicate');
      if (res.status === 'available') {
        toast.success(`${name} khả dụng!`);
      } else {
        toast.error(`${name} đã tồn tại hoặc trùng lặp.`);
      }
    } catch (err) {
      toast.error('Không thể kiểm tra lúc này.');
    } finally {
      setIsChecking(false);
    }
  };
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => onSelect?.(name)}
    >
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-brand-navy text-lg leading-tight group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-brand-navy"
            onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
          >
            Sao chép
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isChecking}
            className={cn(
              "h-8 px-2 text-xs",
              checkStatus === 'available' ? "text-green-600" :
              checkStatus === 'duplicate' ? "text-red-600" :
              "text-blue-600 hover:text-brand-navy"
            )}
            onClick={checkAvailability}
          >
            {isChecking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              checkStatus === 'available' ? 'Khả dụng' : checkStatus === 'duplicate' ? 'Đã trùng' : 'Kiểm tra'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
export function CompanyNameGenerator({ initialKeyword, onSelect }: { initialKeyword: string, onSelect?: (name: string) => void }) {
  const [keyword, setKeyword] = useState(initialKeyword || "");
  const [results, setResults] = useState<GroupedCompanyNames | null>(null);
  const handleGenerate = useCallback((targetKeyword?: string) => {
    const activeKeyword = targetKeyword ?? keyword;
    if (!activeKeyword || activeKeyword.trim().length < 2) {
      if (targetKeyword === undefined) toast.error('Vui lòng nhập từ khóa dài hơn (tối thiểu 2 ký tự)');
      return;
    }
    try {
      const suggestions = generateCompanyNames(activeKeyword);
      setResults(suggestions);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Lỗi khi gợi ý tên. Vui lòng thử lại.');
    }
  }, [keyword]);
  useEffect(() => {
    if (initialKeyword && initialKeyword.trim().length >= 2) {
      handleGenerate(initialKeyword);
    }
  }, [initialKeyword, handleGenerate]);
  return (
    <div className="w-full space-y-12">
      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <div className="relative w-full">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.toUpperCase())}
            placeholder="Nhập từ khóa (VD: HƯNG THỊNH)..."
            className="h-16 pl-6 pr-40 text-xl font-medium rounded-2xl border-2 border-blue-100 focus:border-blue-500 shadow-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button
            onClick={() => handleGenerate()}
            className="absolute right-2 top-2 h-12 px-8 bg-brand-navy hover:bg-blue-900 text-white rounded-xl font-bold"
          >
            Gợi ý tên
          </Button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="space-y-4">
              <div className="px-1 text-slate-500 font-bold uppercase tracking-wider text-xs">
                Hiện đại & Công nghệ
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(results?.modern ?? []).map((name) => (
                  <NameCard key={name} name={name} onSelect={onSelect} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="px-1 text-slate-500 font-bold uppercase tracking-wider text-xs">
                Tập đoàn & Tài chính
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(results?.corporate ?? []).map((name) => (
                  <NameCard key={name} name={name} onSelect={onSelect} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="px-1 text-slate-500 font-bold uppercase tracking-wider text-xs">
                Thuần Việt & Dễ Nhớ
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(results?.vietnamese ?? []).map((name) => (
                  <NameCard key={name} name={name} onSelect={onSelect} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
