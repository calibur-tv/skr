import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import axios from 'axios'
import { ejsRegex, getRemotePackageInfo } from './index'

const TEMPLATE_CONF_FILE = '.template.js'
const TEMPLATE_INFO_FILE = 'package.json'

const escapeEjsKey = (key: string): string =>
  key
    .replace(/@/g, '_1A_')
    .replace(/\//g, '_2B_')
    .replace(/-/g, '_3C_')
    .replace(/\./g, '_4D_')

const unescpaeEjsKey = (key: string): string =>
  key
    .replace(/_1A_/g, '@')
    .replace(/_2B_/g, '/')
    .replace(/_3C_/g, '-')
    .replace(/_4D_/g, '.')

const isFunction = (val: any): boolean => val && typeof val === 'function'

const writeTemplate = async (
  input: string,
  output: string,
  opts: Record<string, any> = {}
) => {
  let files = fs.readdirSync(input)
  const hasInfoFile = files.indexOf(TEMPLATE_INFO_FILE) !== -1
  const versionMap: Record<string, string> = {}

  let configResult = {
    ...opts
  }
  let configScript = null
  if (files.indexOf(TEMPLATE_CONF_FILE) !== -1) {
    configScript = await import(path.join(input, TEMPLATE_CONF_FILE))
  }
  if (isFunction(configScript?.beforeCheckVersion)) {
    const hook1Data = await configScript.beforeCheckVersion(
      { ...configResult },
      axios
    )
    configResult = {
      ...configResult,
      ...hook1Data
    }
  }

  if (hasInfoFile) {
    const packageJson = JSON.parse(
      await fs.promises.readFile(path.join(input, TEMPLATE_INFO_FILE), 'utf-8')
    )
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies
    }
    const needCheck = []
    for (const name in dependencies) {
      const versionName = dependencies[name]
      if (ejsRegex.test(versionName)) {
        needCheck.push(versionName.split(ejsRegex)[2].trim())
      }
    }

    const versionArr = await Promise.all(
      needCheck.map((_: string) =>
        getRemotePackageInfo(unescpaeEjsKey(_), false, true, configResult)
      )
    )
    versionArr.forEach((item: any) => {
      versionMap[escapeEjsKey(item.name)] = item.version
    })
  }

  configResult = {
    ...versionMap,
    ...configResult
  }

  if (isFunction(configScript?.afterCheckVersion)) {
    const hook2Data = await configScript.afterCheckVersion(
      { ...configResult },
      axios
    )
    configResult = {
      ...configResult,
      ...hook2Data
    }
  }

  if (isFunction(configScript?.beforeCopyFiles)) {
    const hook3Data = await configScript.beforeCopyFiles(
      { ...configResult },
      [...files],
      axios
    )
    if (hook3Data) {
      files = hook3Data
    }
  }

  for (const filename of files.filter(
    (_: string) => _ !== TEMPLATE_CONF_FILE
  )) {
    copy(
      path.join(input, filename),
      path.join(output, filename.replace('_', '.')),
      configResult
    )
  }

  if (isFunction(configScript?.afterCopyFiles)) {
    await configScript.afterCopyFiles({ ...configResult }, axios)
  }
}

const copy = (src: string, dest: string, config: Record<string, any>): void => {
  const stat = fs.statSync(src)
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
  }
  if (stat.isDirectory()) {
    copyDir(src, dest, config)
  } else {
    const file = fs.readFileSync(src, 'utf-8')
    fs.writeFileSync(dest, ejs.render(file, config))
  }
}

const copyDir = (
  src: string,
  dest: string,
  config: Record<string, any>
): void => {
  fs.mkdirSync(dest, { recursive: true })
  for (const file of fs.readdirSync(src)) {
    copy(path.resolve(src, file), path.resolve(dest, file), config)
  }
}

export { writeTemplate, escapeEjsKey, unescpaeEjsKey }
