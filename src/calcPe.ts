import { createPromptModule } from 'inquirer'

export default async function() {
  const {
    price,
    amountDes,
    amountLeft,
    incomeBuybackRatio,
    buybackTimesOfYear,
  } = await createPromptModule()([
    {
      type: 'input',
      name: 'price',
      message: '输入当前价格',
    },
    {
      type: 'input',
      name: 'amountDes',
      message: '输入本次销毁数量',
    },
    {
      type: 'input',
      name: 'amountLeft',
      message: '剩余数量',
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
  ])

  if (price && amountDes && amountLeft) {
    const expectBuybackAmountOfYear = amountDes * buybackTimesOfYear

    const IncomeOfYear = +(
      (price * expectBuybackAmountOfYear) /
      incomeBuybackRatio
    ).toFixed(2)

    const PE = +(
      (amountLeft / expectBuybackAmountOfYear) *
      incomeBuybackRatio
    ).toFixed(2)

    console.table([
      {
        IncomeOfYear,
        PE,
      },
    ])
  } else {
    console.warn(`参数错误 ❌`)
  }

  process.exit(0)
}
