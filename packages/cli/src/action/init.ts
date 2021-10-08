import axios from 'axios'
import { execCommand } from '../utils'
import { version } from '../../../template/package.json'
import configManager from '../manager/config'

const DEFAULT_JSON = `https://cdn.jsdelivr.net/gh/calibur-tv/skr@main/packages/template/init.json?v=${version}`

export default async (opts: Record<string, any>) => {
  console.log('skr init start！')
  try {
    await execCommand('lerna -v', false)
  } catch (e) {
    console.log('installing lerna...')
    await execCommand('npm install lerna -g')
  }
  try {
    await execCommand('yarn -v', false)
  } catch (e) {
    console.log('installing yarn...')
    await execCommand('npm install yarn -g')
  }
  const requestUrl = opts.url || DEFAULT_JSON
  console.log('loading init file...', requestUrl)
  const resp = await axios.get(requestUrl)
  configManager.set(resp.data)
  console.log('skr init success！')
}
