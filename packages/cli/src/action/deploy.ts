import fs from 'fs'
import path from 'path'
import { execCommand, getRepositoryPackages } from '../utils'

const removeLerna = async () => {
  await fs.promises.unlink(path.resolve('./lerna.json'))
  const pkg = JSON.parse(
    await fs.promises.readFile(path.resolve('./package.json'), 'utf-8')
  )
  delete pkg.workspaces

  await fs.promises.writeFile(
    path.resolve('./package.json'),
    JSON.stringify(pkg, null, 2)
  )
}

export default async (opts: Record<string, any>) => {
  const deployScript = opts.script
    ? await import(path.join(process.cwd(), opts.script))
    : null
  const { detail } = await getRepositoryPackages()
  let remove
  const info = detail.find((_: Record<string, any>) => _.name === opts.project)
  if (deployScript?.beforeUnlinkLerna) {
    remove = await deployScript?.beforeUnlinkLerna(opts, {
      exec: execCommand,
      info
    })
  }
  if (remove !== false) {
    await removeLerna()
  }
  if (deployScript?.afterUnlinkLerna) {
    await deployScript?.afterUnlinkLerna(opts, {
      exec: execCommand,
      info
    })
  }
}
