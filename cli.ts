#!/usr/bin/env node

import './src/utils/polyfill'
import { updateRuntimeConf } from './src/utils/runtimeConf'

import { createPromptModule } from 'inquirer'
import { version } from './package.json'

import update from './src/update'
import calcPe from './src/calcPe'
import graham from './src/graham'
import netGrid from './src/netGrid'
import arbitrage from './src/arbitrage'

const exit = () => {
  console.log('结束退出...')
  process.exit(0)
}

const commands = {
  回购模型价格变动: calcPe,
  格雷厄姆价值计算: graham,
  网格下单策略: netGrid,
  期货套利计算: arbitrage,
  检查更新: update,
  退出: exit,
}

const commandNames = Object.keys(commands)

async function main() {
  do {
    const cmd = await createPromptModule()([
      {
        type: 'list',
        name: 'cmd',
        message: `qtf-cli @${version}\n选择要执行的模块:`,
        default: commandNames[0],
        choices: commandNames,
      },
    ]).then((t) => t.cmd)
    await commands[cmd]()
  } while (
    await createPromptModule()([
      {
        type: 'confirm',
        name: 'continue',
        message: '继续(Y)或者退出(N)?',
        default: true,
      },
    ]).then((t) => t.continue)
  )
}

console.log(`更新默认配置...`)

updateRuntimeConf()
  .then(() => {
    console.log(`配置更新完毕！`)
  })
  .catch((ex) => {
    console.log(`配置更新失败`, ex.message)
  })
  .finally(() => {
    main().finally(exit)
  })
