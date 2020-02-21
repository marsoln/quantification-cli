import * as semver from 'semver'
import * as chalk from 'chalk'

import getVersions from './getVersions'

export default async function checkUpdate() {
  const { current, latest } = await getVersions()

  let title = chalk.bold.blue(`Svc CLI v${current}`)
  const shouldUpdate = semver.gt(latest, current)
  if (shouldUpdate) {
    title += chalk.green(`
┌────────────────────${'─'.repeat(latest.length)}──┐
│  Update available: ${latest}  │
└────────────────────${'─'.repeat(latest.length)}──┘`)
  }
  console.log(title)

  return shouldUpdate
}
