import type { FotionSettings } from "../settings";
import { getActivityDay, getWeekPeriods, toAwTimePeriod } from "../time";
import { ActivityWatchClient } from "./client";
import type { AwBucket, AwEvent, DashboardData, WeeklyData, WeeklyDayData } from "./model";
import {
  buildDailyData,
  buildWeeklyDayData,
  buildWeeklyDayDataFromRaw,
  discoverBuckets,
  normalizeMultiPeriodQueryResult,
  normalizeQueryResult,
  pickTopWeeklyApps,
} from "./transform";

export async function loadDashboardData(settings: FotionSettings, selectedDate: Date): Promise<DashboardData> {
  const client = new ActivityWatchClient(settings.awServerUrl);
  const [info, bucketResponse] = await Promise.all([client.getInfo(), client.getBuckets()]);
  const discovery = discoverBuckets(bucketResponse);

  if (!discovery.windowBucket) {
    throw new Error("ActivityWatch is reachable, but no aw-watcher-window bucket was found.");
  }

  const dailyPeriod = getActivityDay(selectedDate, settings.dayBoundaryMinutes);
  const [windowEvents, afkEvents, mergedDailyEvents] = await Promise.all([
    client.getEvents(discovery.windowBucket.id, dailyPeriod.start, dailyPeriod.end),
    discovery.afkBucket ? client.getEvents(discovery.afkBucket.id, dailyPeriod.start, dailyPeriod.end) : Promise.resolve([]),
    queryMergedActiveEvents(client, discovery.windowBucket, discovery.afkBucket, [toAwTimePeriod(dailyPeriod)], ["app", "title"]),
  ]);

  const daily = buildDailyData(dailyPeriod, windowEvents, afkEvents, normalizeQueryResult(mergedDailyEvents));
  const weekly = await loadWeeklyData(client, discovery.windowBucket, discovery.afkBucket, selectedDate, settings.dayBoundaryMinutes);

  return {
    info,
    discovery,
    daily,
    weekly,
    loadedAt: new Date(),
  };
}

async function loadWeeklyData(
  client: ActivityWatchClient,
  windowBucket: AwBucket,
  afkBucket: AwBucket | undefined,
  selectedDate: Date,
  dayBoundaryMinutes: number,
): Promise<WeeklyData> {
  const periods = getWeekPeriods(selectedDate, dayBoundaryMinutes);
  const queryResult = await queryMergedActiveEvents(
    client,
    windowBucket,
    afkBucket,
    periods.map(toAwTimePeriod),
    ["app"],
  );
  const queryDays = normalizeMultiPeriodQueryResult(queryResult);
  const days = queryDays.length === periods.length
    ? periods.map((period, index) => buildWeeklyDayData(period, queryDays[index] ?? []))
    : await loadWeeklyDataFromRaw(client, windowBucket, afkBucket, periods);

  const totalActive = days.reduce((sum, day) => sum + day.totalActive, 0);
  return {
    days,
    totalActive,
    dailyAverage: totalActive / days.length,
    topApps: pickTopWeeklyApps(days),
  };
}

async function loadWeeklyDataFromRaw(
  client: ActivityWatchClient,
  windowBucket: AwBucket,
  afkBucket: AwBucket | undefined,
  periods: { start: Date; end: Date }[],
): Promise<WeeklyDayData[]> {
  return Promise.all(
    periods.map(async (period) => {
      const [windowEvents, afkEvents] = await Promise.all([
        client.getEvents(windowBucket.id, period.start, period.end),
        afkBucket ? client.getEvents(afkBucket.id, period.start, period.end) : Promise.resolve([]),
      ]);
      return buildWeeklyDayDataFromRaw(period, windowEvents, afkEvents);
    }),
  );
}

async function queryMergedActiveEvents(
  client: ActivityWatchClient,
  windowBucket: AwBucket,
  afkBucket: AwBucket | undefined,
  timeperiods: string[],
  mergeKeys: string[],
): Promise<unknown> {
  const query = [
    `window_events = query_bucket("${escapeAwString(windowBucket.id)}");`,
    ...(afkBucket
      ? [
          `afk_events = query_bucket("${escapeAwString(afkBucket.id)}");`,
          `not_afk = filter_keyvals(afk_events, "status", ["not-afk"]);`,
          "window_events = filter_period_intersect(window_events, not_afk);",
        ]
      : []),
    `window_events = merge_events_by_keys(window_events, [${mergeKeys.map((key) => `"${key}"`).join(", ")}]);`,
    "RETURN = sort_by_duration(window_events);",
  ];

  try {
    return await client.query(timeperiods, query);
  } catch {
    return [];
  }
}

function escapeAwString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
