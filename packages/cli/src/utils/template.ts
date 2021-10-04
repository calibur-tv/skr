import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { getRemotePackageInfo } from './index'

// https://github.com/mde/ejs/blob/main/lib/ejs.js#L60
const _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)'
const regex = new RegExp(_REGEX_STRING)
const TEMPLATE_CONF_FILE = '.template.js'
const TEMPLATE_INFO_FILE = 'package.json'

const write = async (
  input: string,
  output: string,
  opts: Record<string, any> = {}
) => {
  const files = fs.readdirSync(input)
  const hasInfoFile = files.indexOf(TEMPLATE_INFO_FILE) !== -1
  const versionMap: Record<string, string> = {}

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
      if (regex.test(versionName)) {
        needCheck.push(versionName.split(regex)[2].trim())
      }
    }

    const versionArr = await Promise.all(
      needCheck.map((_: string) => getRemotePackageInfo(_, false))
    )
    versionArr.forEach((item: any) => {
      versionMap[item.name] = item.version
    })
  }

  let config = {
    ...versionMap,
    ...opts
  }

  const hasConfigFile = files.indexOf(TEMPLATE_CONF_FILE) !== -1
  if (hasConfigFile) {
    const configScript = await import(path.join(input, TEMPLATE_CONF_FILE))
    const configData = await configScript({ ...config })
    config = {
      ...config,
      ...configData
    }
  }

  for (const filename of files.filter(
    (_: string) => _ !== TEMPLATE_CONF_FILE
  )) {
    copy(
      path.join(input, filename),
      path.join(process.cwd(), output, filename.replace('_', '.')),
      config
    )
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

export default write
