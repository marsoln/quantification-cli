// import { ConsoleCanvas, colors } from 'console-canvas'

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

// export function drawLogs(items: any[], options: { yAxisName: string }) {
//   if (items && items.length > 0) {
//     const { yAxisName } = options
//     const xExpandRate = 10
//     const xMax = items.length * xExpandRate
//     const points = items.map((item: any) =>
//       Math.floor((+item[yAxisName] * 10) % xMax),
//     )
//     const sortedArr = points.sort((a, b) => a - b)
//     const yMin = sortedArr[0]
//     const yMax = sortedArr.pop()
//     const yDiff = yMax - yMin

//     const canvas = new ConsoleCanvas(xMax, yDiff)
//     console.log(xMax, yDiff)
//     points.forEach((y, x) => {
//       canvas.drawPoint(x * xExpandRate, y - yMin, colors.bg.brGreen)
//     })
//     canvas.print()
//     canvas.finish()
//   }
// }
