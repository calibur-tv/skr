import fs from 'fs'
import path from 'path'
import { spawn, exec } from 'child-process-promise'
import toposort from 'toposort'
import urllib from 'urllib'
import compressing from 'compressing'

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
    release: stdout?.split('-')?.pop()?.replace('.tgz', '').trim() || '',
    download: stdout,
    filepath: ''
  }

  const filepath = path.resolve(root, name, result.release)
  if (!fs.existsSync(filepath)) {
    const rest = await urllib.request(result.download, {
      streaming: true,
      followRedirect: true
    })

    await compressing.tgz.uncompress(rest.res as any, filepath)
  }

  result.filepath = filepath + '/package'

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

const getPackageDependencies = async (
  packageName: string,
  list?: Record<string, any>[],
  tsort?: [string, string][]
) => {
  if (!list) {
    const repositoryPackages = await getRepositoryPackages(true)
    list = repositoryPackages.detail
  }

  if (!tsort) {
    tsort = []
  }

  const core = async (
    name: string,
    list: Record<string, any>[]
  ): Promise<string[]> => {
    const json = await getPkgJson(name)
    const dependencies = Object.keys(json?.dependencies || {})
    return list.filter((_) => dependencies.includes(_.name)).map((_) => _.name)
  }

  const dependencies = await core(packageName, list as Record<string, any>[])
  if (dependencies.length) {
    dependencies.forEach((dependencyName: string) => {
      ;(tsort as [string, string][]).push([packageName, dependencyName])
    })

    for (let i = 0; i < dependencies.length; i++) {
      await getPackageDependencies(dependencies[i], list, tsort)
    }
  }

  return toposort(tsort).reverse()
}

export {
  execCommand,
  getRepositoryPackages,
  getPackageDependencies,
  updatePackageJson,
  getRemotePackageInfo
}
