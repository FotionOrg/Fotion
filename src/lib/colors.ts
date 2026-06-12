const APP_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#ca8a04",
  "#ea580c",
  "#dc2626",
  "#be185d",
  "#4f46e5",
  "#0d9488",
];

export function colorForApp(appName: string): string {
  let hash = 0;
  for (let index = 0; index < appName.length; index += 1) {
    hash = (hash * 31 + appName.charCodeAt(index)) >>> 0;
  }
  return APP_COLORS[hash % APP_COLORS.length];
}
