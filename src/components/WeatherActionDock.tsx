import { Copy, History, MapPinned, Navigation, Share2, Star, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { getSearchHistory } from "@/services/historyStorage";
import { temperature } from "@/services/unitConverter";
import type { LocationSuggestion } from "@/types/weather";
import type { TemperatureUnit, WeatherData } from "@/types/weather";

const FAVORITES_KEY = "weatherlywave_favorite_locations";

export function WeatherActionDock({
  data,
  unit,
  onSearch
}: {
  data: WeatherData;
  unit: TemperatureUnit;
  onSearch: (location: string) => void | Promise<void>;
}) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<LocationSuggestion[]>([]);
  const [hubOpen, setHubOpen] = useState(false);
  const temp = temperature(data.current.temperature, unit);
  const currentName = data.locationName;
  const isSaved = favorites.includes(currentName);
  const coordinateLabel = `${data.coords.lat.toFixed(4)}, ${data.coords.lon.toFixed(4)}`;
  const shareText = `${currentName}: ${temp.value}\u00b0${temp.unit}, ${data.current.condition}. Wind ${data.current.windSpeed} km/h, humidity ${data.current.humidity}%.`;

  useEffect(() => {
    setFavorites(loadFavorites());
    setRecent(getSearchHistory().slice(0, 8));
  }, []);

  useEffect(() => {
    if (hubOpen) setRecent(getSearchHistory().slice(0, 8));
  }, [hubOpen]);

  function persist(next: string[]) {
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }

  function saveLocation() {
    if (isSaved) {
      toast.info("Location is already saved");
      return;
    }
    persist([currentName, ...favorites.filter((item) => item !== currentName)].slice(0, 6));
    toast.success("Location saved");
  }

  function removeLocation(location: string) {
    persist(favorites.filter((item) => item !== location));
    toast.success("Saved location removed");
  }

  async function shareWeather() {
    if (navigator.share) {
      await navigator.share({ title: "WeatherlyWave", text: shareText }).catch(() => undefined);
      return;
    }
    await copyText(shareText, "Forecast copied");
  }

  return (
    <section className="section-card p-4 sm:p-5">
      <SectionHeader eyebrow="Tools" title="Quick Actions" meta="Save, share, and jump between places." />

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <ActionButton icon={<MapPinned />} label="Locations" detail="Hub" onClick={() => setHubOpen(true)} />
        <ActionButton icon={<Star />} label={isSaved ? "Saved" : "Save"} detail="Favorite" onClick={saveLocation} active={isSaved} />
        <ActionButton icon={<Share2 />} label="Share" detail="Forecast" onClick={shareWeather} />
        <ActionButton icon={<Copy />} label="Copy" detail="Coords" onClick={() => copyText(coordinateLabel, "Coordinates copied")} />
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-300">
          <MapPinned className="size-4 text-sky-200" /> Saved Locations
        </div>
        {favorites.length ? (
          <div className="flex flex-wrap gap-2">
            {favorites.map((location) => (
              <span key={location} className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-slate-950/[0.45] p-1 pl-3">
                <button
                  type="button"
                  className="max-w-40 truncate text-xs text-white transition hover:text-sky-200"
                  onClick={() => onSearch(location)}
                  title={location}
                >
                  {location}
                </button>
                <button
                  type="button"
                  className="rounded-full p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
                  onClick={() => removeLocation(location)}
                  aria-label={`Remove ${location}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Save this location to create a fast-switch list.</p>
        )}
      </div>

      {hubOpen && (
        <LocationHub
          currentName={currentName}
          coordinateLabel={coordinateLabel}
          favorites={favorites}
          recent={recent}
          onClose={() => setHubOpen(false)}
          onSearch={(location) => {
            setHubOpen(false);
            void onSearch(location);
          }}
          onRemoveFavorite={removeLocation}
        />
      )}
    </section>
  );
}

function LocationHub({
  currentName,
  coordinateLabel,
  favorites,
  recent,
  onClose,
  onSearch,
  onRemoveFavorite
}: {
  currentName: string;
  coordinateLabel: string;
  favorites: string[];
  recent: LocationSuggestion[];
  onClose: () => void;
  onSearch: (location: string) => void;
  onRemoveFavorite: (location: string) => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-black/[0.65] backdrop-blur-sm" aria-label="Close location hub" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-hub-title"
        className="fixed bottom-0 left-0 right-0 mx-auto max-h-[82vh] max-w-2xl overflow-hidden rounded-t-2xl border border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200/70">Switcher</p>
            <h2 id="location-hub-title" className="mt-1 text-xl font-semibold">
              Location Hub
            </h2>
            <p className="mt-1 text-sm text-slate-400">Saved places, recent searches, and precise coordinates.</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close location hub">
            <X />
          </Button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto pr-1">
          <LocationRow
            icon={<Navigation />}
            title="Current Coordinates"
            detail={coordinateLabel}
            actionLabel="Use"
            onClick={() => onSearch(coordinateLabel)}
          />
          <LocationGroup title="Saved Locations" empty="No saved locations yet.">
            {favorites.map((location) => (
              <LocationRow
                key={location}
                icon={<Star />}
                title={location}
                detail="Favorite"
                actionLabel="Open"
                onClick={() => onSearch(location)}
                trailing={
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white"
                    onClick={() => onRemoveFavorite(location)}
                    aria-label={`Remove ${location}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                }
              />
            ))}
          </LocationGroup>
          <LocationGroup title="Recent Searches" empty="Recent searches will appear here.">
            {recent
              .filter((item) => item.displayName !== currentName)
              .slice(0, 6)
              .map((item) => (
                <LocationRow
                  key={`${item.displayName}-${item.lat}-${item.lon}`}
                  icon={<History />}
                  title={item.name}
                  detail={item.displayName}
                  actionLabel="Open"
                  onClick={() => onSearch(item.displayName)}
                />
              ))}
          </LocationGroup>
        </div>
      </section>
    </div>,
    document.body
  );
}

function LocationGroup({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
      <div className="space-y-2">{hasChildren ? children : <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-slate-500">{empty}</p>}</div>
    </div>
  );
}

function LocationRow({
  icon,
  title,
  detail,
  actionLabel,
  onClick,
  trailing
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  actionLabel: string;
  onClick: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <span className="rounded-lg bg-white/[0.08] p-2 text-sky-200 [&_svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{title}</p>
        <p className="truncate text-xs text-slate-500">{detail}</p>
      </div>
      {trailing}
      <Button variant="outline" size="sm" onClick={onClick}>
        {actionLabel}
      </Button>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  detail,
  onClick,
  active = false
}: {
  icon: ReactNode;
  label: string;
  detail: string;
  onClick: () => void | Promise<void>;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      className="h-auto min-h-14 justify-start rounded-xl p-3 text-left"
      aria-label={`${label} ${detail}`}
      onClick={() => void onClick()}
    >
      <span className="rounded-lg bg-white/10 p-2 text-current [&_svg]:size-4">{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className={active ? "block text-xs text-slate-800" : "block text-xs text-slate-400"}>{detail}</span>
      </span>
    </Button>
  );
}

function loadFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

async function copyText(text: string, success: string) {
  await navigator.clipboard?.writeText(text).catch(() => undefined);
  toast.success(success);
}
