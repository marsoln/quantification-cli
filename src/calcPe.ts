import { createPromptModule } from 'inquirer'

import defaultConfig from './utils/runtimeConf'

import { grahamValue } from './graham'

let defaultVals = defaultConfig.calc

export default async function () {
  const {
    buybackValue,
    currentPrice,
    amountLeft,
    incomeBuybackRatio,
    buybackTimesOfYear,
    valueGrowthOfYear,
  } = await createPromptModule()([
    {
      type: 'input',
      name: 'buybackValue',
      message: '回购费用',
      default: defaultVals.buybackValue,
    },
    {
      type: 'input',
      name: 'currentPrice',
      message: '当前价格',
      default: defaultVals.currentPrice,
    },
    {
      type: 'input',
      name: 'amountLeft',
      message: '剩余数量',
      default: defaultVals.amountLeft,
    },
    {
      type: 'input',
      name: 'incomeBuybackRatio',
      message: '回购比例',
      default: defaultVals.incomeBuybackRatio,
    },
    {
      type: 'input',
      name: 'buybackTimesOfYear',
      message: '每年回购次数',
      default: defaultVals.buybackTimesOfYear,
    },
    {
      type: 'input',
      name: 'valueGrowthOfYear',
      message: '每年市值增速(%)',
      default: defaultVals.valueGrowthOfYear,
    },
  ])

  if (buybackValue && currentPrice && amountLeft) {
    defaultVals = {
      buybackValue,
      currentPrice,
      amountLeft,
      incomeBuybackRatio,
      buybackTimesOfYear,
      valueGrowthOfYear,
    }

    // 回购金额
    const buybackCostPerYear = buybackValue * buybackTimesOfYear

    let annualIncome = buybackCostPerYear / incomeBuybackRatio
    let futureAmountLeft = +amountLeft
    let MarketValue = currentPrice * +amountLeft
    let counter = 0

    const PE = MarketValue / annualIncome
    const futureBuybacksByYears = []

    do {
      const {
        profitPerStock,
        profitAfterSevenYears,
        valuePerStock,
      } = grahamValue(
        annualIncome,
        1,
        futureAmountLeft,
        valueGrowthOfYear,
        valueGrowthOfYear,
      )
      const reasonablePrice = MarketValue / futureAmountLeft
      const amountBB = buybackCostPerYear / reasonablePrice
      futureBuybacksByYears.push({
        MarketValue: MarketValue.fmt(),
        Price: reasonablePrice.fmt(),
        Profit: profitPerStock.fmt(),
        ROI: (100 / PE).fmt() + '%',
        PE: PE.fmt(),
        BuybackAmount: amountBB.fmt(),
        StockLeft: futureAmountLeft.fmt(),
        PriceRiseRatio:
          ((reasonablePrice / currentPrice - 1) * 100).fmt() + '%',
        GrahamProfitAfter7Years: profitAfterSevenYears.fmt(),
        GrahamValuePerStock: valuePerStock.fmt(),
      })
      futureAmountLeft -= amountBB
      MarketValue *= 1 + +valueGrowthOfYear / 100
      annualIncome *= 1 + +valueGrowthOfYear / 100
    } while (++counter && futureAmountLeft > 1000 && counter <= 50)

    console.table(futureBuybacksByYears)
  } else {
    console.warn(`参数错误 ❌`)
  }
}
