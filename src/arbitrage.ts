import { createPromptModule } from 'inquirer'

export default async function () {
  const {
    spotPrice,
    futurePrice,
    leverage,
    closing,
  } = await createPromptModule()([
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
      name: 'leverage',
      message: '杠杆率',
      default: 0.5,
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
    const ROI = (((priceDiffAbs / spotPrice) * 100) / 2) * (1 + leverage)
    const APY = ROI / closingYearRatio
    console.table([
      {
        ROI: ROI.fmt() + '%',
        APY: APY.fmt() + '%',
      },
    ])
  } else {
    console.warn(`参数错误 ❌`)
  }
}
