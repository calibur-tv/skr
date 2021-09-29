import {
  getRepositoryPackages,
  getPackageDependencies,
  execCommand,
  promptWithDefault
} from '../utils'

const versionType = [
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

export default async (
  name: string,
  version: string,
  opts: Record<string, any>
) => {
  const { list, detail } = await getRepositoryPackages(true)
  name = await promptWithDefault({
    choices: list
  })
  version = await promptWithDefault({
    choices: versionType
  })

  const dependencies = await getPackageDependencies(name, opts.self)
  const command = [
    version,
    /pre/.test(version) ? '--preid beta' : '',
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
