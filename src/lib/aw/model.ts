import type { TimePeriod } from "../time";

export interface AwInfo {
  hostname?: string;
  version?: string;
  testing?: boolean;
  [key: string]: unknown;
}

export interface AwBucket {
  id: string;
  type?: string;
  client?: string;
  hostname?: string;
  name?: string;
  created?: string;
  [key: string]: unknown;
}

export type AwBucketResponse = Record<string, Omit<AwBucket, "id"> & { id?: string }>;

export interface AwEvent {
  id?: number;
  timestamp: string;
  duration: number;
  data: Record<string, unknown>;
}

export interface BucketDiscovery {
  buckets: AwBucket[];
  windowBucket?: AwBucket;
  afkBucket?: AwBucket;
}

export interface ActiveSlice {
  app: string;
  title: string;
  start: Date;
  end: Date;
  duration: number;
}

export interface AppTitleTotal {
  title: string;
  duration: number;
}

export interface AppTotal {
  app: string;
  duration: number;
  percent: number;
  color: string;
  titles: AppTitleTotal[];
}

export interface HeatmapHour {
  hour: number;
  quarters: number[];
}

export interface TimelineSegment {
  app: string;
  title: string;
  start: Date;
  end: Date;
  duration: number;
  color: string;
}

export interface DailyData {
  period: TimePeriod;
  totalActive: number;
  appTotals: AppTotal[];
  heatmap: HeatmapHour[];
  timelineSegments: TimelineSegment[];
  rawWindowEventCount: number;
}

export interface WeeklyDayData {
  period: TimePeriod;
  totalActive: number;
  appTotals: AppTotal[];
}

export interface WeeklyData {
  days: WeeklyDayData[];
  totalActive: number;
  dailyAverage: number;
  topApps: string[];
}

export interface DashboardData {
  info: AwInfo;
  discovery: BucketDiscovery;
  daily: DailyData;
  weekly: WeeklyData;
  loadedAt: Date;
}
