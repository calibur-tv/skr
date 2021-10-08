import axios from 'axios'
import { execCommand } from '../utils'
import configManager from '../manager/config'

const DEFAULT_JSON =
  'https://cdn.jsdelivr.net/gh/calibur-tv/skr@master/packages/template/init.json'

export default async (opts: Record<string, any>) => {
  console.log('skr init start！')
  try {
    await execCommand('npm list lerna', false)
  } catch (e) {
    await execCommand('npm install lerna -g')
  }
  try {
    await execCommand('yarn -v', false)
  } catch (e) {
    await execCommand('npm install yarn -g')
  }
  const requestUrl = opts.url || DEFAULT_JSON
  const resp = await axios.get(requestUrl)
  configManager.set(resp.data)
  console.log('skr init success！')
}
