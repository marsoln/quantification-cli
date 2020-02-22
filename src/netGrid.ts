import { createPromptModule } from 'inquirer'
import { SerialQueue } from 'async-task-manager'

import getHuobiApis from './providers/huobiApi'

let defaultVals = {
  price: 3.68,
  amount: 100,
  rate: 35,
  stages: 14,
  min: 2,
  symbol: '',
  appKey: '',
  appSecret: '',
  skip: 0,
  trim: 0,
}

export default async function() {
  const data = []

  const {
    priceStart,
    amountStart,
    growthRate,
    stages,
    min,
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
      name: 'min',
      message: '最小限制?',
      default: defaultVals.min,
    },
  ])

  if (priceStart && amountStart && growthRate) {
    defaultVals.price = +priceStart
    defaultVals.amount = +amountStart
    defaultVals.rate = +growthRate
    defaultVals.stages = +stages
    defaultVals.min = +min

    let amountTotal = 0
    let costTotal = 0
    let amount = +amountStart
    let price = +priceStart
    const priceBaseDiffPerStage = (+priceStart - min) / stages
    for (let index = 0; index < stages; index++) {
      amountTotal += amount
      const cost = amount * price
      costTotal += cost
      const priceDiff =
        (+growthRate > 0
          ? Math.pow(Math.cos(((index / stages) * Math.PI) / 4), 3) +
            stages / growthRate
          : 1) * priceBaseDiffPerStage
      data.push({
        price: price.fmt(),
        priceDiff: priceDiff.fmt(),
        amount: amount.fmt(),
        cost: cost.fmt(),
        priceAvg: (costTotal / amountTotal).fmt(),
        amountTotal: amountTotal.fmt(),
        costTotal: costTotal.fmt(),
      })
      // 下次购买的数量
      amount *= 1 + +growthRate / 100
      // 下次购买的价格
      price -= priceDiff
      if (price <= min) {
        break
      }
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
        message: '是否下单(目前只支持 huobi 平台)?',
        default: false,
      },
    ])

    if (purchase) {
      const {
        symbol,
        appKey,
        appSecret,
        skip = 0,
        trim = 0,
      } = await createPromptModule()([
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
          type: 'password',
          name: 'appSecret',
          message: '输入 AppSecret',
          default: defaultVals.appSecret,
          validate: v => !!v,
        },
        {
          type: 'input',
          name: 'skip',
          message: '跳过起始若干笔订单？',
          default: defaultVals.skip,
          validate: v => +v >= 0,
        },
        {
          type: 'input',
          name: 'trim',
          message: '跳过结尾若干笔订单？',
          default: defaultVals.trim,
          validate: v => +v >= 0,
        },
      ])
      defaultVals = { ...defaultVals, symbol, appKey, appSecret, skip, trim }
      const huobiClient = getHuobiApis(appKey, appSecret)
      const queue = new SerialQueue({ abortAfterFail: false, toleration: 0 })
      const orderData = data
        .slice(+skip)
        .reverse()
        .slice(+trim)

      console.table(orderData)

      const result = await createPromptModule()([
        {
          type: 'confirm',
          name: 'continue',
          message: '确定下单?',
          default: true,
        },
      ])

      if (result.continue) {
        orderData.forEach(({ price, amount }) =>
          queue.add(() => huobiClient.buy_limit(symbol, amount, price)),
        )
        await queue.consume().catch(err => console.log(`下单失败`, err))
      }
    }
  }
}
