import { useEffect, useState } from "react";
import tzlookup from "tz-lookup";

function formatTime(tz: string, now: Date) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
  } catch {
    return "--:--:--";
  }
}

export function MapClock() {
  const [tz, setTz] = useState<string>("UTC");
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const onCenter = (ev: Event) => {
      const { lat, lng } = (ev as CustomEvent<{ lat: number; lng: number }>).detail;
      try {
        setTz(tzlookup(lat, lng));
      } catch {
        setTz("UTC");
      }
    };
    window.addEventListener("gis:map-center", onCenter);
    return () => window.removeEventListener("gis:map-center", onCenter);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const local = formatTime(tz, now);
  const moscow = formatTime("Europe/Moscow", now);
  const tzLabel = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;

  return (
    <div className="relative z-[1200] flex items-center gap-2 whitespace-nowrap rounded-md border border-border bg-card/90 px-2.5 py-1 text-xs shadow-sm">
      <span className="hidden font-mono text-foreground sm:inline">
        <span className="text-muted-foreground">Loc</span>
        <span className="font-semibold">{local}</span>
        <span className="ml-1 text-[10px] text-muted-foreground">{tzLabel}</span>
        <span className="mx-1.5 text-border">·</span>
        <span className="text-muted-foreground">MSK</span>
        <span className="font-semibold">{moscow}</span>
      </span>
    </div>
  );
}
