import checkUpdate from './utils/checkUpdate'
import { execSync } from 'child_process'
import { name } from '../package.json'

export default () =>
  checkUpdate()
    .then(([shouldUpdate, version]) => {
      if (shouldUpdate) {
        console.info(`开始更新至 ${version}`)
        execSync(`npm i -g ${name}@latest`)
        console.info('更新成功')
      } else {
        console.info('当前安装的版本是最新版本。')
      }
    })
    .catch((err) => {
      console.error(err)
    })
