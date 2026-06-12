import { MetricCard } from "../../components/MetricCard";
import { formatDuration, formatDurationPrecise, formatPercent } from "../../lib/format";
import type { DailyData } from "../../lib/aw/model";

interface DailyViewProps {
  daily?: DailyData;
  loading: boolean;
}

export function DailyView({ daily, loading }: DailyViewProps) {
  if (loading && !daily) {
    return <div className="panel skeleton-panel">Loading daily activity...</div>;
  }

  if (!daily) {
    return <EmptyDaily />;
  }

  const topApp = daily.appTotals[0];

  return (
    <div className="view-grid daily-grid">
      <MetricCard label="Active time" value={formatDuration(daily.totalActive)} detail="window activity intersected with not-afk" />
      <MetricCard label="Top app" value={topApp?.app ?? "None"} detail={topApp ? formatDuration(topApp.duration) : "No activity yet"} />
      <MetricCard label="Window events" value={daily.rawWindowEventCount.toLocaleString()} detail="raw AW events in this day" />

      <section className="panel app-panel">
        <div className="panel-heading">
          <div>
            <p>Apps</p>
            <h2>Where the day went</h2>
          </div>
        </div>
        <div className="app-list">
          {daily.appTotals.map((app) => (
            <details key={app.app} className="app-row" open={daily.appTotals.length <= 3}>
              <summary>
                <span className="app-dot" style={{ background: app.color }} />
                <span className="app-name">{app.app}</span>
                <span className="app-duration">{formatDuration(app.duration)}</span>
                <span className="app-percent">{formatPercent(app.percent)}</span>
              </summary>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${app.percent}%`, background: app.color }} />
              </div>
              <div className="title-list">
                {app.titles.map((title) => (
                  <div key={title.title} className="title-row">
                    <span>{title.title}</span>
                    <time>{formatDurationPrecise(title.duration)}</time>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="panel heatmap-panel">
        <div className="panel-heading">
          <div>
            <p>24-hour heatmap</p>
            <h2>Active density</h2>
          </div>
        </div>
        <div className="heatmap">
          {daily.heatmap.map((hour) => (
            <div key={hour.hour} className="heatmap-hour">
              <div className="heatmap-cells">
                {hour.quarters.map((seconds, index) => (
                  <span
                    key={index}
                    title={`${hour.hour.toString().padStart(2, "0")}:${(index * 15).toString().padStart(2, "0")} · ${formatDurationPrecise(seconds)}`}
                    style={{ opacity: Math.min(1, 0.15 + seconds / 900) }}
                  />
                ))}
              </div>
              <small>{hour.hour % 3 === 0 ? hour.hour.toString().padStart(2, "0") : ""}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyDaily() {
  return (
    <section className="panel empty-state">
      <h2>No daily data yet</h2>
      <p>Fotion needs ActivityWatch window and AFK buckets to render the dashboard.</p>
    </section>
  );
}
