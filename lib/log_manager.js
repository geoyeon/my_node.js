var winston = require('winston');
var winstonDaily = require("winston-daily-rotate-file");
var date = require("date-and-time");

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level:'debug',
            colorize: true
        }),
        new winston.transports.DailyRotateFile({
            level:'error',
            filename: 'Error',
            maxsize: 1000 * 1024,
            datePattern: '.yyyy-MM-dd.log',   // app-debug.yyyy-MM-dd.log 파일로 저장됨
            timestamp: function() {return date.format(new Date(),"YYYY-MM-DD HH:mm:ss"); }
        })
    ],
    exceptionHandlers: [ // uncaughtException 발생시 처리
        new (winstonDaily)({
                name: 'exception-file',
                filename: 'Exception',
                datePattern: '.yyyy-MM-dd.log',
                colorize: false,
                maxsize: 50000000,
                maxFiles: 1000,
                level: 'error',
                showLevel: true,
                json: false,
                timestamp: function() {return date.format(new Date(),"YYYY-MM-DD HH:mm:ss"); }
        }),
        new (winston.transports.Console)({
                name: 'exception-console',
                colorize: true,
                level: 'debug',
                showLevel: true,
                json: false,
                timestamp: function() {return date.format(new Date(),"YYYY-MM-DD HH:mm:ss"); }
        })
    ]
});

module.exports = logger;
