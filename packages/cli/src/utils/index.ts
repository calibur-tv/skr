import fs from 'fs'
import path from 'path'
import { spawn, exec } from 'child-process-promise'
import toposort from 'toposort'
import urllib from 'urllib'
import fsExtra from 'fs-extra'
import compressing from 'compressing'
import { AutoComplete } from 'enquirer'
import { escapeEjsKey } from './template'

// https://github.com/mde/ejs/blob/main/lib/ejs.js#L60
const ejsRegex = new RegExp('(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)')

const execCommand = (action: string, log = true): Promise<any> => {
  const arr: string[] = action.trim().split(' ')
  const promise = spawn(arr.shift() as string, arr)
  const childProcess = promise.childProcess

  if (log && childProcess?.stdout) {
    childProcess.stdout.on('data', function (data) {
      console.log(data.toString())
    })
  }

  if (log && childProcess?.stderr) {
    childProcess.stderr.on('data', function (data) {
      console.log(data.toString())
    })
  }

  return promise
}

const getRepositoryPackages = async (noPrivate = false) => {
  const info = await exec('lerna ls --json')
  const stdout = JSON.parse(info.stdout)
  const pkg = stdout
    .filter((_: Record<string, any>) => (noPrivate ? !_.private : true))
    .map((_: Record<string, any>) => {
      return {
        ..._,
        title: _.name,
        value: _.name
      }
    })

  return {
    detail: pkg,
    list: pkg.map((_: Record<string, any>) => _.name)
  }
}

const getRemotePackageInfo = async (
  nameWithSubpath: string,
  download = true
) => {
  const arr = nameWithSubpath.split('#')
  const name = arr[0]
  const subpath = arr[1] || ''
  const { stdout } = await exec(`npm view ${name} dist.tarball`)
  const root = path.resolve(__dirname, '.cache')

  const result = {
    name,
    version: stdout?.split('-')?.pop()?.replace('.tgz', '').trim() || '',
    filepath: ''
  }

  if (!download) {
    return result
  }

  const filepath = path.resolve(root, name, result.version)
  if (!fs.existsSync(filepath)) {
    fsExtra.emptyDirSync(path.resolve(root, name))
    const rest = await urllib.request(stdout, {
      streaming: true,
      followRedirect: true
    })
    await compressing.tgz.uncompress(rest.res as any, filepath)
  }

  result.filepath = path.join(filepath, 'package', subpath)
  const packagePath = path.resolve(result.filepath, 'package.json')
  let packageStrs = await fs.promises.readFile(packagePath, 'utf-8')
  const packageJson = JSON.parse(packageStrs)
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies
  }
  for (const name in dependencies) {
    const versionName = dependencies[name]
    if (ejsRegex.test(versionName)) {
      packageStrs = packageStrs.replace(
        new RegExp(versionName, 'g'),
        escapeEjsKey(versionName)
      )
    }
  }

  await fs.promises.writeFile(packagePath, packageStrs)

  return result
}

const getPkgJson = async (name: string): Promise<Record<string, any>> => {
  const { detail } = await getRepositoryPackages()
  const pkg = detail.find((_: Record<string, any>) => _.name === name)
  if (!pkg) {
    // TODO
  }
  return JSON.parse(
    await fs.promises.readFile(`${pkg.location}/package.json`, 'utf-8')
  )
}

const updatePackageJson = async (name: string, value: string): Promise<any> => {
  const { detail } = await getRepositoryPackages()
  const pkg = detail.find((_: Record<string, any>) => _.name === name)
  if (!pkg) {
    // TODO
  }
  await fs.promises.writeFile(
    `${pkg.location}/package.json`,
    JSON.stringify(value, null, 2)
  )
}

const getPackageDependencies = async (packageName: string, withSelf = true) => {
  const { detail } = await getRepositoryPackages(true)
  const sort: [string, string][] = []

  const outer = async (
    name: string,
    list: Record<string, any>[],
    tSort: [string, string][]
  ) => {
    const inner = async (
      name: string,
      list: Record<string, any>[]
    ): Promise<string[]> => {
      const json = await getPkgJson(name)
      const dependencies = Object.keys(json?.dependencies || {})
      return list
        .filter((_) => dependencies.includes(_.name))
        .map((_) => _.name)
    }

    const dependencies = await inner(name, list as Record<string, any>[])
    if (dependencies.length) {
      dependencies.forEach((dependencyName: string) => {
        tSort.push([name, dependencyName])
      })

      for (let i = 0; i < dependencies.length; i++) {
        await outer(dependencies[i], list, tSort)
      }
    }

    return toposort(tSort).reverse()
  }

  let result: string[] = await outer(packageName, detail, sort)
  if (withSelf) {
    result.push(packageName)
  } else {
    result = result.filter((_) => _ !== packageName)
  }

  return [...new Set(result)]
}

const promptWithDefault = async (opts: {
  name?: string
  choices: any[]
  default?: string
  message?: string
}) => {
  if (opts.default) {
    return opts.default
  }

  const { name = 'name', message = 'message', choices = [] } = opts

  try {
    const prompt = new AutoComplete({
      name,
      message,
      choices
    })
    return await prompt.run()
  } catch (e) {
    process.exit()
  }
}

export {
  ejsRegex,
  execCommand,
  getRepositoryPackages,
  getPackageDependencies,
  updatePackageJson,
  promptWithDefault,
  getRemotePackageInfo
}
