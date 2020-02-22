#!/usr/bin/env node

import './src/utils/polyfill'

import * as chalk from 'chalk'
import * as program from 'commander'

import { version } from './package.json'

import update from './src/update'
import calcPe from './src/calcPe'
import netGrid from './src/netGrid'
import arbitrage from './src/arbitrage'

program.version(version).usage('<command> [options]')

program
  .command('update')
  .description('检查更新')
  .action(update)

program
  .command('pe')
  .description('计算市值盈利比')
  .action(calcPe)

program
  .command('grid')
  .description('计算网格逐仓')
  .action(netGrid)

program
  .command('arb')
  .description('计算套利')
  .action(arbitrage)

program.arguments('<command>').action(cmd => {
  program.outputHelp()
  console.log('  ' + chalk.red(`未知指令 ${chalk.yellow(cmd)}.`))
  console.log()
})

program.on('--help', () => {
  console.log()
  console.log(`  输入 ${chalk.cyan('qtf-cli <command> --help')} 查看指令详情`)
  console.log()
})

program.commands.forEach((c: program.Command) =>
  c.on('--help', () => console.log()),
)

// enhance common error messages
const enhanceErrorMessages = (methodName: string, log: Function) => {
  program.Command.prototype[methodName] = function(...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return
    }
    this.outputHelp()
    console.log('  ' + chalk.red(log(...args)))
    console.log()
    process.exit(1)
  }
}

enhanceErrorMessages('missingArgument', (argName: string) => {
  return `缺少必要参数 ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', (optionName: string) => {
  return `未知参数 ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option: any, flag: boolean) => {
  return (
    `缺少参数值 ${chalk.yellow(option.flags)}` +
    (flag ? `, got ${chalk.yellow(flag)}` : '')
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

function cleanArgs(cmd: any) {
  const args = {}
  cmd.options.forEach((o: any) => {
    const key = o.long.replace(/^--/, '')
    if (typeof cmd[key] !== 'function') {
      args[key] = cmd[key]
    }
  })
  return args
}
