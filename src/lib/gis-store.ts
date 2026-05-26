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
}

type Listener = () => void;

class GisStore {
  private features: GisFeature[] = [];
  private selectedId: string | null = null;
  private listeners = new Set<Listener>();
  private snapshot: { features: GisFeature[]; selectedId: string | null } = {
    features: this.features,
    selectedId: this.selectedId,
  };

  getSnapshot = () => this.snapshot;

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  private emit() {
    this.snapshot = { features: this.features, selectedId: this.selectedId };
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

  remove(id: string) {
    this.features = this.features.filter((f) => f.id !== id);
    if (this.selectedId === id) this.selectedId = null;
    this.emit();
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
