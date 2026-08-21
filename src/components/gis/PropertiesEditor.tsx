import { useState } from "react";
import { gisStore } from "@/lib/gis-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

function valueToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function PropertiesEditor({ featureId }: { featureId: string }) {
  const { t } = useLang();
  const [newKey, setNewKey] = useState("");

  const f = gisStore.get(featureId);
  if (!f) return null;

  const entries = Object.entries(f.properties);

  const handleAdd = () => {
    const key = newKey.trim() || t("newPropertyKey");
    let uniqueKey = key;
    let n = 1;
    while (uniqueKey in f.properties) {
      uniqueKey = `${key}_${n++}`;
    }
    gisStore.addProperty(featureId, uniqueKey, "");
    setNewKey("");
  };

  const handleRename = (oldKey: string, newKeyRaw: string) => {
    const newKey = newKeyRaw.trim();
    if (!newKey || newKey === oldKey) return;
    if (newKey in f.properties && newKey !== oldKey) return;
    gisStore.renameProperty(featureId, oldKey, newKey);
  };

  const handleValueChange = (key: string, value: string) => {
    gisStore.updateProperty(featureId, key, value);
  };

  const handleDelete = (key: string) => {
    gisStore.deleteProperty(featureId, key);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          {t("properties")}
        </Label>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
          {entries.length}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("noProperties")}</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  className="h-8 text-xs font-medium"
                  defaultValue={key}
                  onBlur={(e) => handleRename(key, e.target.value)}
                />
                <Input
                  className="h-8 text-xs"
                  value={valueToString(value)}
                  onChange={(e) => handleValueChange(key, e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(key)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          className="h-8 text-xs"
          placeholder={t("propertyKey")}
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
          {t("addProperty")}
        </Button>
      </div>
    </div>
  );
}
