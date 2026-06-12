import { MetricCard } from "../../components/MetricCard";
import { colorForApp } from "../../lib/colors";
import { formatDateLabel } from "../../lib/time";
import { formatDuration, formatPercent } from "../../lib/format";
import type { WeeklyData } from "../../lib/aw/model";

interface WeeklyViewProps {
  weekly?: WeeklyData;
  loading: boolean;
}

export function WeeklyView({ weekly, loading }: WeeklyViewProps) {
  if (loading && !weekly) {
    return <div className="panel skeleton-panel">Loading weekly activity...</div>;
  }

  if (!weekly) {
    return (
      <section className="panel empty-state">
        <h2>No weekly data yet</h2>
        <p>Fotion needs at least one ActivityWatch window bucket to render weekly trends.</p>
      </section>
    );
  }

  const maxDay = Math.max(1, ...weekly.days.map((day) => day.totalActive));

  return (
    <div className="view-grid weekly-grid">
      <MetricCard label="Weekly active" value={formatDuration(weekly.totalActive)} detail="7 activity days" />
      <MetricCard label="Daily average" value={formatDuration(weekly.dailyAverage)} detail="active time per day" />
      <MetricCard label="Top apps" value={weekly.topApps.length.toString()} detail={weekly.topApps.slice(0, 3).join(", ") || "No activity"} />

      <section className="panel weekly-panel">
        <div className="panel-heading">
          <div>
            <p>Weekly</p>
            <h2>Stacked app trend</h2>
          </div>
        </div>
        <div className="weekly-bars">
          {weekly.days.map((day) => {
            const visibleApps = weekly.topApps.map((appName) => {
              const app = day.appTotals.find((candidate) => candidate.app === appName);
              return { app: appName, duration: app?.duration ?? 0 };
            });
            const visibleTotal = visibleApps.reduce((sum, app) => sum + app.duration, 0);
            const other = Math.max(0, day.totalActive - visibleTotal);

            return (
              <div key={day.period.start.toISOString()} className="weekly-day">
                <div className="weekly-stack" style={{ height: `${Math.max(8, (day.totalActive / maxDay) * 100)}%` }}>
                  {visibleApps.map((app) => (
                    <span
                      key={app.app}
                      style={{ height: `${day.totalActive > 0 ? (app.duration / day.totalActive) * 100 : 0}%`, background: colorForApp(app.app) }}
                      title={`${app.app} · ${formatDuration(app.duration)} · ${formatPercent(day.totalActive > 0 ? (app.duration / day.totalActive) * 100 : 0)}`}
                    />
                  ))}
                  {other > 0 ? (
                    <span
                      className="other"
                      style={{ height: `${(other / day.totalActive) * 100}%` }}
                      title={`Other · ${formatDuration(other)}`}
                    />
                  ) : null}
                </div>
                <strong>{formatDuration(day.totalActive)}</strong>
                <small>{formatDateLabel(day.period.start)}</small>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel legend-panel">
        <div className="panel-heading">
          <div>
            <p>Legend</p>
            <h2>Top weekly apps</h2>
          </div>
        </div>
        <div className="legend-list">
          {weekly.topApps.map((app) => (
            <span key={app}>
              <i style={{ background: colorForApp(app) }} />
              {app}
            </span>
          ))}
          <span>
            <i className="other" />
            Other
          </span>
        </div>
      </section>
    </div>
  );
}
