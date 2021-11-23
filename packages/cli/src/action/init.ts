import fetch from '../utils/fetch'
import { execCommand } from '../utils'
import { version } from '../../../template/package.json'
import configManager from '../manager/config'

const DEFAULT_JSON = `https://cdn.jsdelivr.net/gh/calibur-tv/skr@main/packages/template/init.json?v=${version}`
const extendData = new Set()

const request = async (
  url: string,
  data: Record<string, any>
): Promise<void> => {
  console.log('loading init file...', url)
  const resp = await fetch(url)
  const json = resp ? JSON.parse(resp) : {}
  if (json.extends && !extendData.has(json.extends)) {
    extendData.add(json.extends)
    await request(json.extends, data)
  }
  data = Object.assign(data, json)
}

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
  const respData = {}
  await request(requestUrl, respData)
  configManager.set(respData)
  console.log('skr init success！')
}
