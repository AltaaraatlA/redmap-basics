import { gisStore, useGisStore } from "@/lib/gis-store";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Spline, Hexagon, Type as TypeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcon = {
  Point: MapPin,
  LineString: Spline,
  Polygon: Hexagon,
  Label: TypeIcon,
} as const;

export function FeatureTable() {
  const { features, selectedId } = useGisStore();

  return (
    <div className="pointer-events-auto flex h-full flex-col overflow-hidden border-t border-border bg-card/95 backdrop-blur">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Feature Table</span>
          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {features.length}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {features.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Use the toolbar on the left to draw your first feature.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-8 px-3 py-2 text-left"></th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Notes</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => {
                const Icon = typeIcon[f.type];
                const sel = f.id === selectedId;
                return (
                  <tr
                    key={f.id}
                    onClick={() => gisStore.select(f.id)}
                    className={cn(
                      "cursor-pointer border-b border-border/60 transition-colors hover:bg-accent/50",
                      sel && "bg-accent"
                    )}
                  >
                    <td className="px-3 py-2">
                      <Icon className={cn("h-4 w-4", sel ? "text-primary" : "text-muted-foreground")} />
                    </td>
                    <td className="px-3 py-2 font-medium">{f.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{f.type}</td>
                    <td className="px-3 py-2 text-muted-foreground">{f.category}</td>
                    <td className="max-w-xs truncate px-3 py-2 text-muted-foreground">
                      {f.notes || "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                      {new Date(f.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          gisStore.remove(f.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
