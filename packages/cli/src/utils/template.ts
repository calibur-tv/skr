import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { getRemotePackageInfo } from './index'

// https://github.com/mde/ejs/blob/main/lib/ejs.js#L60
const _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)'
const regex = new RegExp(_REGEX_STRING)

const write = async (
  input: string,
  output: string,
  packageJson: Record<string, any> = {}
) => {
  const files = fs.readdirSync(input)
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
  const versionMap: Record<string, string> = {}
  versionArr.forEach((item: any) => {
    versionMap[item.name] = item.version
  })
  const config = {
    ...versionMap
  }

  for (const filename of files) {
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
