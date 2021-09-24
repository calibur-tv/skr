import inquirer from 'inquirer'
import {
  getRepositoryPackages,
  getPackageDependencies,
  execCommand
} from '../utils'

export default async () => {
  const { list } = await getRepositoryPackages()
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
    `--force-publish=${name},${dependencies.join(',')}`,
    '--yes'
  ]
  await execCommand(`lerna version ${command.join(' ')}`)
  await execCommand('lerna publish from-git --dist-tag beta --yes')
}
