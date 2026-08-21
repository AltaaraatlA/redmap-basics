import { useMemo, useState } from "react";
import { gisStore, useGisStore } from "@/lib/gis-store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Eye,
  EyeOff,
  MapPin,
  Spline,
  Hexagon,
  Type as TypeIcon,
  Layers as LayersIcon,
  Map as MapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const typeIcon = {
  Point: MapPin,
  LineString: Spline,
  Polygon: Hexagon,
  Label: TypeIcon,
} as const;

interface CategoryGroup {
  category: string;
  features: { id: string; name: string; type: keyof typeof typeIcon }[];
}

export function LayersPanel() {
  const { features, hiddenIds } = useGisStore();
  const { t } = useLang();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const groups = useMemo<CategoryGroup[]>(() => {
    const map = new Map<string, CategoryGroup>();
    for (const f of features) {
      let g = map.get(f.category);
      if (!g) {
        g = { category: f.category, features: [] };
        map.set(f.category, g);
      }
      g.features.push({ id: f.id, name: f.name, type: f.type });
    }
    return Array.from(map.values()).sort((a, b) => a.category.localeCompare(b.category));
  }, [features]);

  const toggleExpand = (cat: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const isCategoryVisible = (group: CategoryGroup) =>
    group.features.some((f) => !hiddenIds.has(f.id));

  const toggleCategory = (group: CategoryGroup) => {
    const visible = isCategoryVisible(group);
    gisStore.setCategoryVisibility(group.category, !visible, group.features.map((f) => f.id));
  };

  const toggleFeature = (id: string) => {
    gisStore.toggleVisibility(id);
  };

  const zoomToGroup = (group: CategoryGroup) => {
    window.dispatchEvent(
      new CustomEvent("gis:fit-features", { detail: group.features.map((f) => f.id) }),
    );
  };

  const zoomToFeature = (id: string) => {
    window.dispatchEvent(new CustomEvent("gis:fit-features", { detail: [id] }));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5 shrink-0">
        <LayersIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider">{t("userLayers")}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Basemap section */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 px-1">
            <MapIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("basemap")}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
            <span className="text-sm font-medium">{t("basemapOsm")}</span>
            <Eye className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>

        {/* User Layers section */}
        <div className="space-y-1.5">
          <div className="px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("userLayers")}
            </span>
          </div>

          {groups.length === 0 ? (
            <p className="px-2 py-4 text-xs text-muted-foreground">{t("noLayers")}</p>
          ) : (
            <div className="space-y-1">
              {groups.map((group) => {
                const catVisible = isCategoryVisible(group);
                const isOpen = expanded.has(group.category);
                return (
                  <div key={group.category} className="rounded-md border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-1 px-2 py-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(group.category)}
                        className="flex items-center gap-1 flex-1 min-w-0 text-left outline-none"
                      >
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0",
                            isOpen && "rotate-90",
                          )}
                        />
                        <span className="truncate text-sm font-medium">{group.category}</span>
                        <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground shrink-0">
                          {group.features.length}
                        </span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => toggleCategory(group)}
                        title={catVisible ? t("hideFromMap") : t("showOnMap")}
                      >
                        {catVisible ? (
                          <Eye className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => zoomToGroup(group)}
                        title={t("zoomToLayer")}
                      >
                        <MapIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-border/60">
                        {group.features.map((f) => {
                          const Icon = typeIcon[f.type];
                          const visible = !hiddenIds.has(f.id);
                          return (
                            <div
                              key={f.id}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent/40 transition-colors"
                            >
                              <button
                                type="button"
                                onClick={() => gisStore.select(f.id)}
                                className="flex items-center gap-2 flex-1 min-w-0 text-left outline-none"
                              >
                                <Icon
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    visible ? "text-muted-foreground" : "text-muted-foreground/40",
                                  )}
                                />
                                <span
                                  className={cn(
                                    "truncate text-xs",
                                    !visible && "text-muted-foreground/50 line-through",
                                  )}
                                >
                                  {f.name}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleFeature(f.id)}
                                className="shrink-0 outline-none"
                                title={visible ? t("hideFromMap") : t("showOnMap")}
                              >
                                {visible ? (
                                  <Eye className="h-3 w-3 text-primary/70" />
                                ) : (
                                  <EyeOff className="h-3 w-3 text-muted-foreground/50" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => zoomToFeature(f.id)}
                                className="shrink-0 outline-none"
                                title={t("zoomToFeature")}
                              >
                                <MapIcon className="h-3 w-3 text-muted-foreground/70 hover:text-primary" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export { LayersPanel }