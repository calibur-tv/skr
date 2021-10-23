import fs from 'fs'
import path from 'path'
import { pascalCase, paramCase, camelCase } from 'change-case'
import {
  promptWithDefault,
  getRemotePackageInfo,
  isEmptyDir,
  makeDirEmpty,
  confirmWithExit,
  isValidPackageName,
  inputWithValidator
} from '../utils'
import configManager from '../manager/config'
import { writeTemplate } from '../utils/template'

export default async (name: string, opts: Record<string, any>) => {
  name = await inputWithValidator({
    message: '请输入项目名',
    initial: name,
    validator: (val) => isValidPackageName(val),
    failed: () => console.log('非法的项目名')
  })
  const config = configManager.get()
  const templates = config.templates || []
  if (!templates.length) {
    console.log('请先通过 template 命令创建模板')
    return
  }

  const templateName = await promptWithDefault({
    choices: templates.map((_: Record<string, any>) => _.name),
    default: opts.template,
    message: '请选择模板'
  })
  const templateInfo = templates.find(
    (_: Record<string, any>) => _.name === templateName
  )
  if (!templateInfo) {
    console.log('不存在的 template')
    return
  }

  const cwd = process.cwd()
  const isMonorepo = fs.existsSync(path.join(cwd, 'lerna.json'))
  let subpath = opts.dest || ''
  if (!subpath && isMonorepo) {
    const workspace = JSON.parse(
      await fs.promises.readFile(path.join(cwd, 'lerna.json'), 'utf-8')
    ).packages
    if (workspace.length === 1) {
      subpath = workspace[0].replace('/*', '')
    } else {
      subpath = await promptWithDefault({
        choices: workspace.map((_: string) => _.replace('/*', ''))
      })
    }
  }

  const dest = path.join(cwd, subpath, name)
  if (!fs.existsSync(path.join(cwd, subpath))) {
    fs.mkdirSync(path.join(cwd, subpath), { recursive: true })
  }

  if (!isEmptyDir(dest)) {
    if (!opts.force) {
      const answer = await confirmWithExit(
        'Target directory is not empty. Remove existing files and continue?'
      )
      if (!answer) {
        return
      }
    }
    makeDirEmpty(dest)
  }

  console.log(`\nScaffolding project...`)

  const nameObj = {
    pascalCase: pascalCase(name),
    paramCase: paramCase(name),
    camelCase: camelCase(name)
  }
  const ejsConfig = {
    name: nameObj,
    isMonorepo
  }

  const packages: Record<string, any>[] = await Promise.all(
    templateInfo.urls.map((pkgName: string) =>
      getRemotePackageInfo(pkgName, !!opts.noCache, false, ejsConfig)
    )
  )

  for (const pkg of packages) {
    await writeTemplate(pkg.filepath, dest, ejsConfig)
  }

  console.log(`\nDone. Now run:\n`)
  if (dest !== cwd) {
    console.log(`  cd ${path.relative(cwd, dest)}`)
  }
  console.log('  yarn')
  console.log('  yarn dev')
  console.log()
}
