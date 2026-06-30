import { useEffect, useState } from "react";
import { gisStore, useGisStore } from "@/lib/gis-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, MapPin, Spline, Hexagon, Type as TypeIcon, Database, File as FileJson, Layers as LayersIcon, MessageSquare, GripVertical } from "lucide-react";

const typeIcon = {
  Point: MapPin,
  LineString: Spline,
  Polygon: Hexagon,
  Label: TypeIcon,
} as const;

export function AttributePanel() {
  const { features, selectedId } = useGisStore();
  const f = features.find((x) => x.id === selectedId);
  const Icon = f ? typeIcon[f.type] : null;

  // Логика изменения ширины
  const [width, setWidth] = useState(450); // Начальная ширина
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      // Убираем верхнее ограничение, оставляем только нижнее (минимум 250px)
      if (newWidth > 250) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = 'default'; // Возвращаем курсор
        document.body.style.userSelect = 'auto'; // Возвращаем выделение текста
      }
    };

    const handleMouseDown = () => {
      setIsResizing(true);
      document.body.style.cursor = 'ew-resize'; // Меняем курсор globally для удобства
      document.body.style.userSelect = 'none';  // Запрещаем выделение текста при драге
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    // z-50 чтобы перекрывать карту, shrink-0 чтобы не сжималась родителем
    <div
      className="flex h-full shrink-0 bg-background border-l border-border relative z-50"
      style={{ width: `${width}px`, minWidth: '300px', maxWidth: '100vw' }}
    >
      {/* Визуальная рукоятка для изменения размера */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px] cursor-ew-resize hover:bg-primary/80 z-[60] transition-colors group"
        onMouseDown={(e) => {
          e.preventDefault(); // Предотвращаем выделение текста
          setIsResizing(true);
        }}
      >
        {/* Визуальная полоска, которая появляется/подсвечивается */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border group-hover:bg-primary" />
      </div>

      <div className="flex h-full flex-col w-full overflow-hidden">
        <Tabs defaultValue="layers" className="flex h-full flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-card px-2">
            <TabsTrigger value="layers" className="flex-1 gap-1.5 min-w-0">
              <LayersIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Layers</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex-1 gap-1.5 min-w-0">
              <FileJson className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Features</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex-1 gap-1.5 min-w-0">
              <Database className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Database</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-1 gap-1.5 min-w-0">
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layers" className="flex-1 overflow-hidden m-0">
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
              <LayersIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium text-foreground">Layers</p>
              <p className="mt-1">Manage basemap and overlay layers here.</p>
              <p className="mt-2 text-xs text-muted-foreground/70">Coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="features" className="flex-1 overflow-hidden m-0">
            {f ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3 shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    {Icon && <Icon className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{f.name}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {f.type} · #{f.id.slice(-5)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 overflow-y-auto p-4 flex-1">
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

                <div className="border-t border-border p-3 shrink-0">
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
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
                <div className="mb-3 h-10 w-10 rounded-full border-2 border-dashed border-border" />
                <p className="font-medium text-foreground">No feature selected</p>
                <p className="mt-1">Pick one on the map or in the table, or draw a new one.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="database" className="flex-1 overflow-hidden m-0">
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
              <Database className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium text-foreground">Database Connection</p>
              <p className="mt-1">Connect to an external database to sync your features.</p>
              <p className="mt-2 text-xs text-muted-foreground/70">Coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 overflow-hidden m-0">
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
              <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium text-foreground">Chat</p>
              <p className="mt-1">Support team and AI assistant will be available here.</p>
              <p className="mt-2 text-xs text-muted-foreground/70">Coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
