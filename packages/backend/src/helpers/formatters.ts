import chalk from "chalk";

const timeUnits = [
  { unit: "s", threshold: 1e9, decimalPlaces: 2 },
  { unit: "ms", threshold: 1e6, decimalPlaces: 0 },
  { unit: "µs", threshold: 1e3, decimalPlaces: 0 },
  { unit: "ns", threshold: 1, decimalPlaces: 0 },
];

export function formatDuration(nanoseconds: number): string {
  for (const { unit, threshold, decimalPlaces } of timeUnits) {
    if (nanoseconds >= threshold) {
      const value = (nanoseconds / threshold).toFixed(decimalPlaces);
      const timeStr = `${value}${unit}`;
      return chalk.gray(timeStr.padStart(5));
    }
  }
  const timeStr = `${nanoseconds}ns`;
  return chalk.gray(timeStr.padStart(5));
}

export function formatSize(bytes: number): string {
  if (Number.isNaN(bytes) || bytes === 0) return chalk.gray("0B".padStart(7));
  const kb = bytes / 1024;
  const mb = kb / 1024;

  if (mb >= 1) return chalk.magenta(`${mb.toFixed(1)}MB`.padStart(7));
  if (kb >= 1) return chalk.magenta(`${Math.floor(kb)}KB`.padStart(7));
  return chalk.magenta(`${bytes}B`.padStart(7));
}

export function formatTime(epochTime: number): string {
  const now = new Date(epochTime);
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");
  return chalk.gray(`[${h}:${m}:${s}]`);
}

export function formatLevel(level: number): string {
  const levelStr =
    level >= 50
      ? "ERROR"
      : level >= 40
        ? "WARN"
        : level >= 30
          ? "INFO"
          : "DEBUG";

  const color =
    level >= 50
      ? chalk.red
      : level >= 40
        ? chalk.yellow
        : level >= 30
          ? chalk.blueBright
          : chalk.white;

  return color(levelStr.padStart(3));
}
