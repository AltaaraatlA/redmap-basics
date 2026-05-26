import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { gisStore, newId, type GeomType, type GisFeature } from "@/lib/gis-store";

const SUPPORTED: GeomType[] = ["Point", "LineString", "Polygon"];

function flattenToFeatures(input: unknown): Feature[] {
  if (!input || typeof input !== "object") return [];
  const obj = input as { type?: string };
  if (obj.type === "FeatureCollection") {
    return (input as FeatureCollection).features ?? [];
  }
  if (obj.type === "Feature") {
    return [input as Feature];
  }
  // Bare geometry
  if (typeof obj.type === "string" && "coordinates" in (obj as Record<string, unknown>)) {
    return [{ type: "Feature", geometry: input as Geometry, properties: {} }];
  }
  return [];
}

function expandMulti(feat: Feature): Feature[] {
  const g = feat.geometry;
  if (!g) return [];
  switch (g.type) {
    case "MultiPoint":
      return g.coordinates.map((c) => ({
        ...feat,
        geometry: { type: "Point", coordinates: c },
      }));
    case "MultiLineString":
      return g.coordinates.map((c) => ({
        ...feat,
        geometry: { type: "LineString", coordinates: c },
      }));
    case "MultiPolygon":
      return g.coordinates.map((c) => ({
        ...feat,
        geometry: { type: "Polygon", coordinates: c },
      }));
    default:
      return [feat];
  }
}

function pickName(props: Record<string, unknown> | null, fallback: string): string {
  if (!props) return fallback;
  for (const k of ["name", "Name", "NAME", "title", "label"]) {
    const v = props[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return fallback;
}

export function ImportGeoJSON() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const raw = flattenToFeatures(parsed).flatMap(expandMulti);
      if (raw.length === 0) {
        toast.error("No GeoJSON features found in file.");
        return;
      }

      const added: GisFeature[] = [];
      let skipped = 0;
      const base = gisStore.getSnapshot().features.length;

      raw.forEach((feat, i) => {
        const gType = feat.geometry?.type as GeomType | undefined;
        if (!gType || !SUPPORTED.includes(gType)) {
          skipped++;
          return;
        }
        const props = (feat.properties ?? {}) as Record<string, unknown>;
        const name = pickName(props, `${gType} ${base + i + 1}`);
        const category =
          typeof props.category === "string"
            ? props.category
            : typeof props.type === "string"
              ? props.type
              : "imported";
        const notes = typeof props.notes === "string" ? props.notes : "";
        const f: GisFeature = {
          id: newId(),
          name,
          type: gType,
          category,
          notes,
          createdAt: Date.now(),
          geojson: { type: "Feature", geometry: feat.geometry, properties: props },
        };
        gisStore.add(f);
        added.push(f);
      });

      if (added.length === 0) {
        toast.error(`Skipped ${skipped} unsupported geometr${skipped === 1 ? "y" : "ies"}.`);
        return;
      }

      window.dispatchEvent(new CustomEvent("gis:fit-features", { detail: added.map((f) => f.id) }));
      toast.success(
        `Imported ${added.length} feature${added.length === 1 ? "" : "s"}${
          skipped ? ` · skipped ${skipped}` : ""
        }`
      );
    } catch (err) {
      console.error(err);
      toast.error("Invalid GeoJSON file.");
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".geojson,.json,application/geo+json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5" />
        Import GeoJSON
      </Button>
    </>
  );
}
