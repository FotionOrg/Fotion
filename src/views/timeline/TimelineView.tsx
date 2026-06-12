import { formatDurationPrecise, formatTimeRange } from "../../lib/format";
import type { DailyData } from "../../lib/aw/model";

interface TimelineViewProps {
  daily?: DailyData;
  loading: boolean;
}

export function TimelineView({ daily, loading }: TimelineViewProps) {
  if (loading && !daily) {
    return <div className="panel skeleton-panel">Loading timeline...</div>;
  }

  if (!daily) {
    return (
      <section className="panel empty-state">
        <h2>No timeline data yet</h2>
        <p>Start ActivityWatch and keep aw-watcher-window running.</p>
      </section>
    );
  }

  const totalMs = daily.period.end.getTime() - daily.period.start.getTime();
  const hourTicks = Array.from({ length: 13 }, (_, index) => index * 2);

  return (
    <section className="panel timeline-panel">
      <div className="panel-heading">
        <div>
          <p>Timeline</p>
          <h2>Day at a glance</h2>
        </div>
        <span>{daily.timelineSegments.length.toLocaleString()} visible blocks</span>
      </div>

      <div className="timeline-ruler">
        {hourTicks.map((hour) => (
          <span key={hour}>{hour.toString().padStart(2, "0")}:00</span>
        ))}
      </div>

      <div className="timeline-track" aria-label="Daily activity timeline">
        {daily.timelineSegments.map((segment, index) => {
          const left = ((segment.start.getTime() - daily.period.start.getTime()) / totalMs) * 100;
          const width = Math.max(0.2, ((segment.end.getTime() - segment.start.getTime()) / totalMs) * 100);
          return (
            <div
              key={`${segment.start.toISOString()}-${index}`}
              className="timeline-block"
              style={{ left: `${left}%`, width: `${width}%`, background: segment.color }}
              title={`${segment.app} · ${segment.title} · ${formatTimeRange(segment.start, segment.end)} · ${formatDurationPrecise(segment.duration)}`}
            >
              {width > 6 ? <span>{segment.app}</span> : null}
            </div>
          );
        })}
      </div>

      <div className="timeline-legend">
        <span>Colored blocks are active app windows.</span>
        <span>Blank gaps are AFK or no window data.</span>
        <span>Sub-10s noise is visually merged into neighboring blocks.</span>
      </div>
    </section>
  );
}
