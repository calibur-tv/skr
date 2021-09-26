import inquirer from 'inquirer'
import {
  getRepositoryPackages,
  getPackageDependencies,
  execCommand
} from '../utils'

export default async (packageName: string, options: Record<string, any>) => {
  const { list } = await getRepositoryPackages()
  if (!packageName) {
    const { name } = await inquirer.prompt({
      type: 'list',
      name: 'name',
      message: 'message',
      choices: list
    })
    packageName = name
  }

  if (options.clean) {
    await execCommand('lerna clean --yes')
  }

  const dependencies = await getPackageDependencies(packageName)
  for (let i = 0; i < dependencies.length; i++) {
    await execCommand(`lerna run build:${dependencies[i]}`)
  }
}
