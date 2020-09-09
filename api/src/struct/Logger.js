/*
    This file is for logging any events notable events in the API. It uses the Winston logger.
    There are two log files:
        1. general.log - General purpose logging. Everything that is logged is stored in here.
        2. error.log - This log only stores errors, so that debugging is easier.
*/

const { createLogger, format, transports } = require("winston");

// Due to a bug in Winston, the error message is automatically appended to the info message. (https://github.com/winstonjs/winston/issues/1660#issuecomment-512226578)
// This format "unconcatenates" the two messages.
const messageFormat = format(info => {
  if (info.level == "error" && info[Symbol.for("splat")]) {
    const errorMessage = info[Symbol.for("splat")][0].message;
    info.message = info.message.replace(errorMessage, "");
  }
  return info;
});

// Setup loggers
const logger = createLogger({
  level: "info", // Minimum log level is 'info' (General events of interest)
  format: format.combine(
    messageFormat(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss" // Store the time each log entry was created.
    }),
    format.json() // Store the logs in JSON format.
  ),
  transports: [
    // Write errors to error.log
    new transports.File({
      filename: "./error.log",
      level: "error"
    }),

    // Write everything to general log file
    new transports.File({
      filename: "./general.log"
    })
  ]
});

// If not in production, log to console and colorize output for debugging purposes.
if (process.env.NODE_ENV !== "production") {
  const customFormat = format.printf(({ level, message, timestamp, error }) => {
    return `${level} [${timestamp}] : ${message} ${error || ""}`;
  });

  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), customFormat)
    })
  );
}

module.exports = logger;
