export type ViewKey = "daily" | "timeline" | "weekly" | "settings";

interface ViewTabsProps {
  activeView: ViewKey;
  onChange: (view: ViewKey) => void;
}

const TABS: Array<{ key: ViewKey; label: string }> = [
  { key: "daily", label: "Daily" },
  { key: "timeline", label: "Timeline" },
  { key: "weekly", label: "Weekly" },
  { key: "settings", label: "Settings" },
];

export function ViewTabs({ activeView, onChange }: ViewTabsProps) {
  return (
    <nav className="view-tabs" aria-label="Fotion views">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={tab.key === activeView ? "active" : ""}
          type="button"
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
