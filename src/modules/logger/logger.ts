import winston from 'winston'
const { combine, timestamp, label, prettyPrint, json } = winston.format

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.Console({
//       format: winston.format.simple()
//     }),
//     new winston.transports.File({ filename: 'logs.log' })
//   ]
// });

const logger = winston.createLogger({
  //   level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'logs.log' }),
  ],
})

// logger.log({
//   level: 'info',
//   message: 'This is a log message.'
// });

export default logger
