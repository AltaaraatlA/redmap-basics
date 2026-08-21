import { useSyncExternalStore } from "react";
import type { Feature } from "geojson";

export type GeomType = "Point" | "LineString" | "Polygon" | "Label";

export interface GisFeature {
  id: string;
  name: string;
  type: GeomType;
  category: string;
  notes: string;
  createdAt: number;
  geojson: Feature;
  properties: Record<string, unknown>;
}

type Listener = () => void;

export interface GisSnapshot {
  features: GisFeature[];
  selectedId: string | null;
  hiddenIds: Set<string>;
}

class GisStore {
  private features: GisFeature[] = [];
  private selectedId: string | null = null;
  private hiddenIds = new Set<string>();
  private listeners = new Set<Listener>();
  private snapshot: GisSnapshot = {
    features: this.features,
    selectedId: this.selectedId,
    hiddenIds: this.hiddenIds,
  };

  getSnapshot = () => this.snapshot;

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  private emit() {
    this.snapshot = {
      features: this.features,
      selectedId: this.selectedId,
      hiddenIds: new Set(this.hiddenIds),
    };
    this.listeners.forEach((l) => l());
  }

  add(f: GisFeature) {
    this.features = [...this.features, f];
    this.emit();
  }

  update(id: string, patch: Partial<GisFeature>) {
    this.features = this.features.map((f) => (f.id === id ? { ...f, ...patch } : f));
    this.emit();
  }

  updateProperty(id: string, key: string, value: unknown) {
    this.features = this.features.map((f) => {
      if (f.id !== id) return f;
      const properties = { ...f.properties, [key]: value };
      const geojson: Feature = { ...f.geojson, properties };
      return { ...f, properties, geojson };
    });
    this.emit();
  }

  renameProperty(id: string, oldKey: string, newKey: string) {
    this.features = this.features.map((f) => {
      if (f.id !== id) return f;
      const properties: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(f.properties)) {
        properties[k === oldKey ? newKey : k] = v;
      }
      const geojson: Feature = { ...f.geojson, properties };
      return { ...f, properties, geojson };
    });
    this.emit();
  }

  deleteProperty(id: string, key: string) {
    this.features = this.features.map((f) => {
      if (f.id !== id) return f;
      const properties = { ...f.properties };
      delete properties[key];
      const geojson: Feature = { ...f.geojson, properties };
      return { ...f, properties, geojson };
    });
    this.emit();
  }

  addProperty(id: string, key: string, value: unknown = "") {
    this.features = this.features.map((f) => {
      if (f.id !== id) return f;
      const properties = { ...f.properties, [key]: value };
      const geojson: Feature = { ...f.geojson, properties };
      return { ...f, properties, geojson };
    });
    this.emit();
  }

  remove(id: string) {
    this.features = this.features.filter((f) => f.id !== id);
    this.hiddenIds.delete(id);
    if (this.selectedId === id) this.selectedId = null;
    this.emit();
  }

  toggleVisibility(id: string) {
    if (this.hiddenIds.has(id)) {
      this.hiddenIds.delete(id);
    } else {
      this.hiddenIds.add(id);
    }
    this.emit();
  }

  setCategoryVisibility(category: string, visible: boolean, featureIds: string[]) {
    for (const id of featureIds) {
      if (visible) {
        this.hiddenIds.delete(id);
      } else {
        this.hiddenIds.add(id);
      }
    }
    this.emit();
  }

  isVisible(id: string) {
    return !this.hiddenIds.has(id);
  }

  select(id: string | null) {
    if (this.selectedId === id) return;
    this.selectedId = id;
    this.emit();
  }

  get(id: string) {
    return this.features.find((f) => f.id === id);
  }
}

export const gisStore = new GisStore();

export function useGisStore() {
  return useSyncExternalStore(gisStore.subscribe, gisStore.getSnapshot, gisStore.getSnapshot);
}

export const newId = () =>
  `f_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
