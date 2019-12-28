const {
    createLogger,
    format,
    transports
} = require("winston");


// Due to a bug in Winston, the error message is automatically appended to the info message. (https://github.com/winstonjs/winston/issues/1660#issuecomment-512226578)
// This format "unconcatenates" the two messages.

const messageFormat = format(info => {
    if (info.level == "error") {
        const errorMessage = info[Symbol.for("splat")][0].message;
        info.message = info.message.replace(errorMessage, "");
    }
    return info
})

// Setup logger
const logger = createLogger({
    level: "info",
    format: format.combine(
        messageFormat(),
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.json(),
    ),
    transports: [
        // write errors to error.log
        new transports.File({
            filename: "../error.log",
            level: "error",
        }),

        // write everything to general log file
        new transports.File({
            filename: "../general.log",
        })
    ]
});

// If not in production, log to console and colorise output
if (process.env.NODE_ENV !== "production") {

    const customFormat = format.printf(({
        level,
        message,
        timestamp,
        error
    }) => {
        return `${level} [${timestamp}] : ${message} ${error|| ""}`
    });

    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(), customFormat
        )
    }));
}


module.exports = logger;