import path from 'path'
import { pascalCase, paramCase, camelCase } from 'change-case'
import {
  promptWithDefault,
  getRemotePackageInfo,
  isEmptyDir,
  makeDirEmpty,
  confirmWithExit
} from '../utils'
import configManager from '../manager/config'
import { writeTemplate } from '../utils/template'

export default async (name: string, opts: Record<string, any>) => {
  const config = configManager.get()
  const templates = config.templates || []
  if (!templates.length) {
    console.log('请先通过 template 命令创建模板')
    return
  }

  const templateName = await promptWithDefault({
    choices: templates,
    default: opts.template
  })
  const templateInfo = templates.find(
    (_: Record<string, any>) => _.name === templateName
  )
  if (!templateInfo) {
    console.log('不存在的 template')
    return
  }

  const cwd = process.cwd()
  const dest = path.join(cwd, opts.dest || '', name)
  if (!isEmptyDir(dest)) {
    const answer = await confirmWithExit(
      'Target directory is not empty. Remove existing files and continue?'
    )
    if (!answer) {
      return
    }
    makeDirEmpty(dest)
  }

  console.log(`\nScaffolding project...`)

  const packages: Record<string, any>[] = await Promise.all(
    templateInfo.urls.map((pkgName: string) => getRemotePackageInfo(pkgName))
  )

  for (const pkg of packages) {
    await writeTemplate(pkg.filepath, dest, {
      name: {
        pascalCase: pascalCase(name),
        paramCase: paramCase(name),
        camelCase: camelCase(name)
      }
    })
  }

  console.log(`\nDone. Now run:\n`)
  if (dest !== cwd) {
    console.log(`  cd ${path.relative(cwd, dest)}`)
  }
  console.log('  yarn')
  console.log('  yarn dev')
  console.log()
}
