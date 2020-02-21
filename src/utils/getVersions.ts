import { name, version } from '../../package.json'
import { get } from './fetch'

const registry = 'https://registry.npmjs.org'

export default () =>
  get(`${registry}/${name}/latest`).then(res => ({
    current: version,
    latest: res.version,
  }))
