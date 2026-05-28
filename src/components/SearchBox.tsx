import { History, LocateFixed, MapPin, Search, SendHorizontal, Star } from "lucide-react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchService } from "@/services/searchService";
import type { LocationSuggestion } from "@/types/weather";

export function SearchBox({
  value,
  onSearch
}: {
  value: string;
  onSearch: (location: string) => void | Promise<void>;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const interactedRef = useRef(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      if (!interactedRef.current) return;
      if (query.trim().length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      const results = await searchService.searchLocations(query);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function submit(location = query) {
    const clean = location.trim();
    if (!clean) return;
    setOpen(false);
    void onSearch(clean);
  }

  return (
    <div ref={containerRef} className="group relative min-w-0 flex-1 lg:w-[27rem] lg:flex-none">
      <div className="absolute inset-0 rounded-xl bg-sky-500/10 blur-xl transition group-focus-within:bg-sky-500/20" />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sky-300" />
        <Input
          value={query}
          onChange={(event) => {
            interactedRef.current = true;
            setQuery(event.target.value);
          }}
          onFocus={() => {
            interactedRef.current = true;
            if (suggestions.length) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          className="h-10 rounded-xl border-white/10 bg-slate-950/55 pl-9 pr-12 focus:bg-slate-950/75"
          placeholder="Search city, zip code, or coordinates"
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => submit()}
          aria-label="Search location"
        >
          <SendHorizontal />
        </Button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {suggestions.map((suggestion) => {
            const SuggestionIcon = iconFor(suggestion.type);
            return (
              <button
                key={`${suggestion.displayName}-${suggestion.lat}-${suggestion.lon}`}
                type="button"
                className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition last:border-0 hover:bg-white/10"
                onClick={() => {
                  setQuery(suggestion.displayName);
                  submit(suggestion.displayName);
                }}
              >
                <span className="rounded-xl bg-white/[0.06] p-2 text-sky-200">
                  <SuggestionIcon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">{suggestion.name}</span>
                  <span className="block truncate text-xs text-slate-400">{suggestion.displayName}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function iconFor(type: LocationSuggestion["type"]): ComponentType<{ className?: string }> {
  if (type === "popular") return Star;
  if (type === "history") return History;
  if (type === "coordinates" || type === "current") return LocateFixed;
  return MapPin;
}
