import { createPromptModule } from 'inquirer'
import { SerialQueue } from 'async-task-manager'

import getHuobiApis from './providers/huobiApi'

let defaultVals = {
  price: 4.55,
  amount: 100,
  rate: 50,
  stages: 10,
  minimun: 2,
  symbol: '',
  appKey: '',
  appSecret: '',
  skip: 0,
}

async function exec() {
  const data = []

  const {
    priceStart,
    amountStart,
    growthRate,
    stages,
    priceMinimum,
  } = await createPromptModule()([
    {
      type: 'input',
      name: 'priceStart',
      message: '输入起始价格',
      default: defaultVals.price,
      validate: v => +v > 0,
    },
    {
      type: 'input',
      name: 'amountStart',
      message: '输入起始购买数量',
      default: defaultVals.amount,
      validate: v => +v > 0,
    },
    {
      type: 'input',
      name: 'growthRate',
      message: '输入数量增长率(%)',
      default: defaultVals.rate,
      validate: v => +v > 0,
    },
    {
      type: 'input',
      name: 'stages',
      message: '输入阶段数量?',
      default: defaultVals.stages,
      validate: v => +v > 0,
    },
    {
      type: 'input',
      name: 'priceMinimum',
      message: '最低价格限制?',
      default: defaultVals.minimun,
    },
  ])

  if (priceStart && amountStart && growthRate) {
    defaultVals.price = +priceStart
    defaultVals.amount = +amountStart
    defaultVals.rate = +growthRate
    defaultVals.stages = +stages
    defaultVals.minimun = +priceMinimum

    let amountTotal = 0
    let costTotal = 0
    let amount = +amountStart
    let price = +priceStart
    const priceBaseDiffPerStage = (+priceStart - priceMinimum) / stages
    for (let index = 0; index < stages; index++) {
      amountTotal += amount
      let cost = amount * price
      costTotal += cost
      data.push({
        price: price.toFixed(2),
        amount: amount.toFixed(2),
        cost: cost.toFixed(2),
        priceAvg: (costTotal / amountTotal).toFixed(2),
        amountTotal: amountTotal.toFixed(2),
        costTotal: costTotal.toFixed(2),
      })
      // 下次购买的数量
      amount *= 1 + +growthRate / 100
      // 下次购买的价格
      price -=
        (Math.sqrt(Math.cos((((1 + index / 2) / stages) * Math.PI) / 4)) +
          0.1) *
        priceBaseDiffPerStage
    }
  } else {
    console.warn(`输入参数错误 ❌`)
    console.table([{ priceStart, amountStart, growthRate }])
  }

  console.table(data)

  // 下单
  if (data.length > 0) {
    const { purchase } = await createPromptModule()([
      {
        type: 'confirm',
        name: 'purchase',
        message: '是否下单?',
        default: false,
      },
    ])

    if (purchase) {
      const { symbol, appKey, appSecret, skip } = await createPromptModule()([
        {
          type: 'input',
          name: 'symbol',
          message: '输入交易对',
          default: defaultVals.symbol,
          validate: v => !!v,
        },
        {
          type: 'input',
          name: 'appKey',
          message: '输入 AppKey',
          default: defaultVals.appKey,
          validate: v => !!v,
        },
        {
          type: 'input',
          name: 'appSecret',
          message: '输入 appSecret',
          default: defaultVals.appSecret,
          validate: v => !!v,
        },
        {
          type: 'input',
          name: 'skip',
          message: '跳过前若干笔订单？',
          default: defaultVals.skip,
          validate: v => +v >= 0,
        },
      ])
      defaultVals = { ...defaultVals, symbol, appKey, appSecret, skip }
      const huobiClient = getHuobiApis(appKey, appSecret)
      const queue = new SerialQueue({ abortAfterFail: false, toleration: 0 })
      data
        .slice(+skip)
        // 反过来下单 价格高的最后下单 这样在平台优先展示
        .reverse()
        .forEach(({ price, amount }) =>
          queue.add(() => huobiClient.buy_limit(symbol, amount, price)),
        )
      await queue.consume().catch(err => console.log(`下单失败`, err))
    }
  }
}

export default async function() {
  do {
    await exec()
  } while (
    await createPromptModule()([
      {
        type: 'confirm',
        name: 'continue',
        message: '继续?',
        default: true,
      },
    ]).then(t => t.continue)
  )
  process.exit(0)
}
