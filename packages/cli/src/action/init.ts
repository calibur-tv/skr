import defu from 'defu'
import fetch from '../utils/fetch'
import { execCommand } from '../utils'
import { version } from '../../../template/package.json'
import configManager from '../manager/config'
import boot from './boot'

const extDefu = defu.extend((obj, key, value) => {
  if (key === 'templates') {
    obj[key] = {
      ...obj[key],
      ...value
    }
    return true
  }
})

const DEFAULT_JSON = `https://cdn.jsdelivr.net/gh/calibur-tv/skr@main/packages/template/init.json?v=${version}`
const extendData = new Set()

const request = async (
  url: string,
  data: Record<string, any>
): Promise<Record<string, any>> => {
  console.log('loading init file...', url)
  const resp = await fetch(url)
  const json = resp ? JSON.parse(resp) : {}
  if (json.extends && !extendData.has(json.extends)) {
    extendData.add(json.extends)
    data = await request(json.extends, data)
  }
  return extDefu(json, data)
}

export default async (options: Record<string, any>) => {
  console.log('skr init start！')
  const pkgName = options.pkg
  if (pkgName) {
    await boot(pkgName, {})
  } else {
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
    const requestUrl = options.url || DEFAULT_JSON
    const respData = await request(requestUrl, {})
    configManager.set(respData)
  }
  console.log('skr init success！')
}
