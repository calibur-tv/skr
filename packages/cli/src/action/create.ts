import path from 'path'
import { pascalCase, paramCase, camelCase } from 'change-case'
import { promptWithDefault, getRemotePackageInfo } from '../utils'
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
    console.log('输入的 template 错误')
    return
  }
  const packages: Record<string, any>[] = await Promise.all(
    templateInfo.urls.map((pkgName: string) => getRemotePackageInfo(pkgName))
  )
  for (const pkg of packages) {
    await writeTemplate(pkg.filepath, path.join(opts.dest || '', name), {
      name: {
        pascalCase: pascalCase(name),
        paramCase: paramCase(name),
        camelCase: camelCase(name)
      }
    })
  }
}
