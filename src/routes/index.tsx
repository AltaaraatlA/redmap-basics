import { createFileRoute } from "@tanstack/react-router";
import { MapCanvas } from "@/components/gis/MapCanvas";
import { AttributePanel } from "@/components/gis/AttributePanel";
import { FeatureTable } from "@/components/gis/FeatureTable";
import { ImportGeoJSON } from "@/components/gis/ImportGeoJSON";
import { useGisStore } from "@/lib/gis-store";
import { Layers } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Crimson GIS — Web Mapping Workspace" },
      {
        name: "description",
        content:
          "Lightweight web GIS: draw points, lines, polygons and labels, edit geometry and attributes, browse features in a table.",
      },
    ],
  }),
});

function Index() {
  const { features } = useGisStore();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top bar */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none tracking-tight">
              Crimson<span className="text-primary">GIS</span>
            </h1>
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Web Mapping Workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{features.length}</span> features
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="hidden sm:block">EPSG:4326 · CARTO Light basemap</span>
        </div>
      </header>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex-1">
            <MapCanvas />
          </div>
          <FeatureTable />
        </div>
        <aside className="hidden w-80 shrink-0 border-l border-border bg-card md:flex md:flex-col">
          <AttributePanel />
        </aside>
      </div>
    </div>
  );
}
