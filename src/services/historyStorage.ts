import type { LocationSuggestion } from "@/types/weather";

const HISTORY_KEY = "weatherpro_search_history";
const MAX_HISTORY = 20;

export function getSearchHistory(): LocationSuggestion[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? (JSON.parse(saved) as LocationSuggestion[]) : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(location: Pick<LocationSuggestion, "name" | "displayName" | "lat" | "lon" | "country" | "state">) {
  if (!location.displayName) return;
  const entry: LocationSuggestion = {
    ...location,
    type: "history",
    confidence: 90
  };
  const next = [entry, ...getSearchHistory().filter((item) => item.displayName !== entry.displayName)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}
