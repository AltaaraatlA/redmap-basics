import { useSyncExternalStore } from "react";

export type Lang = "RU" | "EN";

const dict = {
  appTitle: { EN: "Metapolis", RU: "Метаполис" },
  appSubtitle: { EN: "Web Mapping Workspace", RU: "Веб-картографическое рабочее место" },
  approve: { EN: "Approve", RU: "Согласовать" },
  noFeaturesToApprove: { EN: "No features to approve", RU: "Нет объектов для согласования" },
  approved: { EN: "Approved", RU: "Согласовано" },
  features: { EN: "features", RU: "объектов" },
  profile: { EN: "Profile", RU: "Профиль" },
  settings: { EN: "Settings", RU: "Настройки" },
  login: { EN: "Log in", RU: "Войти" },
  logout: { EN: "Log out", RU: "Выйти" },
  importGeoJSON: { EN: "Import GeoJSON", RU: "Импорт GeoJSON" },
  noGeoJSONFound: { EN: "No GeoJSON features found in file.", RU: "В файле не найдено объектов GeoJSON." },
  invalidGeoJSON: { EN: "Invalid GeoJSON file.", RU: "Некорректный файл GeoJSON." },
  skipped: { EN: "skipped", RU: "пропущено" },
  imported: { EN: "Imported", RU: "Импортировано" },

  // Tabs
  layers: { EN: "Layers", RU: "Слои" },
  featuresTab: { EN: "Features", RU: "Объекты" },
  database: { EN: "Database", RU: "База данных" },
  chat: { EN: "Chat", RU: "Чат" },
  layersHint: { EN: "Manage basemap and overlay layers here.", RU: "Управление подложкой и слоями карты." },
  comingSoon: { EN: "Coming soon", RU: "Скоро" },
  dbTitle: { EN: "Database Connection", RU: "Подключение к базе данных" },
  dbHint: {
    EN: "Connect to an external database to sync your features.",
    RU: "Подключите внешнюю базу данных для синхронизации объектов.",
  },
  chatHint: {
    EN: "Support team and AI assistant will be available here.",
    RU: "Здесь будут доступны служба поддержки и ИИ-ассистент.",
  },

  // Attributes
  name: { EN: "Name", RU: "Название" },
  category: { EN: "Category", RU: "Категория" },
  categoryPlaceholder: { EN: "e.g. road, building, poi", RU: "напр. дорога, здание, объект" },
  notes: { EN: "Notes", RU: "Примечания" },
  notesPlaceholder: { EN: "Free-form description…", RU: "Произвольное описание…" },
  geometry: { EN: "Geometry (GeoJSON)", RU: "Геометрия (GeoJSON)" },
  deleteFeature: { EN: "Delete feature", RU: "Удалить объект" },
  noSelection: { EN: "No feature selected", RU: "Объект не выбран" },
  noSelectionHint: {
    EN: "Pick one on the map or in the table, or draw a new one.",
    RU: "Выберите объект на карте или в таблице либо создайте новый.",
  },

  // Table
  featureTable: { EN: "Feature Table", RU: "Таблица объектов" },
  dragToResize: { EN: "Drag the top edge to resize", RU: "Потяните верхний край, чтобы изменить размер" },
  emptyTable: {
    EN: "Use the toolbar on the left to draw your first feature.",
    RU: "Используйте панель слева, чтобы создать первый объект.",
  },
  type: { EN: "Type", RU: "Тип" },
  created: { EN: "Created", RU: "Создан" },

  // Geometry types
  Point: { EN: "Point", RU: "Точка" },
  LineString: { EN: "LineString", RU: "Линия" },
  Polygon: { EN: "Polygon", RU: "Полигон" },
  Label: { EN: "Label", RU: "Подпись" },

  // Clock
  local: { EN: "Loc", RU: "Мест" },
  msk: { EN: "MSK", RU: "МСК" },

  // Properties editor
  properties: { EN: "Properties", RU: "Свойства" },
  propertiesHint: {
    EN: "All attributes from the imported file are listed here.",
    RU: "Здесь перечислены все атрибуты из импортированного файла.",
  },
  propertyKey: { EN: "Key", RU: "Ключ" },
  propertyValue: { EN: "Value", RU: "Значение" },
  addProperty: { EN: "Add property", RU: "Добавить свойство" },
  newPropertyKey: { EN: "new_property", RU: "новое_свойство" },
  noProperties: { EN: "No custom properties yet.", RU: "Пользовательских свойств пока нет." },

  // Layers panel
  userLayers: { EN: "User Layers", RU: "Пользовательские слои" },
  userLayersHint: {
    EN: "Features grouped by category. Toggle visibility on the map.",
    RU: "Объекты, сгруппированные по категориям. Переключайте видимость на карте.",
  },
  noLayers: { EN: "No layers yet. Import GeoJSON or draw features to create layers.", RU: "Слоёв пока нет. Импортируйте GeoJSON или нарисуйте объекты для создания слоёв." },
  featuresCount: { EN: "features", RU: "объектов" },
  showOnMap: { EN: "Show on map", RU: "Показать на карте" },
  hideFromMap: { EN: "Hide from map", RU: "Скрыть с карты" },
  zoomToLayer: { EN: "Zoom to layer", RU: "Показать слой" },
  basemap: { EN: "Basemap", RU: "Подложка" },
  basemapOsm: { EN: "OpenStreetMap", RU: "OpenStreetMap" },
} as const;

export type TKey = keyof typeof dict;

const STORAGE_KEY = "gis:lang";
let lang: Lang = "EN";
const listeners = new Set<() => void>();

export const langStore = {
  get: () => lang,
  set(next: Lang) {
    if (next === lang) return;
    lang = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  init() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "RU" || saved === "EN") {
        lang = saved;
        listeners.forEach((l) => l());
      }
    } catch {
      /* ignore */
    }
  },
};

export function translate(key: TKey, l: Lang = lang): string {
  return dict[key][l] ?? dict[key].EN;
}

export function useLang() {
  const current = useSyncExternalStore(
    langStore.subscribe,
    langStore.get,
    () => "EN" as Lang
  );
  return {
    lang: current,
    setLang: langStore.set,
    t: (key: TKey) => translate(key, current),
  };
}
