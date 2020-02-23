import { createPromptModule } from 'inquirer'

export default async function() {
  const {
    priceBuyBackAvg,
    amountBuyback,
    amountLeft,
    incomeBuybackRatio,
    buybackTimesOfYear,
    valueGrowthOfYear,
    displayPeriod,
  } = await createPromptModule()([
    {
      type: 'input',
      name: 'priceBuyBackAvg',
      message: '输入回购平均价格',
      default: 3,
    },
    {
      type: 'input',
      name: 'amountBuyback',
      message: '输入本次回购数量',
      default: 405,
    },
    {
      type: 'input',
      name: 'amountLeft',
      message: '剩余数量',
      default: 45500,
    },
    {
      type: 'input',
      name: 'incomeBuybackRatio',
      message: '收入回购比例',
      default: 0.2,
    },
    {
      type: 'input',
      name: 'buybackTimesOfYear',
      message: '每年回购次数',
      default: 12,
    },
    {
      type: 'input',
      name: 'valueGrowthOfYear',
      message: '每年市值增速(%)',
      default: 5,
    },
    {
      type: 'list',
      name: 'displayPeriod',
      message: '按年/月展示？',
      default: 'Year',
      choices: ['Year', 'Month'],
    },
  ])

  if (priceBuyBackAvg && amountBuyback && amountLeft) {
    // 回购金额
    const buybackCostPerYear =
      priceBuyBackAvg * amountBuyback * buybackTimesOfYear

    // 市值
    let MarketValue = priceBuyBackAvg * +amountLeft
    let futureAmountLeft = +amountLeft
    let futureAmountBuyback = +amountBuyback

    let counter = 0

    if (displayPeriod === 'Year') {
      const futureBuybacksByYears = []
      do {
        const reasonablePrice = MarketValue / futureAmountLeft
        futureAmountBuyback = buybackCostPerYear / reasonablePrice
        futureBuybacksByYears.push({
          ['Year']: counter,
          ['MarketValue']: MarketValue.fmt(),
          ['PE']: (MarketValue / (buybackCostPerYear / incomeBuybackRatio)).fmt(),
          ['BuypackPrice']: reasonablePrice.fmt(),
          ['BuybackAmount']: futureAmountBuyback.fmt(),
          ['MarketTotal']: futureAmountLeft.fmt(),
          ['PriceRiseRatio']:
            ((reasonablePrice / priceBuyBackAvg - 1) * 100).fmt() + '%',
        })
        futureAmountLeft -= futureAmountBuyback
        MarketValue *= 1 + +valueGrowthOfYear / 100
      } while (++counter && futureAmountLeft > 1000 && counter <= 50)
      console.table(futureBuybacksByYears)
    } else {
      const futureBuybacksByMonths = {}
      do {
        const reasonablePrice = MarketValue / futureAmountLeft
        futureAmountBuyback =
          buybackCostPerYear / reasonablePrice / buybackTimesOfYear
        const year = Math.ceil((counter + 1) / buybackTimesOfYear)

        if (!futureBuybacksByMonths[year]) {
          futureBuybacksByMonths[year] = []
        }

        futureBuybacksByMonths[year].push({
          ['Year']: year,
          ['PeriodOfYear']: (counter % buybackTimesOfYear) + 1,
          ['MarketValue']: MarketValue.fmt(),
          ['PE']: (MarketValue / buybackCostPerYear / incomeBuybackRatio).fmt(),
          ['BuypackPrice']: reasonablePrice.fmt(),
          ['BuybackAmount']: futureAmountBuyback.fmt(),
          ['MarketTotal']: futureAmountLeft.fmt(),
          ['PriceRiseRatio']:
            ((reasonablePrice / priceBuyBackAvg - 1) * 100).fmt() + '%',
        })
        MarketValue *= 1 + +valueGrowthOfYear / 100 / buybackTimesOfYear
        futureAmountLeft -= futureAmountBuyback
      } while (++counter && futureAmountLeft > 1000 && counter <= 50) // 剩余小于 1000 万时退出
      Object.values(futureBuybacksByMonths).forEach(data => console.table(data))
    }
  } else {
    console.warn(`参数错误 ❌`)
  }
}
