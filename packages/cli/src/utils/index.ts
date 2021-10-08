import fs from 'fs'
import path from 'path'
import { spawn, exec } from 'child-process-promise'
import toposort from 'toposort'
import urllib from 'urllib'
import fsExtra from 'fs-extra'
import compressing from 'compressing'
import { Confirm, AutoComplete } from 'enquirer'
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
  const info = await exec(noPrivate ? 'lerna ls --json' : 'lerna ls -a --json')
  const stdout = JSON.parse(info.stdout)
  const pkg = stdout.map((_: Record<string, any>) => {
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
  download = true,
  onlyCheck = false
) => {
  const arr = nameWithSubpath.split('#')
  const name = arr[0]
  const subpath = arr[1] || ''
  const version = (await exec(`npm view ${name} version`)).stdout.trim()
  const tmpRoot = path.resolve(__dirname, '.cache')
  const pkgRoot = path.resolve(tmpRoot, name, version)

  const result = {
    name,
    version,
    filepath: path.join(pkgRoot, 'package', subpath)
  }

  if (onlyCheck) {
    return result
  }

  const formatPackageJson = async () => {
    const packagePath = path.resolve(result.filepath, 'package.json')
    let packageStrs = await fs.promises.readFile(packagePath, 'utf-8')
    if (/_1A_|_2B_|_3C_|_4D_/.test(packageStrs)) {
      return
    }
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
          versionName,
          escapeEjsKey(versionName)
        )
      }
    }
    await fs.promises.writeFile(packagePath, packageStrs)
  }

  if (!download && fs.existsSync(pkgRoot)) {
    await formatPackageJson()
    return result
  }

  console.log(`Downloading ${name}...`)
  fsExtra.emptyDirSync(path.resolve(tmpRoot, name))
  const tarball = (await exec(`npm view ${name} dist.tarball`)).stdout
  const rest = await urllib.request(tarball, {
    streaming: true,
    followRedirect: true
  })
  await compressing.tgz.uncompress(rest.res as any, pkgRoot)
  await formatPackageJson()

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
  choices: string[]
  default?: string
  message?: string
}) => {
  if (!opts.choices.length) {
    console.log('执行操作的选项为空')
    process.exit(1)
    return
  }

  if (opts.default && opts.choices.find((_: string) => _ === opts.default)) {
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

const confirmWithExit = async (message: string) => {
  try {
    const prompt = new Confirm({ name: 'question', message })

    return await prompt.run()
  } catch (e) {
    return false
  }
}

const isEmptyDir = (filepath: string): boolean =>
  !fs.existsSync(filepath) || fs.readdirSync(filepath).length === 0

const makeDirEmpty = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    return
  }

  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file)
    if (fs.lstatSync(abs).isDirectory()) {
      makeDirEmpty(abs)
      fs.rmdirSync(abs)
    } else {
      fs.unlinkSync(abs)
    }
  }
}

export {
  ejsRegex,
  isEmptyDir,
  makeDirEmpty,
  execCommand,
  getRepositoryPackages,
  getPackageDependencies,
  updatePackageJson,
  promptWithDefault,
  confirmWithExit,
  getRemotePackageInfo
}
