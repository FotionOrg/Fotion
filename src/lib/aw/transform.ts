import { colorForApp } from "../colors";
import { clampDateRange, secondsBetween, type TimePeriod } from "../time";
import type {
  ActiveSlice,
  AppTitleTotal,
  AppTotal,
  AwBucket,
  AwBucketResponse,
  AwEvent,
  BucketDiscovery,
  DailyData,
  HeatmapHour,
  TimelineSegment,
  WeeklyDayData,
} from "./model";

const MICRO_EVENT_SECONDS = 10;
const MICRO_EVENT_MERGE_GAP_SECONDS = 20;

export function discoverBuckets(response: AwBucketResponse): BucketDiscovery {
  const buckets = Object.entries(response).map(([id, bucket]) => ({ ...bucket, id: bucket.id ?? id }));
  const windowBucket = buckets.find(isWindowBucket);
  const afkBucket = buckets.find(isAfkBucket);

  return { buckets, windowBucket, afkBucket };
}

export function buildDailyData(
  period: TimePeriod,
  windowEvents: AwEvent[],
  afkEvents: AwEvent[],
  mergedEvents?: AwEvent[],
): DailyData {
  const activeSlices = buildActiveSlices(windowEvents, afkEvents, period);
  const appTotals = mergedEvents?.length
    ? buildAppTotalsFromEvents(mergedEvents)
    : buildAppTotalsFromSlices(activeSlices);

  return {
    period,
    totalActive: appTotals.reduce((sum, app) => sum + app.duration, 0),
    appTotals,
    heatmap: buildHeatmap(activeSlices, period),
    timelineSegments: buildTimelineSegments(activeSlices),
    rawWindowEventCount: windowEvents.length,
  };
}

export function buildWeeklyDayData(period: TimePeriod, events: AwEvent[]): WeeklyDayData {
  const appTotals = buildAppTotalsFromEvents(events);
  return {
    period,
    totalActive: appTotals.reduce((sum, app) => sum + app.duration, 0),
    appTotals,
  };
}

export function buildWeeklyDayDataFromRaw(
  period: TimePeriod,
  windowEvents: AwEvent[],
  afkEvents: AwEvent[],
): WeeklyDayData {
  const activeSlices = buildActiveSlices(windowEvents, afkEvents, period);
  const appTotals = buildAppTotalsFromSlices(activeSlices);
  return {
    period,
    totalActive: appTotals.reduce((sum, app) => sum + app.duration, 0),
    appTotals,
  };
}

export function pickTopWeeklyApps(days: WeeklyDayData[], limit = 5): string[] {
  const totals = new Map<string, number>();
  for (const day of days) {
    for (const app of day.appTotals) {
      totals.set(app.app, (totals.get(app.app) ?? 0) + app.duration);
    }
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([app]) => app);
}

export function normalizeQueryResult(result: unknown): AwEvent[] {
  if (!Array.isArray(result)) {
    return [];
  }
  const first = result[0];
  if (Array.isArray(first)) {
    return first.filter(isAwEvent);
  }
  return result.filter(isAwEvent);
}

export function normalizeMultiPeriodQueryResult(result: unknown): AwEvent[][] {
  if (!Array.isArray(result)) {
    return [];
  }
  if (result.every(Array.isArray)) {
    return result.map((periodEvents) => periodEvents.filter(isAwEvent));
  }
  return [result.filter(isAwEvent)];
}

function buildActiveSlices(windowEvents: AwEvent[], afkEvents: AwEvent[], period: TimePeriod): ActiveSlice[] {
  const notAfkPeriods = getNotAfkPeriods(afkEvents, period);
  const sortedWindowEvents = [...windowEvents].sort(compareEventsByStart);
  const slices: ActiveSlice[] = [];

  for (const event of sortedWindowEvents) {
    const eventPeriod = eventToPeriod(event, period);
    if (!eventPeriod) {
      continue;
    }

    const activeRanges = notAfkPeriods.length ? intersectPeriods(eventPeriod, notAfkPeriods) : [eventPeriod];
    for (const activeRange of activeRanges) {
      const duration = secondsBetween(activeRange.start, activeRange.end);
      if (duration <= 0) {
        continue;
      }
      slices.push({
        app: getStringData(event, "app", "Unknown app"),
        title: getStringData(event, "title", "Untitled"),
        start: activeRange.start,
        end: activeRange.end,
        duration,
      });
    }
  }

  return slices.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function getNotAfkPeriods(afkEvents: AwEvent[], period: TimePeriod): TimePeriod[] {
  return afkEvents
    .filter((event) => getStringData(event, "status", "") === "not-afk")
    .map((event) => eventToPeriod(event, period))
    .filter((eventPeriod): eventPeriod is TimePeriod => Boolean(eventPeriod))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function eventToPeriod(event: AwEvent, period: TimePeriod): TimePeriod | null {
  const start = new Date(event.timestamp);
  const end = new Date(start.getTime() + Math.max(0, event.duration) * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  return clampDateRange(start, end, period);
}

function intersectPeriods(eventPeriod: TimePeriod, activePeriods: TimePeriod[]): TimePeriod[] {
  const intersections: TimePeriod[] = [];
  for (const activePeriod of activePeriods) {
    const intersection = clampDateRange(eventPeriod.start, eventPeriod.end, activePeriod);
    if (intersection) {
      intersections.push(intersection);
    }
  }
  return intersections;
}

function buildAppTotalsFromEvents(events: AwEvent[]): AppTotal[] {
  const titleTotals = new Map<string, Map<string, number>>();
  for (const event of events) {
    addDuration(titleTotals, getStringData(event, "app", "Unknown app"), getStringData(event, "title", "Untitled"), event.duration);
  }
  return titleTotalsToAppTotals(titleTotals);
}

function buildAppTotalsFromSlices(slices: ActiveSlice[]): AppTotal[] {
  const titleTotals = new Map<string, Map<string, number>>();
  for (const slice of slices) {
    addDuration(titleTotals, slice.app, slice.title, slice.duration);
  }
  return titleTotalsToAppTotals(titleTotals);
}

function addDuration(titleTotals: Map<string, Map<string, number>>, app: string, title: string, duration: number) {
  if (!titleTotals.has(app)) {
    titleTotals.set(app, new Map());
  }
  const appTitles = titleTotals.get(app);
  if (!appTitles) {
    return;
  }
  appTitles.set(title, (appTitles.get(title) ?? 0) + Math.max(0, duration));
}

function titleTotalsToAppTotals(titleTotals: Map<string, Map<string, number>>): AppTotal[] {
  const totalDuration = [...titleTotals.values()].reduce(
    (sum, titles) => sum + [...titles.values()].reduce((titleSum, duration) => titleSum + duration, 0),
    0,
  );

  return [...titleTotals.entries()]
    .map(([app, titles]) => {
      const appDuration = [...titles.values()].reduce((sum, duration) => sum + duration, 0);
      const titleList: AppTitleTotal[] = [...titles.entries()]
        .map(([title, duration]) => ({ title, duration }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 8);

      return {
        app,
        duration: appDuration,
        percent: totalDuration > 0 ? (appDuration / totalDuration) * 100 : 0,
        color: colorForApp(app),
        titles: titleList,
      };
    })
    .filter((app) => app.duration > 0)
    .sort((a, b) => b.duration - a.duration);
}

function buildHeatmap(slices: ActiveSlice[], period: TimePeriod): HeatmapHour[] {
  const quarters = Array.from({ length: 96 }, () => 0);
  const quarterMs = 15 * 60 * 1000;

  for (const slice of slices) {
    for (let index = 0; index < quarters.length; index += 1) {
      const start = new Date(period.start.getTime() + index * quarterMs);
      const end = new Date(start.getTime() + quarterMs);
      const overlap = clampDateRange(slice.start, slice.end, { start, end });
      if (overlap) {
        quarters[index] += secondsBetween(overlap.start, overlap.end);
      }
    }
  }

  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    quarters: quarters.slice(hour * 4, hour * 4 + 4),
  }));
}

function buildTimelineSegments(slices: ActiveSlice[]): TimelineSegment[] {
  const segments: TimelineSegment[] = [];

  for (const slice of slices) {
    const previous = segments.at(-1);
    const gap = previous ? secondsBetween(previous.end, slice.start) : Number.POSITIVE_INFINITY;
    const shouldVisuallyMerge = previous && slice.duration < MICRO_EVENT_SECONDS && gap < MICRO_EVENT_MERGE_GAP_SECONDS;

    if (shouldVisuallyMerge) {
      previous.end = slice.end;
      previous.duration += slice.duration + gap;
      continue;
    }

    segments.push({
      ...slice,
      color: colorForApp(slice.app),
    });
  }

  return segments;
}

function isWindowBucket(bucket: AwBucket): boolean {
  const id = bucket.id.toLowerCase();
  const type = bucket.type?.toLowerCase() ?? "";
  const client = bucket.client?.toLowerCase() ?? "";
  return id.startsWith("aw-watcher-window") || type.includes("currentwindow") || client.includes("aw-watcher-window");
}

function isAfkBucket(bucket: AwBucket): boolean {
  const id = bucket.id.toLowerCase();
  const type = bucket.type?.toLowerCase() ?? "";
  const client = bucket.client?.toLowerCase() ?? "";
  return id.startsWith("aw-watcher-afk") || type.includes("afkstatus") || client.includes("aw-watcher-afk");
}

function isAwEvent(value: unknown): value is AwEvent {
  if (!value || typeof value !== "object") {
    return false;
  }
  const event = value as Partial<AwEvent>;
  return typeof event.timestamp === "string" && typeof event.duration === "number" && typeof event.data === "object";
}

function compareEventsByStart(a: AwEvent, b: AwEvent): number {
  return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
}

function getStringData(event: AwEvent, key: string, fallback: string): string {
  const value = event.data[key];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}
