import { useState } from "react";
import { ActivityWatchClient } from "../../lib/aw/client";
import type { BucketDiscovery } from "../../lib/aw/model";
import type { FotionSettings } from "../../lib/settings";
import { minutesToTimeInput, normalizeSettings, timeInputToMinutes } from "../../lib/settings";

interface SettingsViewProps {
  settings: FotionSettings;
  discovery?: BucketDiscovery;
  error?: string;
  onSave: (settings: FotionSettings) => void;
}

export function SettingsView({ settings, discovery, error, onSave }: SettingsViewProps) {
  const [awServerUrl, setAwServerUrl] = useState(settings.awServerUrl);
  const [dayBoundary, setDayBoundary] = useState(minutesToTimeInput(settings.dayBoundaryMinutes));
  const [testState, setTestState] = useState<string>("");

  async function testConnection() {
    setTestState("Testing...");
    const nextSettings = normalizeSettings({ awServerUrl, dayBoundaryMinutes: timeInputToMinutes(dayBoundary) });
    try {
      const client = new ActivityWatchClient(nextSettings.awServerUrl);
      const info = await client.getInfo();
      setTestState(`Connected${info.version ? ` · ActivityWatch ${info.version}` : ""}`);
    } catch (connectionError) {
      setTestState(connectionError instanceof Error ? connectionError.message : "Connection failed");
    }
  }

  function save() {
    const nextSettings = normalizeSettings({ awServerUrl, dayBoundaryMinutes: timeInputToMinutes(dayBoundary) });
    setAwServerUrl(nextSettings.awServerUrl);
    setDayBoundary(minutesToTimeInput(nextSettings.dayBoundaryMinutes));
    onSave(nextSettings);
  }

  return (
    <div className="settings-grid">
      <section className="panel settings-panel">
        <div className="panel-heading">
          <div>
            <p>Settings</p>
            <h2>ActivityWatch connection</h2>
          </div>
        </div>

        <label className="field">
          <span>ActivityWatch server URL</span>
          <input value={awServerUrl} onChange={(event) => setAwServerUrl(event.target.value)} placeholder="http://localhost:5600" />
        </label>

        <label className="field">
          <span>Day boundary</span>
          <input type="time" value={dayBoundary} onChange={(event) => setDayBoundary(event.target.value)} />
          <small>Default is 04:00, so late-night work stays with the previous day.</small>
        </label>

        <div className="button-row">
          <button type="button" onClick={save}>Save settings</button>
          <button type="button" className="secondary" onClick={testConnection}>Test connection</button>
        </div>

        {testState ? <p className="settings-note">{testState}</p> : null}
        {error ? <p className="settings-error">{error}</p> : null}
      </section>

      <section className="panel settings-panel">
        <div className="panel-heading">
          <div>
            <p>Discovery</p>
            <h2>Detected buckets</h2>
          </div>
        </div>

        <div className="bucket-list">
          <BucketRow label="Window bucket" value={discovery?.windowBucket?.id} />
          <BucketRow label="AFK bucket" value={discovery?.afkBucket?.id} />
          <BucketRow label="All buckets" value={discovery ? discovery.buckets.length.toString() : undefined} />
        </div>

        <div className="setup-steps">
          <h3>If this is empty</h3>
          <p>Install ActivityWatch, launch it, and wait for aw-watcher-window plus aw-watcher-afk to create buckets.</p>
          <p>Open ActivityWatch at the server URL above to confirm collection is happening before refreshing Fotion.</p>
        </div>
      </section>
    </div>
  );
}

function BucketRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bucket-row">
      <span>{label}</span>
      <code>{value ?? "Not detected"}</code>
    </div>
  );
}
