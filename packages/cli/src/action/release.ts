import inquirer from 'inquirer'
import { exec } from 'child-process-promise'
import {
  getRepositoryPackages,
  getPackageDependencies,
  execCommand
} from '../utils'

export default async () => {
  const { list, detail } = await getRepositoryPackages(true)
  const { name } = await inquirer.prompt({
    type: 'list',
    name: 'name',
    message: 'message',
    choices: list
  })

  const dependencies = await getPackageDependencies(name)
  const command = [
    'prepatch',
    '--preid beta',
    '--exact',
    `--force-publish=${dependencies.join(',')}`,
    '--yes'
  ]
  await execCommand(`lerna version ${command.join(' ')}`)
  for (let i = 0; i < dependencies.length; i++) {
    const item = detail.find(
      (_: Record<string, string>) => _.name === dependencies[i]
    )
    await exec(`'cd ${item.location} && npm publish'`)
  }
}
