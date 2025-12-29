import React, { useState, useMemo } from 'react';
import { VSIC_CODES, VSICLine } from '@shared/industryData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Fuse from 'fuse.js';
import {
  Search,
  Plus,
  X,
  Star,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
interface BusinessLineSelectorProps {
  selectedLines: VSICLine[];
  primaryCode: string;
  confirmedConditions: boolean;
  onChange: (lines: VSICLine[]) => void;
  onPrimaryChange: (code: string) => void;
  onConditionsConfirmed: (confirmed: boolean) => void;
}
export function BusinessLineSelector({
  selectedLines,
  primaryCode,
  confirmedConditions,
  onChange,
  onPrimaryChange,
  onConditionsConfirmed
}: BusinessLineSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  // Initialize Fuse instance for fuzzy searching
  const fuse = useMemo(() => {
    return new Fuse(VSIC_CODES, {
      keys: ['name', 'keywords', 'code'],
      threshold: 0.3,
      distance: 100,
      minMatchCharLength: 2,
    });
  }, []);
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    // Use Fuse to search and filter out already selected lines
    const searchResults = fuse.search(searchTerm);
    return searchResults
      .filter(result => !selectedLines.some(s => s.code === result.item.code))
      .map(result => result.item)
      .slice(0, 10);
  }, [searchTerm, selectedLines, fuse]);
  const addLine = (line: VSICLine) => {
    const newLines = [...selectedLines, line];
    onChange(newLines);
    if (newLines.length === 1) {
      onPrimaryChange(line.code);
    }
    setSearchTerm("");
  };
  const removeLine = (code: string) => {
    const newLines = selectedLines.filter(l => l.code !== code);
    onChange(newLines);
    if (primaryCode === code) {
      onPrimaryChange(newLines.length > 0 ? newLines[0].code : "");
    }
  };
  const hasConditionalLines = selectedLines.some(l => l.isConditional);
  const conditionalNotes = selectedLines
    .filter(l => l.isConditional)
    .map(l => ({ name: l.name, note: l.conditionNote }));
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="font-bold text-sm uppercase tracking-widest text-slate-500">
          Tìm kiếm ngành nghề (Mã VSIC hoặc Tên)
        </Label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="VD: 6201, Lập trình, Bất động sản..."
            className="h-14 pl-12 pr-4 text-base border-2 focus-visible:ring-blue-500 rounded-2xl shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
          {isFocused && filteredResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="max-h-80 overflow-y-auto">
                {filteredResults.map(item => (
                  <div
                    key={item.code}
                    className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none group"
                    onMouseDown={() => addLine(item)}
                  >
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-blue-600 text-sm tracking-tight">{item.code}</span>
                        {item.isConditional && (
                          <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-200 bg-amber-50 h-5 px-1.5 uppercase font-bold">
                            Điều kiện
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug group-hover:text-blue-700 transition-colors">
                        {item.name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.keywords.slice(0, 3).map(kw => (
                          <span key={kw} className="text-[10px] text-slate-400 font-medium">#{kw.toLowerCase()}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <Label className="font-bold text-sm uppercase tracking-widest text-slate-500">
          Danh sách ngành nghề đã chọn ({selectedLines.length})
        </Label>
        {selectedLines.length === 0 ? (
          <div className="border-2 border-dashed border-slate-100 rounded-3xl p-12 text-center space-y-3 bg-slate-50/30">
            <Info className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-400 font-bold">Hãy nhập từ khóa để bắt đầu chọn ngành nghề</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedLines.map(line => (
              <div
                key={line.code}
                className={cn(
                  "p-5 rounded-2xl border-2 flex items-center justify-between transition-all group animate-in slide-in-from-right-2",
                  primaryCode === line.code
                    ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20"
                    : "border-slate-100 bg-white dark:bg-slate-900 hover:border-slate-200"
                )}
              >
                <div className="flex items-center gap-4 flex-grow">
                  <button
                    onClick={() => onPrimaryChange(line.code)}
                    className={cn(
                      "p-3 rounded-xl transition-all shadow-sm",
                      primaryCode === line.code
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    )}
                    title="Đặt làm ngành chính"
                  >
                    <Star className={cn("h-5 w-5", primaryCode === line.code && "fill-current")} />
                  </button>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-400 uppercase">{line.code}</span>
                      {primaryCode === line.code && (
                        <Badge className="bg-blue-600 text-[9px] font-black uppercase tracking-tighter px-2 h-5">Ngành chính</Badge>
                      )}
                      {line.isConditional && (
                        <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-200 h-5">Điều kiện</Badge>
                      )}
                    </div>
                    <p className="text-base font-bold text-slate-700 dark:text-slate-100 leading-tight">{line.name}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLine(line.code)}
                  className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {hasConditionalLines && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-900 animate-in slide-in-from-top-4 duration-500 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-black text-xs uppercase tracking-widest mb-4">Lưu ý pháp lý: Ngành nghề có điều kiện</AlertTitle>
          <AlertDescription className="space-y-4">
            <div className="grid gap-3">
              {conditionalNotes.map((item, idx) => (
                <div key={idx} className="bg-white/80 p-4 rounded-xl border border-amber-100 shadow-sm">
                  <p className="font-black text-[10px] uppercase text-amber-700 mb-1 tracking-wider">{item.name}</p>
                  <p className="text-sm text-amber-900 leading-relaxed font-medium">{item.note}</p>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="condition-confirm"
                checked={confirmedConditions}
                onCheckedChange={(v) => onConditionsConfirmed(!!v)}
                className="mt-1 data-[state=checked]:bg-amber-600 border-amber-300"
              />
              <Label htmlFor="condition-confirm" className="text-sm font-bold leading-relaxed text-amber-800 cursor-pointer">
                Tôi đã đọc và hiểu rằng các ngành nghề trên yêu cầu điều kiện đặc biệt. CONTI sẽ tư vấn chi tiết sau khi nhận hồ sơ.
              </Label>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {selectedLines.length > 0 && primaryCode && (
        <div className="bg-brand-navy p-6 rounded-3xl text-white shadow-2xl shadow-blue-900/20 flex items-center gap-5 animate-in zoom-in-95 border-b-4 border-blue-500">
          <div className="bg-blue-500 p-3 rounded-2xl shadow-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-1">Ngành kinh doanh trọng tâm</p>
            <p className="text-lg font-display font-bold leading-tight uppercase tracking-tight">
              {selectedLines.find(l => l.code === primaryCode)?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
