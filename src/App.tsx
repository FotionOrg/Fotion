import { useEffect, useState } from "react";
import { ConnectionBanner } from "./components/ConnectionBanner";
import { ViewTabs, type ViewKey } from "./components/ViewTabs";
import { loadDashboardData } from "./lib/aw/data";
import type { DashboardData } from "./lib/aw/model";
import { dateInputValue, parseDateInput, sameLocalDay } from "./lib/time";
import { loadSettings, saveSettings, type FotionSettings } from "./lib/settings";
import { DailyView } from "./views/daily/DailyView";
import { SettingsView } from "./views/settings/SettingsView";
import { TimelineView } from "./views/timeline/TimelineView";
import { WeeklyView } from "./views/weekly/WeeklyView";

interface DataState {
  data?: DashboardData;
  loading: boolean;
  error?: string;
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>("daily");
  const [settings, setSettings] = useState<FotionSettings>(() => loadSettings());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [refreshToken, setRefreshToken] = useState(0);
  const [state, setState] = useState<DataState>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    setState((previous) => ({ ...previous, loading: true, error: undefined }));

    loadDashboardData(settings, selectedDate)
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState((previous) => ({
            data: previous.data,
            loading: false,
            error: error instanceof Error ? error.message : "Could not load ActivityWatch data",
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [settings, selectedDate, refreshToken]);

  useEffect(() => {
    if (!sameLocalDay(selectedDate, new Date())) {
      return;
    }
    const interval = window.setInterval(() => setRefreshToken((current) => current + 1), 60_000);
    return () => window.clearInterval(interval);
  }, [selectedDate]);

  function updateSettings(nextSettings: FotionSettings) {
    saveSettings(nextSettings);
    setSettings(nextSettings);
    setRefreshToken((current) => current + 1);
  }

  function renderActiveView() {
    if (activeView === "daily") {
      return <DailyView daily={state.data?.daily} loading={state.loading} />;
    }
    if (activeView === "timeline") {
      return <TimelineView daily={state.data?.daily} loading={state.loading} />;
    }
    if (activeView === "weekly") {
      return <WeeklyView weekly={state.data?.weekly} loading={state.loading} />;
    }
    return (
      <SettingsView
        settings={settings}
        discovery={state.data?.discovery}
        error={state.error}
        onSave={updateSettings}
      />
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Local-first activity dashboard</p>
          <h1>Fotion</h1>
          <p className="hero-copy">Rize-grade daily focus views on top of your local ActivityWatch data.</p>
        </div>
        <div className="toolbar">
          <label>
            <span>Day</span>
            <input
              type="date"
              value={dateInputValue(selectedDate)}
              onChange={(event) => setSelectedDate(parseDateInput(event.target.value, selectedDate))}
            />
          </label>
          <button type="button" onClick={() => setRefreshToken((current) => current + 1)} disabled={state.loading}>
            {state.loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <ConnectionBanner
        connected={Boolean(state.data && !state.error)}
        error={state.error}
        awServerUrl={settings.awServerUrl}
        loadedAt={state.data?.loadedAt}
        onRetry={() => setRefreshToken((current) => current + 1)}
      />

      <ViewTabs activeView={activeView} onChange={setActiveView} />
      {renderActiveView()}
    </main>
  );
}
