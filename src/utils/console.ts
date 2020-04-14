const isDebug = process.env.NODE_ENV === 'debug'

enum LogLevel {
  error,
  warn,
  info,
  debug,
}

const currLevel = isDebug ? LogLevel.debug : LogLevel.info

export function log(...args: any[]) {
  if (currLevel >= LogLevel.info) {
    if (args.length === 1 && args[0] instanceof Array) {
      console.table(args[0])
    } else {
      console.log(...args)
    }
  }
}

export function debug(...args: any[]) {
  if (currLevel >= LogLevel.debug) {
    console.debug(...args)
  }
}

export function error(...args: any[]) {
  if (currLevel >= LogLevel.error) {
    console.error(...args)
  }
}

export function warn(...args: any[]) {
  if (currLevel >= LogLevel.warn) {
    console.warn(...args)
  }
}
