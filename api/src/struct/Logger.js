const {
    createLogger,
    format,
    transports
} = require("winston");

const path = require("path");


function getFileName(module) {
    let pathArray = module.filename.split(path.sep);
    return pathArray[pathArray.length - 1];
}

// Setup logger
const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        // include error stack in log
        format.errors({
            stack: true,
        }),
        format.json()
    ),
    defaultMeta: {},
    transports: [
        // write errors to error.log
        new transports.File({
            filename: "error.log",
            level: "error",
        }),

        // write everything to general log file
        new transports.File({
            filename: "general.log",
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
        return `${level} [${timestamp}] : ${message} ${ error || ""}`
    });

    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(), customFormat
        )
    }));
}


module.exports = function (module, serviceName) {
    if (serviceName) {
        logger.defaultMeta = {
            serviceName: serviceName
        };
    }

    const fileName = getFileName(module);
    return {

        // return custom functions to prepend the name of the file to the message (for easier debugging);
        info: function (message) {
            logger.info(message);
        },
        error: function (message, error) {
            logger.error(`[${fileName}] ${message}`, error);
        },
        warn: function (message) {
            logger.error(`[${fileName}] ${message}`);
        }
    }
}