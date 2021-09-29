import inquirer from 'inquirer'
import {
  getRepositoryPackages,
  getPackageDependencies,
  execCommand
} from '../utils'

export default async (packageName: string, options: Record<string, any>) => {
  const { list, detail } = await getRepositoryPackages()
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
    const item = detail.find(
      (_: Record<string, string>) => _.name === dependencies[i]
    )
    await execCommand(`npm run --prefix ${item.location} build`)
  }
}
