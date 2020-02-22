import { createPromptModule } from 'inquirer'

export default async function() {
  const { spotPrice, futurePrice, closing } = await createPromptModule()([
    {
      type: 'input',
      name: 'spotPrice',
      message: '现货价格',
    },
    {
      type: 'input',
      name: 'futurePrice',
      message: '期货价格',
    },
    {
      type: 'input',
      name: 'closing',
      message: '剩余交割天数',
      default: 90,
    },
  ])

  if (spotPrice && futurePrice && closing) {
    const daysOfYear = 360
    const priceDiff = futurePrice - spotPrice
    const priceDiffAbs = Math.abs(priceDiff)
    const closingYearRatio = closing / daysOfYear
    const roiPct = ((priceDiffAbs / spotPrice) * 100) / 2
    const roiPctOfYear = roiPct / closingYearRatio
    console.table([
      {
        ReturnOfInv: roiPct.fmt() + '%',
        ReturnOfInvByYear: roiPctOfYear.fmt() + '%',
      },
    ])
  } else {
    console.warn(`参数错误 ❌`)
  }
}
