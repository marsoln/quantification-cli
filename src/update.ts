import checkUpdate from './utils/checkUpdate'
import { execSync } from 'child_process'
import { name } from '../package.json'

export default () => {
  checkUpdate()
    .then(shouldUpdate => {
      if (shouldUpdate) {
        console.info('开始更新')
        execSync(`npm upgrade -g ${name}`)
        console.info('更新成功')
        process.exit(0)
      } else {
        console.info('当前安装的版本是最新版本。')
      }
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
