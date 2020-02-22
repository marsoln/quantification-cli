import { createPromptModule } from 'inquirer'

export default async function() {
  const {
    priceBuyBackAvg,
    amountBuyback,
    amountLeft,
    incomeBuybackRatio,
    buybackTimesOfYear,
    displayPeriod,
  } = await createPromptModule()([
    {
      type: 'input',
      name: 'priceBuyBackAvg',
      message: '输入回购平均价格',
      default: 4,
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
      type: 'list',
      name: 'displayPeriod',
      message: '按年/月展示？',
      default: 'Year',
      choices: ['Year', 'Month'],
    },
  ])

  if (priceBuyBackAvg && amountBuyback && amountLeft) {
    // 市值
    const MarketValue = priceBuyBackAvg * +amountLeft

    // 回购金额
    const buybackCostPerYear =
      priceBuyBackAvg * amountBuyback * buybackTimesOfYear

    // 市值盈利比
    const PE = +(
      MarketValue /
      (buybackCostPerYear / incomeBuybackRatio)
    ).toFixed(2)

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
          ['BuypackPrice']: reasonablePrice.fmt(),
          ['BuybackAmount']: futureAmountBuyback.fmt(),
          ['MarketTotal']: futureAmountLeft.fmt(),
          ['PriceRiseRatio']:
            ((reasonablePrice / priceBuyBackAvg - 1) * 100).fmt() + '%',
        })
        futureAmountLeft -= futureAmountBuyback
      } while (++counter && futureAmountLeft > 1000) // 剩余小于 1000 万时退出
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
          ['BuypackPrice']: reasonablePrice.fmt(),
          ['BuybackAmount']: futureAmountBuyback.fmt(),
          ['MarketTotal']: futureAmountLeft.fmt(),
          ['PriceRiseRatio']:
            ((reasonablePrice / priceBuyBackAvg - 1) * 100).fmt() + '%',
        })
        futureAmountLeft -= futureAmountBuyback
      } while (++counter && futureAmountLeft > 1000) // 剩余小于 1000 万时退出
      Object.values(futureBuybacksByMonths).forEach(data => console.table(data))
    }

    console.table([
      {
        ['MarketValue']: MarketValue.fmt(),
        ['PE']: PE.fmt(),
      },
    ])
  } else {
    console.warn(`参数错误 ❌`)
  }

  process.exit(0)
}
