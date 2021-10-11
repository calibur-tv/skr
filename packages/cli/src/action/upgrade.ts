import { exec } from 'child-process-promise'
import { execCommand } from '../utils'
import { version, name } from '../../package.json'

export default async () => {
  const latest = (await exec(`npm view ${name} version`)).stdout.trim()
  if (latest === version) {
    return
  }

  await execCommand(`npm install ${name} -g`)
  console.log(`${name} is latest version：${latest}！`)
}
