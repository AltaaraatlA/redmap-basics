import { gisStore, useGisStore } from "@/lib/gis-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Spline, Hexagon, Type as TypeIcon } from "lucide-react";

const typeIcon = {
  Point: MapPin,
  LineString: Spline,
  Polygon: Hexagon,
  Label: TypeIcon,
} as const;

export function AttributePanel() {
  const { features, selectedId } = useGisStore();
  const f = features.find((x) => x.id === selectedId);

  if (!f) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
        <div className="mb-3 h-10 w-10 rounded-full border-2 border-dashed border-border" />
        <p className="font-medium text-foreground">No feature selected</p>
        <p className="mt-1">Pick one on the map or in the table, or draw a new one.</p>
      </div>
    );
  }

  const Icon = typeIcon[f.type];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{f.name}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {f.type} · #{f.id.slice(-5)}
          </div>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto p-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
          <Input
            value={f.name}
            onChange={(e) => gisStore.update(f.id, { name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
          <Input
            value={f.category}
            onChange={(e) => gisStore.update(f.id, { category: e.target.value })}
            placeholder="e.g. road, building, poi"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Notes</Label>
          <Textarea
            rows={4}
            value={f.notes}
            onChange={(e) => gisStore.update(f.id, { notes: e.target.value })}
            placeholder="Free-form description…"
          />
        </div>

        <div className="rounded-md border border-border bg-muted/40 p-3">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            Geometry (GeoJSON)
          </div>
          <pre className="max-h-40 overflow-auto font-mono text-[10.5px] leading-snug text-foreground/80">
{JSON.stringify(f.geojson.geometry, null, 2)}
          </pre>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => gisStore.remove(f.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete feature
        </Button>
      </div>
    </div>
  );
}
