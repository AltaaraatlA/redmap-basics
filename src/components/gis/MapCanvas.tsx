import { useEffect, useRef } from "react";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import { gisStore, useGisStore, newId, type GisFeature, type GeomType } from "@/lib/gis-store";

// Fix default marker icon paths (Vite bundling)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const RED = "#dc2626";
const RED_DEEP = "#991b1b";

const featureStyle = (selected: boolean) => ({
  color: selected ? RED_DEEP : RED,
  weight: selected ? 4 : 2.5,
  fillColor: RED,
  fillOpacity: selected ? 0.35 : 0.18,
});

function makeLabelIcon(text: string, selected: boolean) {
  return L.divIcon({
    className: "gis-label",
    html: `<div style="
      background:${selected ? RED_DEEP : "white"};
      color:${selected ? "white" : RED_DEEP};
      border:1.5px solid ${RED};
      padding:3px 8px;border-radius:6px;
      font:600 12px/1 'Inter',sans-serif;
      box-shadow:0 2px 8px rgba(0,0,0,.15);white-space:nowrap;
    ">${text.replace(/[<>&]/g, (c) => ({ "<": "<", ">": ">", "&": "&" }[c]!))}</div>`,
    iconSize: undefined as unknown as L.PointTuple,
    iconAnchor: [0, 0],
  });
}

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Map<string, L.Layer>>(new Map());
  const { features, selectedId } = useGisStore();

  // init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [55.752004, 37.617734],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const emitCenter = () => {
      const c = map.getCenter();
      window.dispatchEvent(
        new CustomEvent("gis:map-center", { detail: { lat: c.lat, lng: c.lng } }),
      );
    };
    map.on("moveend", emitCenter);
    emitCenter();

    map.pm.addControls({
      position: "topleft",
      drawMarker: true,
      drawPolyline: true,
      drawPolygon: true,
      drawRectangle: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawText: true,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    });
    map.pm.setLang("en");
    map.pm.setPathOptions(featureStyle(false));

    map.on("pm:create", (e: { shape: string; layer: L.Layer }) => {
      const layer = e.layer as L.Layer & { toGeoJSON: () => GeoJSON.Feature; _latlng?: L.LatLng };
      const shape = e.shape;
      let type: GeomType = "Point";
      if (shape === "Marker") type = "Point";
      else if (shape === "Line") type = "LineString";
      else if (shape === "Polygon") type = "Polygon";
      else if (shape === "Text") type = "Label";

      const gj = layer.toGeoJSON();
      const id = newId();
      const name =
        type === "Label"
          ? ((layer as unknown as { pm: { getText: () => string } }).pm?.getText?.() ?? "Label")
          : `${type} ${gisStore.getSnapshot().features.length + 1}`;

      map.removeLayer(layer);

      gisStore.add({
        id,
        name,
        type,
        category: "default",
        notes: "",
        createdAt: Date.now(),
        geojson: gj,
      });
      gisStore.select(id);
    });

    mapRef.current = map;

    // ИСПРАВЛЕНИЕ 1: Принудительно обновляем размер карты после инициализации
    // Это решает проблему "серых квадратов", если контейнер еще не отрисовался до конца
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ИСПРАВЛЕНИЕ 2: Слушаем изменение размера окна, чтобы карта перерисовывалась
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // sync store -> layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existing = layersRef.current;
    const nextIds = new Set(features.map((f) => f.id));

    // remove gone
    for (const [id, layer] of existing) {
      if (!nextIds.has(id)) {
        map.removeLayer(layer);
        existing.delete(id);
      }
    }

    for (const f of features) {
      const selected = f.id === selectedId;
      const prev = existing.get(f.id);
      if (prev) {
        if ("setStyle" in prev && f.type !== "Point" && f.type !== "Label") {
          (prev as L.Path).setStyle(featureStyle(selected));
        }
        if (f.type === "Label" && prev instanceof L.Marker) {
          prev.setIcon(makeLabelIcon(f.name, selected));
        }
        continue;
      }

      let layer: L.Layer;
      if (f.type === "Label") {
        const coords = (f.geojson.geometry as GeoJSON.Point).coordinates;
        layer = L.marker([coords[1], coords[0]], {
          icon: makeLabelIcon(f.name, selected),
          interactive: true,
        });
      } else {
        layer = L.geoJSON(f.geojson, {
          style: () => featureStyle(selected),
          pointToLayer: (_feat, latlng) => L.marker(latlng),
        });
      }
      layer.on("click", (ev: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(ev);
        gisStore.select(f.id);
      });
      layer.on("pm:edit", () => {
        const gj =
          "toGeoJSON" in layer
            ? (layer as unknown as { toGeoJSON: () => GeoJSON.Feature | GeoJSON.FeatureCollection }).toGeoJSON()
            : null;
        if (!gj) return;
        const feat = gj.type === "FeatureCollection" ? gj.features[0] : gj;
        gisStore.update(f.id, { geojson: feat });
      });

      layer.addTo(map);
      existing.set(f.id, layer);
    }

    // Toggle edit mode on selected layer only
    for (const [id, layer] of existing) {
      const l = layer as L.Layer & { pm?: { enable: (o?: unknown) => void; disable: () => void } };
      if (!l.pm) continue;
      if (id === selectedId) {
        l.pm.enable({ allowSelfIntersection: false });
      } else {
        l.pm.disable();
      }
    }
  }, [features, selectedId]);

  // background click clears selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onClick = () => gisStore.select(null);
    map.on("click", onClick);

    const onFit = (ev: Event) => {
      const ids = (ev as CustomEvent<string[]>).detail;
      setTimeout(() => {
        const layers = ids
          .map((id) => layersRef.current.get(id))
          .filter((l): l is L.Layer => !!l);
        if (layers.length === 0) return;
        const group = L.featureGroup(layers);
        const bounds = group.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
      }, 50);
    };
    window.addEventListener("gis:fit-features", onFit);

    return () => {
      map.off("click", onClick);
      window.removeEventListener("gis:fit-features", onFit);
    };
  }, []);

  // ИСПРАВЛЕНИЕ 3: Добавлен z-0, чтобы карта была в правильном слое
  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
