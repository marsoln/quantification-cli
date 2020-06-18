import { writeFileSync } from 'fs'
import { resolve } from 'path'

import * as config from '../../config.json'
import { configUrl } from '../../package.json'

import { get } from './fetch'

export type configTypes = 'calc' | 'netgrid'

let defaultConfig = config

export async function updateRuntimeConf() {
  return get(configUrl)
    .then((newConf) => {
      if (newConf) {
        defaultConfig = newConf
        writeFileSync(
          resolve(__dirname, '../../config.json'),
          JSON.stringify(newConf),
        )
      }
    })
    .catch(() => {
      // ignore
    })
}

export function getConfig(type: configTypes) {
  return defaultConfig[type] || ({} as { [key: string]: any })
}
