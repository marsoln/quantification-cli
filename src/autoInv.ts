import { createPromptModule } from 'inquirer'

const base = 0

export default async function () {
  const { APY, years, costPerMonth } = await createPromptModule()([
    {
      type: 'input',
      name: 'APY',
      message: '预计年化收益',
      default: 0.08,
    },
    {
      type: 'input',
      name: 'years',
      message: '定投时长（年）',
      default: 30,
    },
    {
      type: 'input',
      name: 'costPerMonth',
      message: '每月定投额度（万元）',
      default: 2.5,
    },
  ])

  if (APY && years && costPerMonth) {
    const logs = []
    let total = base

    for (let i = 1; i <= years; i++) {
      for (let m = 0; m < 12; m++) {
        total = (total + costPerMonth) * (1 + APY / 12)
      }
      const cost = base + costPerMonth * 12 * i
      logs.push({
        year: i,
        cost,
        total,
        profit: (((total - cost) / cost) * 100).toFixed(2) + '%',
      })
    }

    console.table(logs)
    const last = logs[logs.length - 1]
    console.log(
      `定投 ${years} 年后，本息总计 ${total} 万元，其中本金 ${last.cost.toFixed(
        2,
      )} 万元，收益 ${(last.total - last.cost).toFixed(2)} 万元，收益率 ${
        last.profit
      }`,
    )
  } else {
    console.warn(`参数错误 ❌`)
  }
}
