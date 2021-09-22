import fs from 'fs'
import { spawn, exec } from 'child-process-promise'

const execCommand = (action: string, log = true): Promise<any> => {
  const arr: string[] = action.split(' ')
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

const getPackagesInfo = async () => {
  const info = await exec('lerna ls --json')
  const stdout = JSON.parse(info.stdout)
  const pkg = stdout.map((_: Record<string, any>) => {
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
  const stat = await exec(`npm view ${name} dist.tarball`)
  return {
    release: stat?.stdout?.split('-')?.pop()?.replace('.tgz', '').trim(),
    download: stat?.stdout
  }
}

const getPkgJson = async (name: string): Promise<Record<string, any>> => {
  const { detail } = await getPackagesInfo()
  const pkg = detail.find((_: Record<string, any>) => _.name === name)
  if (!pkg) {
    // TODO
  }
  return JSON.parse(fs.readFileSync(`${pkg.location}/package.json`, 'utf-8'))
}

const updatePackageJson = async (name: string, value: string): Promise<any> => {
  const { detail } = await getPackagesInfo()
  const pkg = detail.find((_: Record<string, any>) => _.name === name)
  if (!pkg) {
    // TODO
  }
  // @ts-ignore
  fs.writeFileSync(`${pkg.location}/package.json`, JSON.stringify(value, '', 2))
}

const getDependencies = async (
  name: string,
  list: Record<string, any>[]
): Promise<string[]> => {
  const json = await getPkgJson(name)
  const dependencies = Object.keys(json?.dependencies || {})
  return list.filter((_) => dependencies.includes(_.name)).map((_) => _.name)
}

export {
  execCommand,
  getPackagesInfo,
  getDependencies,
  updatePackageJson,
  getRemotePackageInfo
}
