import inquirer from 'inquirer'
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

  const { name2 } = await inquirer.prompt({
    type: 'list',
    name: 'name2',
    message: 'message',
    choices: [
      {
        name: 'major',
        value: 'major'
      },
      {
        name: 'minor',
        value: 'minor'
      },
      {
        name: 'patch',
        value: 'patch'
      },
      {
        name: 'premajor',
        value: 'premajor'
      },
      {
        name: 'preminor',
        value: 'preminor'
      },
      {
        name: 'prepatch',
        value: 'prepatch'
      },
      {
        name: 'prerelease',
        value: 'prerelease'
      }
    ]
  })

  const dependencies = await getPackageDependencies(name)

  const command = [
    name2,
    /pre/.test(name2) ? '--preid beta' : '',
    '--exact',
    '--no-private',
    `--force-publish=${dependencies.join(',')}`,
    '--yes'
  ]
  await execCommand(`lerna version ${command.filter((_) => _).join(' ')}`)
  for (let i = 0; i < dependencies.length; i++) {
    const item = detail.find(
      (_: Record<string, string>) => _.name === dependencies[i]
    )
    await execCommand(`npm publish ${item.location}`)
  }
}
