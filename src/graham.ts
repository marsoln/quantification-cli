import { createPromptModule } from 'inquirer'

export default async function() {
  const {
    periodIncome,
    amountTotal,
    periodOfYear,
    incomeGrowthInSevenYears,
    incomeGrowthOfRestYears,
  } = await createPromptModule()([
    {
      type: 'input',
      name: 'periodIncome',
      message: '周期收入',
      default: 7030,
    },
    {
      type: 'input',
      name: 'amountTotal',
      message: '股票总量',
      default: 30674,
    },
    {
      type: 'input',
      name: 'periodOfYear',
      message: '年/周期比',
      default: 12,
    },
    {
      type: 'input',
      name: 'incomeGrowthInSevenYears',
      message: '七年内年收入增速(%)',
      default: 10,
    },
    {
      type: 'input',
      name: 'incomeGrowthOfRestYears',
      message: '后续年收入增速(%)',
      default: 5,
    },
  ])

  const { profitPerStock, profitAfterSevenYears, valuePerStock } = grahamValue(
    periodIncome,
    periodOfYear,
    amountTotal,
    incomeGrowthInSevenYears,
    incomeGrowthOfRestYears,
  )

  console.table([
    {
      profitPerStock,
      profitAfterSevenYears,
      valuePerStock,
    },
  ])
}

export function grahamValue(
  periodIncome: number,
  periodOfYear: number,
  amountTotal: number,
  incomeGrowthInSevenYears: number,
  incomeGrowthOfRestYears: number,
) {
  // 年度收入
  const annualIncome = periodIncome * periodOfYear
  // 每股收益
  const profitPerStock = annualIncome / amountTotal
  // 7 年后收益
  const profitAfterSevenYears =
    profitPerStock * Math.pow(1 + incomeGrowthInSevenYears / 100, 7)
  // 每股内在价值
  const valuePerStock =
    profitAfterSevenYears * (8.5 + 2 * incomeGrowthOfRestYears)
  return { profitPerStock, profitAfterSevenYears, valuePerStock }
}
