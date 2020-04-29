import { configUrl } from '../../package.json'
import { get } from './fetch'

export type configTypes = 'calc' | 'netgrid'

let defaultConfig = {
  calc: {
    buybackValue: 1819.58,
    currentPrice: 3.2,
    amountLeft: 30252.61,
    incomeBuybackRatio: 1,
    buybackTimesOfYear: 12,
    valueGrowthOfYear: 5,
  },
  netgrid: {
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
  },
}

export async function updateRuntimeConf() {
  console.log(`更新默认配置...`)
  return get(configUrl).then((config) => {
    if (config) {
      defaultConfig = config
    }
    console.log(`配置更新完毕！`)
  })
}

export function getConfig(type: configTypes) {
  return defaultConfig[type] || ({} as { [key: string]: any })
}
