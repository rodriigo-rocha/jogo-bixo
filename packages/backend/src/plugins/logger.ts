import { Writable } from "node:stream";
import chalk from "chalk";
import Elysia from "elysia";
import type { Logger as PinoLogger } from "pino";
import pino from "pino";
import {
  formatDuration,
  formatLevel,
  formatSize,
  formatTime,
} from "../helpers/formatters";

function createPinoInstance(): PinoLogger {
  const prettyStream = new Writable({
    write(chunk, _encoding, callback) {
      // biome-ignore lint/suspicious/noExplicitAny: Preguiça
      let log: any;
      try {
        log = JSON.parse(chunk.toString());
      } catch (e) {
        console.error(e);
        return callback();
      }

      if (log.type === "request") {
        const { level, time, method, path, status, durationNs, sizeBytes } =
          log;

        const statusColor =
          status >= 500
            ? chalk.red
            : status >= 400
              ? chalk.yellow
              : status >= 300
                ? chalk.cyan
                : chalk.green;

        const logString = [
          formatTime(time),
          formatLevel(level),
          chalk.white(method.padEnd(3)),
          path.padEnd(30),
          formatDuration(durationNs),
          formatSize(sizeBytes),
          statusColor(status),
        ].join(" ");

        process.stdout.write(`${logString}\n`);
      } else if (log.type === "error") {
        const { level, time, method, path, status, durationNs, err } = log;

        const logString = [
          formatTime(time),
          formatLevel(level),
          chalk.white(method.padEnd(3)),
          path.padEnd(30),
          formatDuration(durationNs),
          chalk.gray("".padStart(7)),
          chalk.red(status),
        ].join(" ");

        process.stdout.write(`${logString}\n`);
        process.stdout.write(`${chalk.red(err.stack)}\n`);
      } else {
        const { level, time, msg } = log;
        process.stdout.write(
          `${formatTime(time)} ${formatLevel(level)} ${chalk.white(msg)}\n`,
        );
      }

      callback();
    },
  });

  return pino({ level: "info" }, prettyStream);
}

interface StoreData {
  beforeTime: bigint;
}

export const loggerPlugin = new Elysia({ name: "logger" })
  .decorate("logger", createPinoInstance())
  .onStart(() => {
    console.log(`Running on localhost:3000`);
  })
  .onRequest(({ store }) => {
    (store as StoreData).beforeTime = process.hrtime.bigint();
  })
  .onAfterResponse({ as: "global" }, ({ request, set, store, logger }) => {
    const { beforeTime } = store as StoreData;

    const durationNs = Number(process.hrtime.bigint() - beforeTime);
    const path = new URL(request.url).pathname;
    const status = set.status ?? 200;
    const sizeBytes = Number(set.headers["content-length"] ?? 0);

    logger.info({
      type: "request",
      method: request.method,
      path,
      status,
      durationNs,
      sizeBytes,
    });
  });
