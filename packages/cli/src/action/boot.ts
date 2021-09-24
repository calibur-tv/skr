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
  for (let i = 0; i < dependencies.length; i++) {
    await execCommand(`lerna run build:${dependencies[i]}`)
  }
}
