import fs from 'fs'
import path from 'path'
import { spawn, exec } from 'child-process-promise'
import toposort from 'toposort'
import urllib from 'urllib'
import compressing from 'compressing'
import { AutoComplete } from 'enquirer'

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

const getRemotePackageInfo = async (name: string) => {
  const { stdout } = await exec(`npm view ${name} dist.tarball`)
  const root = path.resolve(__dirname, '.cache')

  const result = {
    version: stdout?.split('-')?.pop()?.replace('.tgz', '').trim() || '',
    filepath: '',
    packageJson: {}
  }

  const filepath = path.resolve(root, name, result.version)
  if (!fs.existsSync(filepath)) {
    const rest = await urllib.request(stdout, {
      streaming: true,
      followRedirect: true
    })

    await compressing.tgz.uncompress(rest.res as any, filepath)
  }

  result.filepath = filepath + '/package'
  result.packageJson = JSON.parse(
    await fs.promises.readFile(
      path.resolve(result.filepath, 'package.json'),
      'utf-8'
    )
  )

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
  execCommand,
  getRepositoryPackages,
  getPackageDependencies,
  updatePackageJson,
  promptWithDefault,
  getRemotePackageInfo
}
