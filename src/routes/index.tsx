import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapCanvas } from "@/components/gis/MapCanvas";
import { AttributePanel } from "@/components/gis/AttributePanel";
import { FeatureTable } from "@/components/gis/FeatureTable";
import { ImportGeoJSON } from "@/components/gis/ImportGeoJSON";
import { MapClock } from "@/components/gis/MapClock";
import { useGisStore } from "@/lib/gis-store";

import {
  Layers,
  CircleCheck as CheckCircle2,
  CircleX as XCircle,
  MessageSquare,
  User,
  Settings,
  LogIn,
  LogOut,
  ChevronDown,
  GitPullRequestArrow,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/")({
  ssr: false,
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
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");

  const guard = () => {
    if (features.length === 0) {
      toast.error("No features available");
      return false;
    }
    return true;
  };

  const handleApprove = () => {
    if (!guard()) return;
    toast.success(`Approved ${features.length} feature${features.length === 1 ? "" : "s"}`);
  };

  const handleReject = () => {
    if (!guard()) return;
    toast.success(`Rejected ${features.length} feature${features.length === 1 ? "" : "s"}`);
  };

  const handleSendReturn = () => {
    if (!returnComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    toast.success(`Returned ${features.length} feature${features.length === 1 ? "" : "s"} with comment`);
    setReturnComment("");
    setReturnOpen(false);
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
            <h1 className="text-base font-bold leading-none tracking-tight">
              Crimson<span className="text-primary">GIS</span>
            </h1>
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Web Mapping Workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <ImportGeoJSON />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                disabled={features.length === 0}
              >
                <GitPullRequestArrow className="h-3.5 w-3.5" />
                Review
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 z-[2000]">
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleApprove}>
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => setReturnOpen(true)}
              >
                <MessageSquare className="h-4 w-4" />
                Return with comment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <DropdownMenuContent align="end" className="w-44">
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
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <MapCanvas />
          </div>
          <div className="h-72 shrink-0">
            <FeatureTable />
          </div>
        </div>
        <aside className="hidden w-96 shrink-0 border-l border-border bg-card md:block">
          <AttributePanel />
        </aside>
      </div>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Return with comment</DialogTitle>
            <DialogDescription>
              Add a note explaining why these features are being returned.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={returnComment}
            onChange={(e) => setReturnComment(e.target.value)}
            placeholder="Type your comment..."
            className="min-h-32"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReturn}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
