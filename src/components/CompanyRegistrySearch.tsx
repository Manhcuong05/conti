import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { CompanyRegistryEntry } from "@shared/types";

interface CompanyRegistrySearchProps {
  query: string;
  onSelect: (entry: CompanyRegistryEntry) => void;
}

const MIN_QUERY_LENGTH = 2;

export function CompanyRegistrySearch({ query, onSelect }: CompanyRegistrySearchProps) {
  const [results, setResults] = useState<CompanyRegistryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipNextFetch = useRef(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setOpen(false);
      setError(null);
      return;
    }
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setOpen(true);
      try {
        const data = await api<CompanyRegistryEntry[]>(`/api/company-search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        setResults(data);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setError("Không thể tìm kiếm lúc này.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  if (!open && !loading) return null;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30">
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            Đang tìm doanh nghiệp...
          </div>
        )}
        {!loading && error && <div className="px-4 py-3 text-sm text-red-600 font-medium">{error}</div>}
        {!loading && !error && results.length === 0 && (
          <div className="px-4 py-3 text-sm text-slate-500">Không tìm thấy doanh nghiệp phù hợp.</div>
        )}
        {!loading && results.length > 0 && (
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {results.map((item) => (
          <button
            key={`${item.name}-${item.msdn ?? item.msnb ?? ""}`}
            type="button"
            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
              skipNextFetch.current = true;
              setResults([]);
              setLoading(false);
              setError(null);
              setOpen(false);
            }}
          >
            <div className="text-sm font-bold text-red-700 leading-snug uppercase">{item.name}</div>
            <div className="text-xs text-slate-600 mt-1 font-semibold flex flex-wrap gap-2 items-center">
                  {item.msnb && <span>MSNB: {item.msnb}</span>}
                  {item.msnb && item.msdn && <span className="text-slate-400">|</span>}
                  {item.msdn && <span>MSDN: {item.msdn}</span>}
                  {item.status && <span className="text-green-700 ml-auto">{item.status}</span>}
                </div>
                {item.address && <div className="text-xs text-slate-500 mt-1">{item.address}</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
