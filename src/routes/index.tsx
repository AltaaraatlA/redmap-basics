import { createFileRoute } from "@tanstack/react-router";
import { MapCanvas } from "@/components/gis/MapCanvas";
import { AttributePanel } from "@/components/gis/AttributePanel";
import { FeatureTable } from "@/components/gis/FeatureTable";
import { ImportGeoJSON } from "@/components/gis/ImportGeoJSON";
import { MapClock } from "@/components/gis/MapClock";
import { useGisStore } from "@/lib/gis-store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Layers,
  CircleCheck as CheckCircle2,
  User,
  Settings,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Index,
  head: () => ({
    meta: [
      { title: "Metapolis — Web Mapping Workspace" }, // ИЗМЕНЕНИЕ: Название в заголовке вкладки
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

  const handleApprove = () => {
    if (features.length === 0) {
      toast.error("No features to approve");
      return;
    }
    toast.success(`Approved ${features.length} feature${features.length === 1 ? "" : "s"}`);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top bar */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            {/* ИЗМЕНЕНИЕ: Название в интерфейсе */}
            <h1 className="text-base font-bold leading-none tracking-tight">
              Metapolis
            </h1>
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Web Mapping Workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <ImportGeoJSON />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleApprove}
            disabled={features.length === 0}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve
          </Button>
          <span>
            <span className="font-semibold text-foreground">{features.length}</span> features
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <MapClock />
          <span className="hidden h-4 w-px bg-border sm:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-xs font-medium">Profile</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            {/* ИЗМЕНЕНИЕ: Добавлен z-[1200], чтобы меню было поверх всех панелей */}
            <DropdownMenuContent align="end" className="w-44 z-[1200]">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <LogIn className="h-4 w-4" />
                Log in
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main */}
      <div className="flex min-h-0 min-w-0 flex-1">
        <ResizablePanelGroup orientation="horizontal" className="min-w-0 flex-1">
          <ResizablePanel defaultSize={60} minSize={5} className="min-w-0">
            <ResizablePanelGroup orientation="vertical" className="min-h-0">
              <ResizablePanel defaultSize={70} minSize={20} className="min-h-0">
                <div className="relative h-full w-full">
                  <MapCanvas />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={10} collapsible collapsedSize={4} className="min-h-0">
                <FeatureTable />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={40}
            minSize={15}
            maxSize={95}
            className="hidden min-w-0 border-l border-border bg-card md:block"
          >
            <AttributePanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
